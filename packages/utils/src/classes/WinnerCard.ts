import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { colors, fancyCount, getUserAvatar } from "./utils.js";
import { join } from "path";
import type { APIGuildMember, APIUser } from "discord-api-types/v10";
const size = 100;

// TODO: Integrate it with other game types
export class GameWinnerCard {
  private name: string;
  private thumbnail: string;
  private points: number;
  private total: number;
  constructor(
    winner: APIUser | APIGuildMember,
    wins: number,
    total: number,
    readonly clientAvatar: string,
  ) {
    if ("user" in winner) {
      this.name = winner.nick ?? winner.user.global_name ?? winner.user.username;
      this.thumbnail = getUserAvatar(winner.user);
    } else {
      this.name = winner.global_name ?? winner.username;
      this.thumbnail = getUserAvatar(winner);
    }
    this.points = wins;
    this.total = total;
  }
  private path(strs: string): string {
    return join(import.meta.dirname, strs);
  }

  private roundRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number): SKRSContext2D {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
  }

  private changeFontSize(ctx: SKRSContext2D, _size: string): SKRSContext2D {
    const fontArgs = ctx.font.split(" ");
    ctx.font = `${_size} ${fontArgs.slice(1).join(" ")}`; // / using the last part
    return ctx;
  }
  async build(): Promise<Buffer> {
    const canvas = createCanvas(16 * size, 5 * size);
    const ctx = canvas.getContext("2d");
    const { width: w, height: h } = canvas;
    ctx.font = "85px SegoeUI, SegoeUIEmoji";

    ctx.fillStyle = colors.darkgrey;
    this.roundRect(ctx, 0, 0, w, h, size * 0.75).clip();
    ctx.fill();
    // box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    // ctx.shadowOffsetY = 40;
    // ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    // ctx.shadowOffsetX = 40;

    // Avatar
    //
    ctx.save();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(h / 2, h / 2, h * 0.3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = colors.grey;
    ctx.fillRect(h * 0.2, h * 0.2, h * 0.6, h * 0.6);
    ctx.drawImage(await loadImage(this.thumbnail), h * 0.2, h * 0.2, h * 0.6, h * 0.6);
    ctx.restore();

    // Status
    ctx.save();
    ctx.translate(size * 3.55, size * 3.55);

    ctx.fillStyle = colors.darkgrey;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.drawImage(await loadImage(this.path("../../shared/assets/Win.png")), -size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
    ctx.restore();

    // User Text
    //
    ctx.fillStyle = colors.blue;
    this.changeFontSize(ctx, h * 0.17 + "px");
    ctx.fillText(this.name, w * 0.3, h * 0.45, w * 0.425);
    ctx.fillStyle = colors.idle;
    ctx.fillText("#", w * 0.3 + w * 0.4375, h * 0.45);
    ctx.fillStyle = colors.online;
    ctx.fillText("1", w * 0.3 + w * 0.425 + w * 0.05, h * 0.45, w * 0.15625);

    // Botlist URL
    //
    // ctx.textBaseline = 'middle';
    ctx.textAlign = "center";
    ctx.fillStyle = colors.blue;
    this.roundRect(ctx, w * 0.5, -(w * 0.0625), w * 0.5, h * 0.4, w * 0.0625);
    ctx.fill();
    ctx.fillRect(w * 0.625, 0, w * 0.5, w * 0.0625);
    ctx.fillStyle = colors.darkgrey;
    this.changeFontSize(ctx, h * 0.15 + "px");
    ctx.fillText("Sky CoTL Quiz Game", w * 0.55 + h * 0.65, h * 0.15, w * 0.421875);

    // Counters
    //
    ctx.textAlign = "left";
    ctx.fillStyle = colors.lightgrey;
    ctx.drawImage(await loadImage(this.path("../../shared/assets/Point.png")), w * 0.3, h * 0.65, w * 0.0625, w * 0.0625);
    this.changeFontSize(ctx, h * 0.15 + "px");
    ctx.fillText(`${fancyCount(this.points)}/${fancyCount(this.total)} points`, w * 0.25 + h * 0.45, h * 0.65 + h * 0.15, h * 10);

    // ctx.drawImage(await loadImage(this.path('../../shared/assets/vote.svg')), w * 0.6, h * 0.65, w * 0.0625, w * 0.0625);
    //   ctx.fillText(fancyCount(this.total), w * 0.55 + h * 0.45, h * 0.65 + h * 0.15, h * 0.45);

    // Library

    ctx.fillStyle = colors.grey;
    this.roundRect(ctx, w * 0.875, h * 0.6, h * 0.4, h * 0.4, h * 0.15).clip();
    ctx.fill();
    ctx.drawImage(await loadImage(this.clientAvatar), w * 0.875, h * 0.6, h * 0.4, h * 0.4);

    return canvas.toBuffer("image/png");
  }
}
