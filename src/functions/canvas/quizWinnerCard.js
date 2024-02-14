const canvas = require("canvas");
const { colorFetch } = require("./helpers/colorFetch");
const path = require("path");
const { readFile } = require("fs/promises");

canvas.registerFont(path.join(__dirname, `fonts/circularstd-black.otf`), { family: "circular-std"});
canvas.registerFont(path.join(__dirname, `fonts/notosans-jp-black.ttf`), { family: "noto-sans-jp"});
canvas.registerFont(path.join(__dirname, `fonts/notosans-black.ttf`), { family: "noto-sans"});
canvas.registerFont(path.join(__dirname, `fonts/notoemoji-bold.ttf`), { family: "noto-emoji"});
canvas.registerFont(path.join(__dirname, `fonts/notosans-kr-black.ttf`), { family: "noto-sans-kr"});

class QuizWinnerCard {
  constructor(member, wins, total) {
    this.name = member?.displayName || member.user.globalName;
    this.author = member.user.username;
    this.color = "auto";
    this.brightness = 50;
    this.thumbnail = member?.displayAvatarURL({ extension: "jpg"}) || member.user.displayAvatarURL({ extension: "jpg"});
    this.points = `${wins}/${total} points`;
  }
  async build() {
    console.log('hi')
    if (!this.name) {
      throw new Error("Missing name parameter");
    }
    if (!this.author) {
      throw new Error("Missing author parameter");
    }

    try {
    let thumbnailURL = this.thumbnail;

    const validatedColor = await colorFetch(this.color || "ff0000", parseInt(this.brightness) || 0, thumbnailURL);
    const bg = await readFile(path.join(__dirname, "assets/winnerBg.png"));
    console.log('hi mif')
    const bgImg = new canvas.Image();
    console.log('1')
    console.log('2')
    console.log('3')
    const background = await readFile(path.join(__dirname, "assets/background.png"));
    console.log('hi sec')
    const backgroundImage = new canvas.Image();
    
    console.log('hi for')
    const thumbnailCanvas = canvas.createCanvas(564, 564);
    const thumbnailCtx = thumbnailCanvas.getContext("2d");

    let thumbnailImage;

    thumbnailImage = await canvas.loadImage(thumbnailURL, {
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
        },
      },
    });
    console.log('hi3')
    const thumbnailSize = Math.min(thumbnailImage.width, thumbnailImage.height);
    const thumbnailX = (thumbnailImage.width - thumbnailSize) / 2;
    const thumbnailY = (thumbnailImage.height - thumbnailSize) / 2;

    thumbnailCtx.beginPath();
    const cornerRadius2 = 45;
    thumbnailCtx.moveTo(0 + cornerRadius2, 0);
    thumbnailCtx.arcTo(thumbnailCanvas.width, 0, thumbnailCanvas.width, thumbnailCanvas.height, cornerRadius2);
    thumbnailCtx.arcTo(thumbnailCanvas.width, thumbnailCanvas.height, 0, thumbnailCanvas.height, cornerRadius2);
    thumbnailCtx.arcTo(0, thumbnailCanvas.height, 0, 0, cornerRadius2);
    thumbnailCtx.arcTo(0, 0, thumbnailCanvas.width, 0, cornerRadius2);
    thumbnailCtx.closePath();
    thumbnailCtx.clip();

    console.log('hi4')
    thumbnailCtx.drawImage(
      thumbnailImage,
      thumbnailX,
      thumbnailY,
      thumbnailSize,
      thumbnailSize,
      0,
      0,
      thumbnailCanvas.width,
      thumbnailCanvas.height
    );

    if (this.name.length > 15) this.name = `${this.name.slice(0, 15)}...`;
    if (this.author.length > 15) this.author = `${this.author.slice(0, 15)}...`;
    if (this.points.length > 15) this.author = `${this.author.slice(0, 15)}...`;
    console.log('hi5')
    const canvasWidth = 1282;
    const canvasHeight = 592;
    const imgWidth = 1270;
    const imgHeight = 350;

    // Calculate the center coordinates for the image
    const centerX = (canvasWidth - imgWidth) / 2;
    const centerY = (canvasHeight - imgHeight) / 2;

    const image = canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx = image.getContext("2d");

    // Draw the original image (ogImg) as the background
    bgImg.onload = () => ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
    bgImg.src = bg;
    // Draw the img at the center of the canvas
    backgroundImage.onload = () => ctx.drawImage(backgroundImage, centerX + 20, centerY + 30, imgWidth, imgHeight);
    backgroundImage.src = background;
    console.log('hi6')
    ctx.fillStyle = `#${validatedColor}`;
    ctx.font = `75px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
    ctx.fillText(this.name, 90, 260);

    ctx.fillStyle = "#b8b8b8";
    ctx.font = `50px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
    ctx.fillText(this.author, 95, 330);

    ctx.fillStyle = "#b8b8b8";
    ctx.font = `50 circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
    ctx.fillText(this.points, 95, 455);

    ctx.drawImage(thumbnailCanvas, 850, centerY + 35, 380, centerY + 220);
    console.log('hi7')
    return image.toBuffer("image/png");
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = { QuizWinnerCard };
