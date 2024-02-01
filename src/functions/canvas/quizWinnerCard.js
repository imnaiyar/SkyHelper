

const canvas = require("@napi-rs/canvas");
const { colorFetch } = require("./helpers/colorFetch");
const path = require("path");
const { readFile } = require('fs/promises');

canvas.GlobalFonts.registerFromPath(path.join(__dirname, `fonts/circularstd-black.otf`), "circular-std");
canvas.GlobalFonts.registerFromPath(path.join(__dirname, `fonts/notosans-jp-black.ttf`), "noto-sans-jp");
canvas.GlobalFonts.registerFromPath(path.join(__dirname, `fonts/notosans-black.ttf`), "noto-sans");
canvas.GlobalFonts.registerFromPath(path.join(__dirname, `fonts/notoemoji-bold.ttf`), "noto-emoji");
canvas.GlobalFonts.registerFromPath(path.join(__dirname, `fonts/notosans-kr-black.ttf`), "noto-sans-kr");

class quizWinnerCard {
    constructor(member, wins, total) {
        this.name = member?.displayName || member.user.globalName;
        this.author = member.user.username;
        this.color = "auto";
        this.brightness = 50;
        this.thumbnail = member?.displayAvatarURL() || member.user.displayAvatarURL() ;
        this.points = `${wins}/${total} points`
    }
    async build() {
        if (!this.name) { throw new Error('Missing name parameter'); }
        if (!this.author) { throw new Error('Missing author parameter'); }

        let thumbnailURL = this.thumbnail;

        const validatedColor = await colorFetch(
            this.color || 'ff0000',
            parseInt(this.brightness) || 0,
            thumbnailURL
        );
        const bg = await readFile(path.join(__dirname, 'assets/winnerBg.png'));
		const bgImg = new canvas.Image();
        bgImg.src = bg;
        const ogImg = await canvas.loadImage(bgImg);
        const background = await readFile(path.join(__dirname, 'assets/background.png'));
		const backgroundImage = new canvas.Image();
        backgroundImage.src = background;
        const img = await canvas.loadImage(backgroundImage);

        const thumbnailCanvas = canvas.createCanvas(564, 564);
        const thumbnailCtx = thumbnailCanvas.getContext('2d');

        let thumbnailImage;

        thumbnailImage = await canvas.loadImage(thumbnailURL, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
                }
            }
        });

        const thumbnailSize = Math.min(thumbnailImage.width, thumbnailImage.height);
        const thumbnailX = (thumbnailImage.width - thumbnailSize) / 2;
        const thumbnailY = (thumbnailImage.height - thumbnailSize) / 2;

        thumbnailCtx.beginPath();
        const cornerRadius2 = 45;
        thumbnailCtx.moveTo(0 + cornerRadius2, 0);
        thumbnailCtx.arcTo(
            thumbnailCanvas.width,
            0,
            thumbnailCanvas.width,
            thumbnailCanvas.height,
            cornerRadius2,
        );
        thumbnailCtx.arcTo(
            thumbnailCanvas.width,
            thumbnailCanvas.height,
            0,
            thumbnailCanvas.height,
            cornerRadius2,
        );
        thumbnailCtx.arcTo(
            0,
            thumbnailCanvas.height,
            0,
            0,
            cornerRadius2,
        );
        thumbnailCtx.arcTo(
            0,
            0,
            thumbnailCanvas.width,
            0,
            cornerRadius2,
        );
        thumbnailCtx.closePath();
        thumbnailCtx.clip();

        thumbnailCtx.drawImage(
            thumbnailImage,
            thumbnailX,
            thumbnailY,
            thumbnailSize,
            thumbnailSize,
            0,
            0,
            thumbnailCanvas.width,
            thumbnailCanvas.height,
        );

        if (this.name.length > 15) this.name = `${this.name.slice(0, 15)}...`;
        if (this.author.length > 15) this.author = `${this.author.slice(0, 15)}...`;
        if (this.points.length > 15) this.author = `${this.author.slice(0, 15)}...`;

        const canvasWidth = 1282;
const canvasHeight = 592;
const imgWidth = 1270;
const imgHeight = 350;

// Calculate the center coordinates for the image
const centerX = (canvasWidth - imgWidth) / 2;
const centerY = (canvasHeight - imgHeight) / 2;

const image = canvas.createCanvas(canvasWidth, canvasHeight);
const ctx = image.getContext('2d');

// Draw the original image (ogImg) as the background
ctx.drawImage(ogImg, 0, 0, canvasWidth, canvasHeight);

// Draw the img at the center of the canvas
ctx.drawImage(img, centerX+20, centerY+30, imgWidth, imgHeight);

        ctx.fillStyle = `#${validatedColor}`;
        ctx.font = `75px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.fillText(this.name, 90, 260);

        ctx.fillStyle = '#b8b8b8';
        ctx.font = `50px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.fillText(this.author, 95, 330);

        ctx.fillStyle = '#b8b8b8';
        ctx.font = `50 circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
        ctx.fillText(this.points, 95, 455);

        ctx.drawImage(thumbnailCanvas, 850, centerY+35, 380, centerY+220);

        return image.toBuffer('image/png');
    }
}

module.exports = { quizWinnerCard };