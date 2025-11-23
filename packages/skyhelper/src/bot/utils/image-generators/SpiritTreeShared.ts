/**
 * Shared utilities for Spirit Tree renderers
 */
import { loadImage, type SKRSContext2D, Image, GlobalFonts } from "@napi-rs/canvas";
import type { ISpiritTree, ISpiritTreeTier, INode } from "skygame-data";
import { currency as currencyEmojis } from "@skyhelperbot/constants";
import { CostUtils, resolvePlannerUrl as iconUrl, PlannerService } from "@/planner";
import path from "node:path";

// #region Constants
export const FONT_NAME = "noto-sans";
export const EMOJI_URL = (emoji: string) => `https://cdn.discordapp.com/emojis/${emoji}.png`;

// Register font once
GlobalFonts.registerFromPath(path.join(process.cwd(), `assets/fonts/NotoSans-Regular.ttf`), FONT_NAME);

export interface GenerateSpiritTreeOptions {
  season?: boolean;
  spiritName?: string;
  spiritSubtitle?: string;
  highlightItems?: string[];
  spiritUrl?: string;
  /** Do not reduce the opacity for non unlocked node, which is the default */
  noOpacity?: boolean;
  scale?: number; // multiplier for resolution
}

// #region Image Cache
/**
 * LRU cache to reduce memory load and avoid re-loading images
 */
export class ImageCache {
  private cache = new Map<string, Image>();
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): Image | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: Image): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache(250);

/**
 * Get an image from cache or load it
 */
export async function getImage(url: string): Promise<Image> {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const img = await loadImage(url);
  imageCache.set(url, img);
  return img;
}

// #region Image Preloading
/**
 * Preload images for a node-based tree
 */
export async function preloadNodeTreeImages(tree: ISpiritTree & { node: INode }) {
  const urls = new Set<string>();

  function collect(node?: INode) {
    if (!node) return;
    if (node.item?.icon) urls.add(iconUrl(node.item.icon));
    if (node.item?.season?.iconUrl) urls.add(iconUrl(node.item.season.iconUrl));
    const currencyKey = CostUtils.getCostKey(node);
    if (currencyKey) {
      const curId = currencyEmojis[currencyKey];
      if (curId) urls.add(EMOJI_URL(curId));
    }
    collect(node.n);
    collect(node.nw);
    collect(node.ne);
  }

  collect(tree.node);
  const spirit = PlannerService.getTreeSpirit(tree);
  if (spirit?.imageUrl) urls.add(spirit.imageUrl);

  await Promise.all([...urls].map(getImage));
}

/**
 * Preload images for a tier-based tree
 */
export async function preloadTierTreeImages(tree: ISpiritTree & { tier: ISpiritTreeTier }) {
  const urls = new Set<string>();

  function collectTier(tier?: ISpiritTreeTier) {
    if (!tier) return;
    for (const row of tier.rows) {
      for (const node of row) {
        if (!node) continue;
        if (node.item?.icon) urls.add(iconUrl(node.item.icon));
        if (node.item?.season?.iconUrl) urls.add(iconUrl(node.item.season.iconUrl));
        const currencyKey = CostUtils.getCostKey(node);
        if (currencyKey) {
          const curId = currencyEmojis[currencyKey];
          if (curId) urls.add(EMOJI_URL(curId));
        }
      }
    }
    collectTier(tier.next);
  }

  collectTier(tree.tier);
  const spirit = PlannerService.getTreeSpirit(tree);
  if (spirit?.imageUrl) urls.add(spirit.imageUrl);

  await Promise.all([...urls].map(getImage));
}

// #region Drawing Helpers
/**
 * Draw a line on the canvas
 */
export function drawLine(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width = 4, color = "#F6EAE0") {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/**
 * Draw a connector between two centers, stopping short of the circles by gap
 */
export function drawConnector(
  ctx: SKRSContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 32,
  gap = 6,
  width = 1,
  color = "#F6EAE0",
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0.0001) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const shortenA = Math.min(radius + gap, dist / 2 - 1);
  const shortenB = Math.min(radius + gap, dist / 2 - 1);

  const sx1 = x1 + nx * shortenA;
  const sy1 = y1 + ny * shortenA;
  const sx2 = x2 - nx * shortenB;
  const sy2 = y2 - ny * shortenB;

  drawLine(ctx, sx1, sy1, sx2, sy2, width, color);
}

// #region Item Rendering
/**
 * Draw an item node at the specified position
 */
export async function drawItem(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  size: number,
  node?: INode,
  season = false,
  highlightItems?: string[],
  noOpacity = false,
) {
  const { item } = node ?? {};
  const isUnlocked = !!(item && (item.unlocked ?? item.autoUnlocked));
  const isHighlighted = !!(item && highlightItems?.includes(item.guid));

  ctx.save();
  ctx.translate(x, y);
  if (item && !isUnlocked && !noOpacity) ctx.globalAlpha = 0.5; // faded for unacquired items

  const itemSize = size * 2.5;

  // #region highlight border for highlighted nodes
  if (isHighlighted) {
    const highlightRadius = itemSize * 0.55;
    ctx.strokeStyle = "#FFD700"; // golden color
    ctx.lineWidth = Math.max(4, Math.floor(itemSize * 0.05));
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = Math.max(8, Math.floor(itemSize * 0.15));
    ctx.beginPath();
    ctx.arc(0, 0, highlightRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow
  }

  // #region draw item icon
  if (item?.icon) {
    try {
      const img = await getImage(iconUrl(item.icon));
      ctx.drawImage(img, -itemSize * 0.45, -itemSize * 0.45, itemSize * 0.9, itemSize * 0.9);
    } catch {
      ctx.font = `${Math.floor(size * 0.7)}px ${FONT_NAME}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F6EAE0";
      ctx.fillText(item.icon, 0, 0);
    }
  } else {
    // Placeholder for empty nodes
    try {
      const img = await getImage(EMOJI_URL("1424103034371313924"));
      ctx.drawImage(img, -itemSize * 0.45, -itemSize * 0.45, itemSize * 0.9, itemSize * 0.9);
    } catch {
      ctx.font = `${Math.floor(size * 0.7)}px ${FONT_NAME}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F6EAE0";
      ctx.fillText("?", 0, 0);
    }
  }

  const r = itemSize / 2;
  const cx = Math.max(10, Math.floor(itemSize * 0.25));
  const padding = Math.max(4, Math.floor(itemSize * 0.06));

  // #region season overlay
  if (season && item && (item.group === "SeasonPass" || item.group === "Ultimate") && item.season?.iconUrl) {
    try {
      const badge = await getImage(iconUrl(item.season.iconUrl));
      const bsize = itemSize * 0.4;
      ctx.drawImage(badge, -itemSize / 2, -itemSize / 2, bsize, bsize);
    } catch {
      ctx.fillStyle = "#FFD966";
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.35, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // #region item level
  if (item?.level) {
    const fontSize = Math.max(10, Math.floor(cx * 0.6));
    ctx.font = `${fontSize}px ${FONT_NAME}`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`Lvl${item.level}`, -itemSize / 5, itemSize / 2.25);
  }

  // #region sheet number
  if (item?.sheet) {
    const fontSize = Math.max(10, Math.floor(cx * 0.5));
    ctx.font = `${fontSize}px ${FONT_NAME}`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`#${item.sheet}`, itemSize / 2, -itemSize / 4 - 5);
  }

  // #region unlocked checkmark
  if (item && isUnlocked) {
    const checkRadius = Math.max(8, Math.floor(itemSize * 0.12));
    const badgeX = r * 0.5;
    const badgeY = r * 0.65;

    ctx.strokeStyle = node?.unlocked ? "#24A72B" : "#f9f50cff";
    ctx.lineWidth = Math.max(3, Math.floor(checkRadius * 0.3));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(badgeX - checkRadius * 0.6, badgeY - checkRadius * 0.05);
    ctx.lineTo(badgeX - checkRadius * 0.05, badgeY + checkRadius * 0.4);
    ctx.lineTo(badgeX + checkRadius, badgeY - checkRadius * 0.8);
    ctx.stroke();
  }

  // #region favorite star
  if (item?.favourited) {
    const starSize = Math.max(12, Math.floor(itemSize * 0.15));
    const starX = -r * 0.5;
    const starY = r * 0.4;

    ctx.fillStyle = "#FFD700"; // yellow/gold color
    ctx.save();
    ctx.translate(starX, starY);
    ctx.beginPath();

    // Draw a 5-pointed star
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const pointX = Math.cos(angle) * starSize;
      const pointY = Math.sin(angle) * starSize;
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Optional: Add a slight outline for better visibili"ty
    ctx.strokeStyle = "rgba(239, 20, 20, 0.5)";
    ctx.lineWidth = Math.max(1, Math.floor(starSize * 0.08));
    ctx.stroke();

    ctx.restore();
  }

  // #region cost overlay
  const currencyKey = node && CostUtils.getCostKey(node);
  if (currencyKey) {
    const cost = node[currencyKey]!;
    let iconCenterX = r - padding - cx / 2 + 15;
    if (cost > 99) iconCenterX += itemSize * 0.2; // have more padding for 3 digits
    const iconCenterY = r + 5;
    const curEmojiId = currencyEmojis[currencyKey];

    if (curEmojiId) {
      try {
        const curImg = await getImage(EMOJI_URL(curEmojiId));
        ctx.drawImage(curImg, iconCenterX - cx / 2, iconCenterY - cx / 2, cx, cx);
      } catch {
        ctx.fillStyle = "#FFD966";
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, cx / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const fontSize = Math.max(10, Math.floor(cx * 0.9));
    ctx.font = `${fontSize}px ${FONT_NAME}`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const text = String(cost);

    const textRightX = iconCenterX - cx / 2 - Math.max(4, Math.floor(itemSize * 0.03));
    const measured = ctx.measureText(text);
    const minTextX = -r + padding;
    const textLeftEdge = textRightX - measured.width;
    let finalTextX = textRightX;
    if (textLeftEdge < minTextX) {
      finalTextX = Math.max(textRightX, minTextX + measured.width);
    }
    ctx.fillText(text, finalTextX, iconCenterY);
  }

  ctx.restore();
}

// #region Canvas Background
/**
 * Draw the background image for the spirit tree
 */
export async function drawBackground(ctx: SKRSContext2D, width: number, height: number, spiritImageUrl?: string) {
  if (!spiritImageUrl) return;

  try {
    const bgImg = await getImage(spiritImageUrl);
    const imgW = (bgImg as any).width ?? bgImg.width;
    const imgH = (bgImg as any).height ?? bgImg.height;
    const scaleBg = Math.max(width / imgW, height / imgH);
    const drawW = imgW * scaleBg;
    const drawH = imgH * scaleBg;
    const dx = Math.floor((width - drawW) / 2);
    const dy = Math.floor((height - drawH) / 2);

    ctx.save();
    ctx.filter = `blur(${Math.max(8, Math.round(Math.min(width, height) / 120))}px)`;
    ctx.globalAlpha = 0.35;
    ctx.drawImage(bgImg as any, dx, dy, drawW, drawH);
    ctx.restore();
  } catch {
    // ignore
  }
}

/**
 * Draw the watermark and overlay
 */
export function drawWatermarkAndOverlay(ctx: SKRSContext2D, width: number, height: number) {
  // Watermark
  const watermarkText = "SkyHelper";
  const titleSize = Math.max(18, Math.floor(Math.min(width, height) / 20));
  const subSize = Math.max(12, Math.floor(titleSize / 2));

  ctx.font = `${titleSize}px ${FONT_NAME}`;
  ctx.fillStyle = "rgba(246, 234, 224, 0.6)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(watermarkText, width - titleSize, 20);
  ctx.font = `${subSize}px ${FONT_NAME}`;
  ctx.fillText("A Sky: COTL Discord Bot", width - subSize, titleSize + 20 + subSize / 2);

  // Transparent overlay
  ctx.fillStyle = "rgba(14, 43, 51, 0.35)";
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw spirit name and subtitle
 */
export function drawSpiritText(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  size: number,
  spiritName?: string,
  spiritSubtitle?: string,
) {
  // Spirit name
  if (spiritName) {
    const fontSize = Math.max(16, Math.min(40, Math.floor(size * 1.15)));
    ctx.font = `${fontSize}px ${FONT_NAME}`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(spiritName, x, y);

    // Subtitle below name
    if (spiritSubtitle) {
      const subFontSize = Math.max(12, Math.min(20, Math.floor(size * 0.7)));
      ctx.font = `${subFontSize}px ${FONT_NAME}`;
      ctx.fillStyle = "rgba(246, 234, 224, 0.6)";
      ctx.fillText(spiritSubtitle, x, y + fontSize + 12);
    }
  }
}
