import { createCanvas, loadImage, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import type { userData, colorsType, Background, LeaderboardOptions } from "../typings.js";
import * as path from "node:path";

/**
 * Represents a Quiz Leaderboard Card. A class for generating a leaderboard card for a quiz or game.
 * @returns - The generated image buffer.
 */
export class LeaderboardCard {
  private usersData: userData[];
  private background: Background;
  private abbreviateNumber: boolean;
  private opacity: number;
  private scoreMessage: string;
  private colors: colorsType;

  constructor(options: LeaderboardOptions) {
    this.usersData = options?.usersData || [];
    this.background = {
      type: "none",
      background: "none",
    };
    this.abbreviateNumber = false;
    this.opacity = 0;
    this.scoreMessage = "";
    this.colors = options?.colors ?? {
      box: "#212121",
      username: "#ffffff",
      score: "#ffffff",
      firstRank: "#f7c716",
      secondRank: "#9e9e9e",
      thirdRank: "#94610f",
    };
  }

  /**
   * .setUsersData
   * @param usersData ```js
   * [{ top: int, avatar: "string", tag: "string", score: int}, games: int]
   * ```
   * @example setUsersData([{top:1,avatar:"https://someone-image.png",tag:"fivesobes",score:5, games:8}])
   */
  setUsersData(usersData: userData[]): this {
    if (usersData.length > 10) {
      throw new Error("setUsersData values cannot be greater than 10.");
    }
    this.usersData = usersData;
    return this;
  }

  /**
   * .setScoreMessage
   * @param  message Set Custom Score Message
   * @example setScoreMessage("Message")
   */
  setScoreMessage(message: string): this {
    this.scoreMessage = message;
    return this;
  }

  /**
   * .setColors
   * @param colors ```json
   * {box: "hexcolor", username: "hexcolor", score: "hexcolor", firstRank: "hexcolor", secondRank: "hexcolor", thirdRank: "hexcolor"}
   * ```
   * @example
   * setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
   */
  setColors(colors: colorsType): this {
    this.colors = colors;
    return this;
  }

  /**
   * .setabbreviateNumber
   * @param bool must be "true" or "false"
   * @example setabbreviateNumber(true)
   */
  setabbreviateNumber(bool: boolean): this {
    if (typeof bool !== "boolean") {
      throw new Error("You must give a abbreviate number true or false argument.");
    }
    this.abbreviateNumber = bool;
    return this;
  }

  /**
   * .setOpacity
   * @param opacity must be between 0 and 1
   * @example setOpacity(0.6)
   */
  setOpacity(opacity = 0): this {
    if (opacity >= 0 && opacity <= 1) {
      this.opacity = opacity;
      return this;
    } else {
      throw new Error("The value of the opacity of setOpacity method must be between 0 and 1 (0 and 1 included).");
    }
  }

  /**
   * .setBackground
   * @param type "image" or "color"
   * @param value "url" or "hexcolor"
   * @example setBackground("image","https://someone-image.png")
   * @example setBackground("color","#000")
   */
  setBackground(type: string, value: string): this {
    if (type === "color") {
      if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)) {
        this.background.type = "color";
        this.background.background = value;
        return this;
      } else {
        throw new Error("Invalid color for the second argument in setForeground method. You must give a hexadecimal color.");
      }
    } else if (type === "image") {
      this.background.type = "image";
      this.background.background = value;
      return this;
    } else {
      throw new Error("The first argument of setBackground must be 'color' or 'image'.");
    }
  }

  async build(): Promise<Buffer> {
    GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../../shared/fonts/circularstd-black.otf`), "circular-std");
    GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../../shared/fonts/notosans-jp-black.ttf`), "noto-sans-jp");
    GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../../shared/fonts/notosans-black.ttf`), "noto-sans");
    GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../../shared/fonts/notoemoji-bold.ttf`), "noto-emoji");
    GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../../shared/fonts/notosans-kr-black.ttf`), "noto-sans-kr");

    const abbreviateNumber = (value: number): string => {
      let newValue: string | number = value;
      if (value >= 1000) {
        const suffixes = ["", "K", "M", "B", "T"];
        const suffixNum = Math.floor(("" + value).length / 3);
        let shortValue: number | string = "";
        for (let precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision));
          const dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (typeof shortValue === "number" && shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
      }
      return newValue.toString();
    };

    const yuksek = this.usersData.length * 74.5;

    const canvas = createCanvas(680, yuksek);
    const ctx: SKRSContext2D = canvas.getContext("2d");

    ctx.globalAlpha = 1;

    if (this.background.type === "color") {
      ctx.fillStyle = this.background.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (this.background.type === "image") {
      try {
        ctx.drawImage(await loadImage(this.background.background), 0, 0, canvas.width, canvas.height);
      } catch {
        throw new Error(
          "The image given in the second parameter of the setBackground method is not valid or you are not connected to the internet.",
        );
      }
    }

    if (this.usersData) {
      let Box_Y = 0,
        Avatar_Y = 0,
        Tag_Y = 45,
        XP_Y = 45,
        Level_Y = 30,
        Rank_Y = 45;
      for (const data of this.usersData) {
        ctx.save();
        ctx.fillStyle = this.colors.box;
        ctx.globalAlpha = this.opacity;
        this.fillRoundRect(ctx, 0, Box_Y, canvas.width, 70, 15, true, false);
        ctx.globalAlpha = 1;
        try {
          const avatar = await loadImage(data.avatar);
          ctx.clip();
          ctx.drawImage(avatar, 0, Avatar_Y, 70, 70);
        } catch (err) {
          console.error("Failed to load avatar", err);
        }
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 6;
        ctx.shadowColor = "#0a0a0a";

        ctx.fillStyle = this.colors.username;
        ctx.font = `bold 25px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "left";
        ctx.fillText(data.tag, 80, Tag_Y, 260);

        ctx.fillStyle = this.colors.score;
        ctx.font = `bold 20px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "right";
        ctx.fillText(
          `${this.scoreMessage} ${
            this.abbreviateNumber == true ? `${abbreviateNumber(data.score)}` : `${data.score}`
          }/${this.abbreviateNumber == true ? `${abbreviateNumber(data.games)}` : `${data.games}`}`,
          560,
          XP_Y,
          200,
        );

        if (data.top === 1) {
          ctx.fillStyle = this.colors.firstRank;
        } else if (data.top === 2) {
          ctx.fillStyle = this.colors.secondRank;
        } else if (data.top === 3) {
          ctx.fillStyle = this.colors.thirdRank;
        }

        ctx.font = `bold 30px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "right";
        ctx.fillText("#" + data.top, 660, Rank_Y, 75);

        Box_Y = Box_Y + 75;
        Avatar_Y = Avatar_Y + 75;
        Tag_Y = Tag_Y + 75;
        XP_Y = XP_Y + 75;
        Level_Y = Level_Y + 75;
        Rank_Y = Rank_Y + 75;
        ctx.restore();
      }
    } else {
      ctx.font = `bold 40px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 6;
      ctx.shadowColor = "#0a0a0a";
      ctx.fillText("Not found!", 340, 370, 500);
    }

    return canvas.toBuffer("image/png");
  }

  private fillRoundRect(
    ctx: SKRSContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number | { tl: number; tr: number; br: number; bl: number },
    f: boolean,
    s: boolean,
  ): void {
    if (typeof r === "number") {
      r = { tl: r, tr: r, br: r, bl: r };
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (const side in defaultRadius) {
        r[side as keyof typeof defaultRadius] =
          r[side as keyof typeof defaultRadius] || defaultRadius[side as keyof typeof defaultRadius];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (f) ctx.fill();
    if (s) ctx.stroke();
  }
}
