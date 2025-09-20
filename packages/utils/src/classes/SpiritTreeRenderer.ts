import { createCanvas, loadImage, type SKRSContext2D, Image } from "@napi-rs/canvas";
import type { ISpiritTree, INode } from "@skyhelperbot/constants/skygame-planner";
import { currency as currencyEmojis } from "@skyhelperbot/constants";

export interface GenerateSpiritTreeOptions {
  season?: boolean;
  scale?: number; // multiplier for resolution
}

const iconUrl = (icon: string) => `https://cdn.discordapp.com/emojis/${icon}.png`;

// --------------------
// Cache image loading to reduce load
// TODO: implement LRU or size limit as this may cause memory bloat
// --------------------
const imageCache = new Map<string, Image>();

async function getImage(url: string): Promise<Image> {
  if (imageCache.has(url)) return imageCache.get(url)!;
  const img = await loadImage(url);
  imageCache.set(url, img);
  return img;
}

async function preloadImages(tree: ISpiritTree) {
  const urls = new Set<string>();

  function collect(node?: INode) {
    if (!node) return;
    if (node.item?.icon) urls.add(iconUrl(node.item.icon));
    if (node.item?.season?.icon) urls.add(iconUrl(node.item.season.icon));
    if (node.currency) {
      const curId = (currencyEmojis as any)[node.currency.type];
      if (curId) urls.add(iconUrl(curId));
    }
    collect(node.n);
    collect(node.nw);
    collect(node.ne);
  }

  collect(tree.node);
  if (tree.spirit?.imageUrl) urls.add(tree.spirit.imageUrl);

  await Promise.all([...urls].map(getImage));
}

// --------------------
// Drawing helpers
// --------------------
function drawLine(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width = 4, color = "#F6EAE0") {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// draw connector between two centers but stop short of the circles by gap
function drawConnector(
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

async function drawItem(ctx: SKRSContext2D, x: number, y: number, size: number, node?: INode, season = false) {
  const { item } = node || {};
  const isUnlocked = !!(item && (item.unlocked || item.autoUnlocked));

  ctx.save();
  ctx.translate(x, y);
  if (item && !isUnlocked) ctx.globalAlpha = 0.5; // faded for unacquired items

  const itemSize = size * 2.5;

  // draw item icon
  if (item?.icon) {
    try {
      const img = await getImage(iconUrl(item.icon));
      ctx.drawImage(img, -itemSize * 0.45, -itemSize * 0.45, itemSize * 0.9, itemSize * 0.9);
    } catch {
      ctx.font = `${Math.floor(size * 0.7)}px SegoeUIEmoji`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F6EAE0";
      ctx.fillText(item.icon, 0, 0);
    }
  }

  const r = itemSize / 2;
  const cx = Math.max(10, Math.floor(itemSize * 0.25));
  const padding = Math.max(4, Math.floor(itemSize * 0.06));

  // season overlay
  if (season && item && (item.group === "SeasonPass" || item.group === "Ultimate")) {
    try {
      const badge = await getImage(iconUrl(item.season!.icon));
      const bsize = itemSize * 0.4;
      ctx.drawImage(badge, -itemSize / 2, -itemSize / 2, bsize, bsize);
    } catch {
      ctx.fillStyle = "#FFD966";
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.35, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // item level
  if (item?.level) {
    const fontSize = Math.max(10, Math.floor(cx * 0.6));
    ctx.font = `${fontSize}px SegoeUIEmoji`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`Lvl${item.level}`, -itemSize / 5, itemSize / 2.25);
  }

  // sheet number
  if (item?.sheet) {
    const fontSize = Math.max(10, Math.floor(cx * 0.5));
    ctx.font = `${fontSize}px SegoeUIEmoji`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`#${item.sheet}`, itemSize / 2, -itemSize / 4 - 5);
  }

  // unlocked checkmark
  if (item && isUnlocked) {
    const checkRadius = Math.max(8, Math.floor(itemSize * 0.12));
    const badgeX = r * 0.5;
    const badgeY = r * 0.65;

    ctx.strokeStyle = "#24A72B";
    ctx.lineWidth = Math.max(3, Math.floor(checkRadius * 0.3));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(badgeX - checkRadius * 0.6, badgeY - checkRadius * 0.05);
    ctx.lineTo(badgeX - checkRadius * 0.05, badgeY + checkRadius * 0.4);
    ctx.lineTo(badgeX + checkRadius, badgeY - checkRadius * 0.8);
    ctx.stroke();
  }

  // cost overlay
  if (node?.currency) {
    const cost = node.currency.amount;
    const iconCenterX = r - padding - cx / 2 + 15;
    const iconCenterY = r + 5;
    const curKey = node.currency.type;
    const curEmojiId = (currencyEmojis as any)[curKey];

    if (curEmojiId) {
      try {
        const curImg = await getImage(iconUrl(curEmojiId));
        ctx.drawImage(curImg, iconCenterX - cx / 2, iconCenterY - cx / 2, cx, cx);
      } catch {
        ctx.fillStyle = "#FFD966";
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, cx / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const fontSize = Math.max(10, Math.floor(cx * 0.9));
    ctx.font = `${fontSize}px SegoeUIEmoji`;
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

// --------------------
// Recursive renderer
// --------------------
async function renderNodeRecursive(
  ctx: SKRSContext2D,
  node: INode,
  x: number,
  y: number,
  spacingY: number,
  size: number,
  season: boolean,
  visited = new Set<string>(),
) {
  if (!node || visited.has(node.guid)) return;
  visited.add(node.guid);
  const gap = Math.max(10, size * 0.7);

  await drawItem(ctx, x, y, size, node, season);

  if (node.n) {
    const ny = y + spacingY;
    drawConnector(ctx, x, y, x, ny, size / 2, gap);
    await renderNodeRecursive(ctx, node.n, x, ny, spacingY, size, season, visited);
  }

  if (node.nw) {
    const bx = x + spacingY - 20;
    const by = y + spacingY / 1.5;
    drawConnector(ctx, x, y, bx, by, size / 2, gap);
    await renderNodeRecursive(ctx, node.nw, bx, by, spacingY, size, season, visited);
  }

  if (node.ne) {
    const bx = x - spacingY + 20;
    const by = y + spacingY / 1.5;
    drawConnector(ctx, x, y, bx, by, size / 2, gap);
    await renderNodeRecursive(ctx, node.ne, bx, by, spacingY, size, season, visited);
  }
}

// --------------------
// Main generator
// --------------------
export async function generateSpiritTree(tree: ISpiritTree, options: GenerateSpiritTreeOptions = {}): Promise<Buffer> {
  const scale = options.scale ?? 0.5; // default slightly reduced for perf
  const size = 64 * scale;
  const spacingY = size * 4;
  const spirit = tree.spirit ?? tree.ts.spirit;

  // preload all images in parallel
  await preloadImages(tree);

  // BFS to estimate dimensions
  const queue: Array<{ node: INode; x: number; y: number; depth: number }> = [];
  const visited = new Set<string>();
  queue.push({ node: tree.node, x: 0, y: 0, depth: 0 });
  let minX = 0,
    maxX = 0,
    maxDepth = 0;

  while (queue.length) {
    const cur = queue.shift()!;
    if (!cur.node || visited.has(cur.node.guid)) continue;
    visited.add(cur.node.guid);
    maxDepth = Math.max(maxDepth, cur.depth);
    minX = Math.min(minX, cur.x);
    maxX = Math.max(maxX, cur.x);

    if (cur.node.n) queue.push({ node: cur.node.n, x: cur.x, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.nw) queue.push({ node: cur.node.nw, x: cur.x - 1, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.ne) queue.push({ node: cur.node.ne, x: cur.x + 1, y: cur.y + 1, depth: cur.depth + 1 });
  }

  const columns = maxX - minX + 1;
  const width = Math.max(800, Math.ceil(columns * (size * 4) * 1.5));
  const height = Math.ceil((maxDepth + 1) * spacingY + size * 3);

  const canvas = createCanvas(width, height);
  const ctx: SKRSContext2D = canvas.getContext("2d");

  // background
  if (spirit?.imageUrl) {
    try {
      const bgImg = await getImage(spirit.imageUrl);
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
    } catch {}
  }

  // watermark
  const watermarkText = "SkyHelper";
  const titleSize = Math.max(18, Math.floor(Math.min(width, height) / 20));
  const subSize = Math.max(12, Math.floor(titleSize / 2));

  ctx.font = `${titleSize}px SegoeUIEmoji`;
  ctx.fillStyle = "rgba(246, 234, 224, 0.6)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(watermarkText, width - titleSize, 20);
  ctx.font = `${subSize}px SegoeUIEmoji`;
  ctx.fillText("A Sky: COTL Discord Bot", width - subSize, titleSize + 20 + subSize / 2);

  // transparent overlay
  ctx.fillStyle = "rgba(14, 43, 51, 0.35)";
  ctx.fillRect(0, 0, width, height);

  const centerX = Math.floor(width / 2);
  const startY = Math.floor(height - size);

  if (spirit?.name || tree.name) {
    const fontSize = Math.max(10, Math.floor(size * 1.15));
    ctx.font = `${fontSize}px SegoeUIEmoji`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tree.name || spirit?.name, centerX, startY - 30);
  }

  await renderNodeRecursive(ctx, tree.node, centerX, startY - 100, -spacingY, size, !!options.season);

  return canvas.toBuffer("image/png");
}

export default generateSpiritTree;
