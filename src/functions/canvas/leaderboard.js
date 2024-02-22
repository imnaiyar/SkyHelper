/**
 * Credits to @canvafy for the original Top Rank card code
 * see {@link https://github.com/Bes-js/canvafy|canvafy}
 */

const { createCanvas, loadImage, registerFont } = require("@napi-rs/canvas");
const path = require("path");

/**
 * Represents a Quiz Leaderboard Card.
 *
 * @class
 * @classdesc A class for generating a leaderboard card for a quiz or game.
 * @method build - Asynchronously builds the leaderboard card and returns the generated image buffer.
 * @returns {Buffer} - The generated image buffer.
 */

class QuizLeaderboardCard {
  constructor(options) {
    this.usersData = options?.usersData || [
      {
        top: 1,
        avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg",
        tag: "Beş#0005",
        score: 5,
        games: 5,
      },
      {
        top: 2,
        avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg",
        tag: "Beş#0005",
        score: 5,
        games: 5,
      },
      {
        top: 3,
        avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg",
        tag: "Beş#0005",
        score: 5,
        games: 5,
      },
    ];
    this.background = {
      type: "none",
      background: "none",
    };
    this.abbreviateNumber = false;
    this.opacity = 0;
    this.scoreMessage = "";
    this.colors = options?.colors || {
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
   * @param {Array||object} usersData [{ top: int, avatar: "string", tag: "string", score: int}]
   * @returns {QuizLeaderboardCard}
   * @example setUsersData([{top:1,avatar:"https://someone-image.png",tag:"fivesobes",score:5}])
   */
  setUsersData(usersData) {
    if (usersData.length > 10) {
      throw new Error("setUsersData values cannot be greater than 10.");
    }
    this.usersData = usersData;
    return this;
  }

  /**
   * .setScoreMessage
   * @param {string} message Set Custom Score Message
   * @returns {QuizLeaderboardCard}
   * @example setScoreMessage("Message")
   */
  setScoreMessage(message) {
    this.scoreMessage = message;
    return this;
  }

  /**
   * .setColors
   * @param {object} colors {box: "hexcolor", username: "hexcolor", score: "hexcolor", firstRank: "hexcolor", secondRank: "hexcolor", thirdRank: "hexcolor"}
   * @returns {QuizLeaderboardCard}
   * @example setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
   */
  setColors(colors) {
    this.colors = colors;
    return this;
  }

  /**
   * .setabbreviateNumber
   * @param {boolean} bool must be "true" or "false"
   * @returns {QuizLeaderboardCard}
   * @example setabbreviateNumber(true)
   */
  setabbreviateNumber(bool) {
    if (typeof bool !== "boolean") {
      throw new Error("You must give a abbreviate number true or false argument.");
    }
    this.abbreviateNumber = bool;
    return this;
  }

  /**
   * .setOpacity
   * @param {number} opacity must be between 0 and 1
   * @returns {QuizLeaderboardCard}
   * @example setOpacity(0.6)
   */
  setOpacity(opacity = 0) {
    if (opacity) {
      if (opacity >= 0 && opacity <= 1) {
        this.opacity = opacity;
        return this;
      } else {
        throw new Error("The value of the opacity of setOpacity method must be between 0 and 1 (0 and 1 included).");
      }
    }
  }

  /**
   * .setBackground
   * @param {string} type "image" or "color"
   * @param {string} value "url" or "hexcolor"
   * @returns {QuizLeaderboardCard}
   * @example setBackground("image","https://someone-image.png")
   * @example setBackground("color","#000")
   */
  setBackground(type, value) {
    if (type === "color") {
      if (value) {
        if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)) {
          this.background.type = "color";
          this.background.background = value;
          return this;
        } else {
          throw new Error(
            "Invalid color for the second argument in setForeground method. You must give a hexadecimal color.",
          );
        }
      } else {
        throw new Error("You must give a hexadecimal color as a second argument of setBackground method.");
      }
    } else if (type === "image") {
      if (value) {
        this.background.type = "image";
        this.background.background = value;
        return this;
      } else {
        throw new Error("You must give a background URL as a second argument.");
      }
    } else {
      throw new Error("The first argument of setBackground must be 'color' or 'image'.");
    }
  }

  async build() {
    registerFont(path.join(__dirname, `fonts/circularstd-black.otf`), { family: "circular-std" });
    registerFont(path.join(__dirname, `fonts/notosans-jp-black.ttf`), { family: "noto-sans-jp" });
    registerFont(path.join(__dirname, `fonts/notosans-black.ttf`), { family: "noto-sans" });
    registerFont(path.join(__dirname, `fonts/notoemoji-bold.ttf`), { family: "noto-emoji" });
    registerFont(path.join(__dirname, `fonts/notosans-kr-black.ttf`), { family: "noto-sans-kr" });

    const fillRoundRect = (ctx, x, y, w, h, r, f, s) => {
      if (typeof r === "number") {
        r = { tl: r, tr: r, br: r, bl: r };
      } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (const side in defaultRadius) {
          r[side] = r[side] || defaultRadius[side];
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
    };

    const abbreviateNumber = (value) => {
      let newValue = value;
      if (value >= 1000) {
        const suffixes = ["", "K", "M", "B", "T"];
        const suffixNum = Math.floor(("" + value).length / 3);
        let shortValue = "";
        for (let precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision));
          const dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
      }
      return newValue;
    };

    const yuksek = this.usersData.length * 74.5;

    const canvas = createCanvas(680, yuksek);
    const ctx = canvas.getContext("2d");

    ctx.globalAlpha = 1;

    if (this.background.type === "color") {
      ctx.beginPath();
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
      for (let i = 0; i < this.usersData.length; i++) {
        ctx.save();
        ctx.fillStyle = this.colors.box;
        ctx.globalAlpha = this.opacity;
        fillRoundRect(ctx, 0, Box_Y, canvas.width, 70, 15, true, false);
        ctx.globalAlpha = 1;

        const avatar = await loadImage(this.usersData[i].avatar);
        ctx.clip();
        ctx.drawImage(avatar, 0, Avatar_Y, 70, 70);
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 6;
        ctx.shadowColor = "#0a0a0a";

        ctx.fillStyle = this.colors.username;
        ctx.font = `bold 25px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "left";
        ctx.fillText(this.usersData[i].tag, 80, Tag_Y, 260);

        ctx.fillStyle = this.colors.score;
        ctx.font = `bold 20px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "right";
        ctx.fillText(
          `${this.scoreMessage} ${
            this.abbreviateNumber == true
              ? `${abbreviateNumber(this.usersData[i].score)}`
              : `${this.usersData[i].score}`
          }/${
            this.abbreviateNumber == true
              ? `${abbreviateNumber(this.usersData[i].games)}`
              : `${this.usersData[i].games}`
          }`,
          560,
          XP_Y,
          200,
        );

        if (this.usersData[i].top === 1) {
          ctx.fillStyle = this.colors.firstRank;
        } else if (this.usersData[i].top === 2) {
          ctx.fillStyle = this.colors.secondRank;
        } else if (this.usersData[i].top === 3) {
          ctx.fillStyle = this.colors.thirdRank;
        }

        ctx.font = `bold 30px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.textAlign = "right";
        ctx.fillText("#" + this.usersData[i].top, 660, Rank_Y, 75);

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
}
module.exports = { QuizLeaderboardCard };
