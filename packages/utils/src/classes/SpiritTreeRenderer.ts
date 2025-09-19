import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import type { ISpiritTree, INode, IItem } from "@skyhelperbot/constants/skygame-planner";
import { currency as currencyEmojis } from "@skyhelperbot/constants";
import { join } from "path";

export interface GenerateSpiritTreeOptions {
  season?: boolean;
  scale?: number; // multiplier for resolution
}

function pathRel(p: string) {
  return join(import.meta.dirname, p);
}

const iconUrl = (icon: string) => `https://cdn.discordapp.com/emojis/${icon}.png`;
function drawLine(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width = 4, color = "#F6EAE0") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
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
  width = 4,
  color = "#F6EAE0",
) {
  // compute vector
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0.0001) return;
  const nx = dx / dist;
  const ny = dy / dist;

  // shorten both ends by radius + gap (but ensure they don't cross)
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
  // base circle / background
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);

  // draw item icon
  if (item?.icon) {
    try {
      const img = await loadImage(iconUrl(item.icon));
      ctx.drawImage(img, -(size * 1.5) * 0.45, -(size * 1.5) * 0.45, size * 1.5 * 0.9, size * 1.5 * 0.9);
    } catch (err) {
      console.log(err);
      // fallback: draw emoji text
      ctx.font = `${Math.floor(size * 0.7)}px SegoeUIEmoji`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F6EAE0";
      ctx.fillText(item.icon, 0, 0);
    }
  }

  // season overlay (small icon top-left)
  if (season && item && item.group === "SeasonPass") {
    try {
      const badge = await loadImage(iconUrl(item.season!.icon));
      const bsize = size * 0.4;
      ctx.drawImage(badge, -size / 2 - 20, -size / 2 - 20, bsize, bsize);
    } catch (err) {
      // simple star
      ctx.fillStyle = "#FFD966";
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.35, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (item.level) {
    try {
      const fontSize = Math.max(10, Math.floor(size * 0.22));
      ctx.font = `${fontSize}px SegoeUIEmoji`;
      ctx.fillStyle = "#F6EAE0";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const text = `Lvl${item.level}`;
      ctx.fillText(text, -size / 2, size / 2 - 20);
    } catch (err) {
      // simple star
      ctx.fillStyle = "#FFD966";
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.35, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // cost overlay (bottom-right) -> show currency emoji + numeric cost
  if (node && node.currency) {
    const cost = node.currency.amount;
    const r = size / 2; // radius
    const cx = Math.max(10, Math.floor(size * 0.35)); // currency icon size
    const padding = Math.max(4, Math.floor(size * 0.06));

    // icon center (relative to translated center 0,0): bottom-right inside the circle
    const iconCenterX = r - padding - cx / 2 + 50;
    const iconCenterY = r + 40;

    const curKey = node.currency.type;
    const curEmojiId = (currencyEmojis as any)[curKey];
    if (curEmojiId) {
      try {
        const curImg = await loadImage(iconUrl(curEmojiId));
        ctx.drawImage(curImg, iconCenterX - cx / 2, iconCenterY - cx / 2, cx, cx);
      } catch (err) {
        // fallback: small circle
        ctx.fillStyle = "#FFD966";
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, cx / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // draw cost text to the left of currency icon, measure to avoid overlap
    const fontSize = Math.max(10, Math.floor(cx * 0.9));
    ctx.font = `${fontSize}px SegoeUIEmoji`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const text = String(cost);
    // position text so its right edge sits padding pixels left of the icon's left edge
    const textRightX = iconCenterX - cx / 2 - Math.max(4, Math.floor(size * 0.03));
    const textY = iconCenterY;
    // if text would overflow left of circle, clamp it
    const measured = ctx.measureText(text);
    const minTextX = -r + padding; // leftmost allowed x for text left edge
    const textLeftEdge = textRightX - measured.width;
    let finalTextX = textRightX;
    if (textLeftEdge < minTextX) {
      // shift text to fit inside circle; allow it to overlap icon slightly if needed
      finalTextX = Math.max(textRightX, minTextX + measured.width);
    }
    ctx.fillText(text, finalTextX, textY);
  }

  ctx.restore();
}

// layout: vertical center column with optional nw/ne branches and possible upward connectors
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

  // draw current item
  await drawItem(ctx, x, y, size, node, season);

  // vertical connector to center n
  if (node.n) {
    const ny = y + spacingY;
    // use centers for connector so drawConnector can shorten both ends by radius+gap
    drawConnector(ctx, x, y, x, ny, size / 2, Math.max(10, size * 0.35));
    await renderNodeRecursive(ctx, node.n, x, ny, spacingY, size, season, visited);
  }

  // left branch (nw)
  if (node.nw) {
    const bx = x - size * 2.1;
    const by = y + spacingY / 1.5;
    // connect center-to-center; drawConnector will leave a visible gap from the item circles
    drawConnector(ctx, x, y, bx, by, size / 2, Math.max(10, size * 0.35));
    await renderNodeRecursive(ctx, node.nw, bx, by, spacingY, size, season, visited);
  }

  // right branch (ne)
  if (node.ne) {
    const bx = x + size * 2.1;
    const by = y + spacingY / 1.5;
    // connect center-to-center; drawConnector will leave a visible gap from the item circles
    drawConnector(ctx, x, y, bx, by, size / 2, Math.max(10, size * 0.35));
    await renderNodeRecursive(ctx, node.ne, bx, by, spacingY, size, season, visited);
  }

  // Some nodes may have upward connector 'n' of child pointing upwards from a branch node; handle by checking children's n that go upward
  // Already handled via normal recursion since we position children relative to parent.
}

export async function generateSpiritTree(tree: ISpiritTree, options: GenerateSpiritTreeOptions = {}): Promise<Buffer> {
  const scale = options.scale || 2;
  const size = 64 * scale; // item size
  const spacingY = size * 2.5; // vertical spacing between levels
  const spirit = tree.spirit;
  // estimate node count to size canvas. We'll traverse breadth-first to find depth and breadth
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

    // push children with relative x offsets
    if (cur.node.n) queue.push({ node: cur.node.n, x: cur.x, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.nw) queue.push({ node: cur.node.nw, x: cur.x - 1, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.ne) queue.push({ node: cur.node.ne, x: cur.x + 1, y: cur.y + 1, depth: cur.depth + 1 });
  }

  const columns = maxX - minX + 1;
  const width = Math.max(2048, Math.ceil(columns * (size * 1.8)));
  const height = Math.max(2048, Math.ceil((maxDepth + 1) * spacingY + size * 2));

  const canvas = createCanvas(width, height);
  const ctx: SKRSContext2D = canvas.getContext("2d");
  ctx.fillStyle = "#0E2B33"; // background
  ctx.fillRect(0, 0, width, height);

  // center start x and start from bottom so tree builds upwards
  const centerX = Math.floor(width / 2);
  const startY = Math.floor(height - size);

  // render recursively from bottom to top: pass negative spacing so children are drawn above
  await renderNodeRecursive(ctx, tree.node, centerX, startY, -spacingY, size, !!options.season);

  return canvas.toBuffer("image/png");
}

export default generateSpiritTree;
