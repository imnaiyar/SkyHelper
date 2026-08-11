import { createCanvas, loadImage, GlobalFonts, type Canvas, type Image, type SKRSContext2D } from "@napi-rs/canvas";
import { DateTime } from "luxon";
import path from "node:path";
import { ShardsUtil } from "@skyhelperbot/utils";
import { currency, emojis, zone } from "@skyhelperbot/constants";
import config from "@/config";
import { CalendarMonths } from "@/utils/constants";
import { drawBotTitleHeader } from "./shared.js";

// #region Constants
const ZONE = zone;
/** Build the image URL of a custom Discord emoji from its id */
const EMOJI_URL = (emoji: string) => `https://cdn.discordapp.com/emojis/${emoji}.png`;

const FONT_NAME = "noto-sans";
const FONT_BOLD = "noto-sans-bold";

GlobalFonts.registerFromPath(path.join(process.cwd(), `assets/fonts/NotoSans-Regular.ttf`), FONT_NAME);
GlobalFonts.registerFromPath(path.join(process.cwd(), `assets/fonts/notosans-black.ttf`), FONT_BOLD);

// Layout in base units (multiplied by `scale` at render time)
const WIDTH = 2000;
const PADDING = 40;
const GAP = 16;
const HEADER_TOP = 30;
const HEADER_HEIGHT = 160;
const WEEKDAY_HEIGHT = 55;
const CELL_HEIGHT = 162;
const BOTTOM_PAD = 30;

// Weekday labels
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Short realm labels used on the image
const REALM_SHORT_NAMES: Record<string, string> = {
  prairie: "Prairie",
  forest: "Forest",
  valley: "Valley",
  wasteland: "Wasteland",
  vault: "Vault",
};

const CARD_COLORS = {
  red: { tint: "rgba(224, 90, 90, 0.14)", border: "#e06a6a" },
  black: { tint: "rgba(18, 18, 26, 0.4)", border: "#777783" },
  none: { tint: "rgba(255, 255, 255, 0.06)", border: "#3a3a42" },
  todayColor: "#20d80c",
  acColor: "#e06a6a",
  waxColor: "#ffc46b",
} as const;
// #endregion

// #region Data
/** Per-day data used to render a calendar cell */
export interface ShardsCalendarDayData {
  /** The day this entry represents */
  date: DateTime;
  /** Shard type, or null on no-shard days */
  type: "red" | "black" | null;
  /** Short area name (e.g. "Butterfly Fields") */
  location: string;
  /** Short realm name (e.g. "Prairie") */
  realm: string;
  /** Reward, or null when unknown */
  reward: number | null;
  /** Shard time windows formatted as "HH:mm-HH:mm" (absolute, shard timezone) */
  timings: string[];
}

/** Returns every day of the given month in the shard timezone */
export function getMonthDays(month: number, year: number): DateTime[] {
  const first = DateTime.fromObject({ year, month, day: 1 }, { zone: ZONE });
  if (!first.isValid) return [];
  const totalDays = first.daysInMonth;
  const days: DateTime[] = [];
  for (let i = 1; i <= totalDays; i++) {
    days.push(DateTime.fromObject({ year, month, day: i }, { zone: ZONE }));
  }
  return days;
}

/** Build the display data for a single day; returns null on no-shard days */
export function buildDayData(date: DateTime): ShardsCalendarDayData | null {
  const shard = ShardsUtil.getShard(date);
  if (!shard) {
    return { date, type: null, location: "", realm: "", reward: null, timings: [] };
  }
  const { info, timings } = shard;
  const { currentRealm } = ShardsUtil.shardsIndex(date);
  // `info.area` embeds a custom emoji,so strip it
  // TODO: This should be temporary, instead of hardcoding stuff, refactor shard data to be generated dynamically with only necessary info
  const shortName = info.area.split(",")[0]?.trim() ?? info.area;
  return {
    date,
    type: info.type,
    location: shortName,
    realm: REALM_SHORT_NAMES[currentRealm] ?? currentRealm,
    reward: info.wax ?? info.ac ?? null,
    timings: timings.map((t) => `${t.start.toFormat("HH:mm")}-${t.end.toFormat("HH:mm")}`),
  };
}

/** Build the Monday-first grid of cells for a month, padded with `null` for empty slots */
export function getCalendarGrid(month: number, year: number): Array<Array<ShardsCalendarDayData | null>> {
  const days = getMonthDays(month, year);
  if (!days.length) return [];
  const leading = days[0]!.weekday - 1; // 0 = Monday
  const cells: Array<ShardsCalendarDayData | null> = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (const day of days) cells.push(buildDayData(day));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: Array<Array<ShardsCalendarDayData | null>> = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}
// #endregion

// #region Image cache
const imageCache = new Map<string, Image | null>();

async function loadImageCached(url: string): Promise<Image | null> {
  if (imageCache.has(url)) return imageCache.get(url) ?? null;
  try {
    const img = await loadImage(url);
    imageCache.set(url, img);
    return img;
  } catch {
    imageCache.set(url, null);
    return null;
  }
}
// #endregion

// #region Canvas helpers
function roundedRectPath(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Build a canvas font shorthand string */
const font = (size: number, family: string) => `${size}px ${family}`;

/** Draw the card background (dark gradient + subtle dot pattern) */
function drawBackground(ctx: SKRSContext2D, width: number, height: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#1e2136");
  bg.addColorStop(1, "#0e0f1c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // subtle dot pattern
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < width; i += 22) {
    for (let j = 0; j < height; j += 22) {
      ctx.fillRect(i, j, 1, 1);
    }
  }
  ctx.restore();
}

/** Wrap text to fit `maxWidth`, at most `maxLines` lines (last line ellipsized on overflow) */
function wrapText(ctx: SKRSContext2D, text: string, maxWidth: number, maxLines = 2): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  let overflow = false;
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) {
        overflow = true;
        break;
      }
    } else {
      current = test;
    }
  }
  if (!overflow && current) lines.push(current);
  if (!lines.length) lines.push("");
  if (overflow) {
    let last = lines[maxLines - 1] ?? "";
    while (last.length && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}
// #endregion

// #region Cell rendering
interface CellRenderContext {
  ctx: SKRSContext2D;
  today: DateTime;
  /** Pre-blurred copy of the background, used for the frosted-glass cell bodies */
  backdrop: Canvas;
}

function drawCell(
  render: CellRenderContext,
  x: number,
  y: number,
  w: number,
  h: number,
  data: ShardsCalendarDayData | null,
  icon: { shardType: Image | null; currency: Image | null } | null,
) {
  const { ctx, today, backdrop } = render;
  if (!data) return; // empty leading/trailing slot

  const isNoShard = data.type === null;
  const colors = isNoShard ? CARD_COLORS.none : data.type === "red" ? CARD_COLORS.red : CARD_COLORS.black;
  const pad = 14;
  const isToday = data.date.hasSame(today, "day");

  // Frosted glass body: blurred backdrop clipped to the rounded rect
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.clip();
  ctx.drawImage(backdrop, x, y, w, h, x, y, w, h);
  ctx.restore();

  // glass tint (like a frosted glass effect)
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, 14);
  ctx.fillStyle = colors.tint;
  ctx.fill();
  ctx.strokeStyle = isToday ? CARD_COLORS.todayColor : colors.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Row 1: day number  + shard icon
  ctx.font = font(24, FONT_BOLD);
  ctx.fillStyle = isToday ? CARD_COLORS.todayColor : "#F6EAE0";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const dayStr = String(data.date.day);
  ctx.fillText(dayStr, x + pad, y + 12);

  if (isNoShard) {
    //  "X" marker for no shard cells
    ctx.font = font(40, FONT_BOLD);
    ctx.fillStyle = "#5a5a66";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("X", x + w / 2, y + h / 2 + 8);
    return;
  }

  if (icon?.shardType) {
    const iconSize = 26;
    ctx.drawImage(icon.shardType, x + w - pad - iconSize, y + pad - 4, iconSize, iconSize);
  }

  // Row 2: location
  ctx.font = font(22, FONT_BOLD);
  ctx.fillStyle = "#F6EAE0";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const locLine = wrapText(ctx, data.location, w - pad * 2, 1)[0] ?? "";
  ctx.fillText(locLine, x + pad, y + 48);

  // Row 3: realm  + reward
  ctx.font = font(19, FONT_NAME);
  ctx.fillStyle = "#9b9bae";
  ctx.fillText(data.realm, x + pad, y + 80);
  if (data.reward) {
    const curIcon = icon?.currency ?? null;
    const iconSize = 22; // matches the 19px reward text
    const unit = data.type === "red" ? "AC" : "wax";
    const rewardStr = curIcon ? data.reward.toString() : `${data.reward} ${unit}`;
    ctx.font = font(19, FONT_BOLD);
    ctx.fillStyle = data.type === "red" ? CARD_COLORS.acColor : CARD_COLORS.waxColor;
    ctx.textAlign = "right";
    const right = x + w - pad;
    // shift the number left to make room for the wax/AC icon
    ctx.fillText(rewardStr, curIcon ? right - iconSize - 3 : right, y + 80);
    if (curIcon) {
      ctx.drawImage(curIcon, right - iconSize, y + 78, iconSize, iconSize);
    }
  }

  // Row 4-5: absolute time windows (first two together, then the third)
  ctx.font = font(18, FONT_NAME);
  ctx.fillStyle = "#bdb6cc";
  ctx.textAlign = "left";
  const [t1, t2, t3] = data.timings;
  if (t1) {
    ctx.fillText(t2 ? `${t1}   ${t2}` : t1, x + pad, y + 110);
  }
  if (t3) {
    ctx.fillText(t3, x + pad, y + 134);
  }
}
// #endregion

// #region Main generator
export interface ShardsCalendarCardOptions {
  /** Month to render (1-12); defaults to the current month */
  month?: number;
  /** Year to render; defaults to the current year */
  year?: number;
  /** URL of the bot icon shown in the header; defaults to `config.BOT_ICON` */
  botIcon?: string;
  /** Bot name shown in the header; defaults to "SkyHelper" */
  botName?: string;
  /** Resolution multiplier (1 = full size) */
  scale?: number;
}

/**
 * Generate a monthly shard calendar image.
 *
 * Red shard days get a reddish card, black shard days a blackish card and
 * no-shard days a neutral card. Times are absolute `HH:mm-HH:mm` windows in the
 * shard timezone (America/Los_Angeles), since relative timings can't be shown
 * on a static image.
 *
 * @param options month/year to render plus header styling options
 * @returns a PNG image buffer of the calendar
 */
export async function generateShardsCalendarCard(options: ShardsCalendarCardOptions = {}): Promise<Buffer> {
  const now = DateTime.now().setZone(ZONE);
  const month = options.month ?? now.month;
  const year = options.year ?? now.year;
  const botName = options.botName ?? "SkyHelper";
  const botIcon = options.botIcon ?? config.BOT_ICON;
  const scale = options.scale ?? 1;
  const px = (n: number) => Math.round(n * scale);

  const first = DateTime.fromObject({ year, month, day: 1 }, { zone: ZONE });
  if (!first.isValid) throw new Error(`Invalid month or year: ${month}-${year}`);

  const rows = getCalendarGrid(month, year);
  if (!rows.length) throw new Error(`Invalid month or year: ${month}-${year}`);

  const width = px(WIDTH);
  const padding = px(PADDING);
  const gap = px(GAP);
  const cellW = Math.floor((width - padding * 2 - gap * 6) / 7);
  const cellH = px(CELL_HEIGHT);
  const gridTop = px(HEADER_TOP + HEADER_HEIGHT + WEEKDAY_HEIGHT);
  const height = px(
    HEADER_TOP + HEADER_HEIGHT + WEEKDAY_HEIGHT + rows.length * CELL_HEIGHT + (rows.length - 1) * GAP + BOTTOM_PAD,
  );

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // #region Background
  drawBackground(ctx, width, height);
  // #endregion

  // #region Frosted-glass backdrop (pre-blurred copy of the background)
  const bgSharp = createCanvas(width, height);
  drawBackground(bgSharp.getContext("2d"), width, height);
  const bgBlur = createCanvas(width, height);
  const bctx = bgBlur.getContext("2d");
  bctx.filter = "blur(16px)";
  bctx.drawImage(bgSharp, 0, 0);
  // #endregion

  // #region Header (bot logo + name, centered title)
  await drawBotTitleHeader({ botIcon, botName, headerY: px(28), size: px(18), ctx });

  const titleY = px(HEADER_TOP + 30);
  ctx.font = `${px(54)}px ${FONT_BOLD}`;
  ctx.fillStyle = "#F6EAE0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Shard Calendar", width / 2, titleY);

  ctx.font = `${px(34)}px ${FONT_BOLD}`;
  ctx.fillStyle = "#c9c2d9";
  ctx.fillText(`${CalendarMonths[month - 1]} ${year}`, width / 2, titleY + px(52));

  // timing disclaimer
  ctx.font = `${px(20)}px ${FONT_NAME}`;
  ctx.fillStyle = "#6e6e7e";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `All timings shown after the daily reset (12 AM Los Angeles time; UTC ${now.toFormat("ZZ")})`,
    width / 2,
    titleY + px(100),
  );

  // generated on text
  ctx.font = `${px(20)}px ${FONT_NAME}`;
  ctx.fillStyle = "#6e6e7e";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Generated on: ${now.toFormat("dd/MM/yyyy")}`, padding, 20);

  // divider
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, px(HEADER_TOP + HEADER_HEIGHT - 6));
  ctx.lineTo(width - padding, px(HEADER_TOP + HEADER_HEIGHT - 6));
  ctx.stroke();

  // #region Weekday headers
  const weekdayY = px(HEADER_TOP + HEADER_HEIGHT + 24);
  ctx.font = `${px(24)}px ${FONT_BOLD}`;
  ctx.fillStyle = "#9b9bae";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  WEEKDAYS.forEach((label, i) => {
    const cx = padding + cellW * i + cellW / 2 + gap * i;
    ctx.fillText(label, cx, weekdayY);
  });
  // #endregion

  // #region Preload images
  const [redShardImg, blackShardImg, acImg, waxImg] = await Promise.all([
    loadImageCached(EMOJI_URL(emojis.red_shard)),
    loadImageCached(EMOJI_URL(emojis.black_shard)),
    loadImageCached(EMOJI_URL(currency.ac)),
    loadImageCached(EMOJI_URL(emojis.wax)),
  ]);
  // #endregion

  // #region Cells
  const render: CellRenderContext = { ctx, today: now, backdrop: bgBlur };
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]!;
    const rowY = gridTop + r * (cellH + gap);
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] ?? null;
      const cellX = padding + c * (cellW + gap);
      const icon =
        cell?.type === "red"
          ? { shardType: redShardImg, currency: acImg }
          : cell?.type === "black"
            ? { shardType: blackShardImg, currency: waxImg }
            : null;
      drawCell(render, cellX, rowY, cellW, cellH, cell, icon);
    }
  }
  // #endregion

  return canvas.encode("png");
}
// #endregion
