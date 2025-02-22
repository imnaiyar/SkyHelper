import { NextApiRequest, NextApiResponse } from "next";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { join } from "node:path";

const getIndex = (param: string | string[]) => (Array.isArray(param) ? param[0] : param);

GlobalFonts.registerFromPath(join(process.cwd(), "public/OpenSans-BoldItalic.ttf"), "open-sans");
GlobalFonts.registerFromPath(join(process.cwd(), "public/ShortBaby-Mg2w.ttf"), "shortb");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    mainTitle = "Home",
    websiteName = "SkyHelper Docs",
    website = "docs.skyhelper.xyz",
    path = "/",
    description,
  } = req.query;

  const width = 1200;
  const height = 630;

  /** =============== Draw A Black Canvas ============= */
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background color
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  /** =============== Canvas Draw End ============= */

  /** =============== Draw Website Title ============= */
  ctx.font = "bold 30 shortb";
  ctx.fillStyle = "#bababa";
  ctx.textBaseline = "middle";
  const textX = 150;
  const textY = 100;
  ctx.fillText(sanitizeText(getIndex(websiteName)), textX, textY);
  /** =============== Title End ============= */

  /** =============== Draw Website logo besides the Title ============= */
  const image = await loadImage("https://skyhelper.xyz/assets/img/boticon.png");
  const logoHeight = 50;
  const logoWidth = (logoHeight / image.height) * image.width;

  // Position the logo to the left of the text
  const logoX = textX - logoWidth - 20; // Adjust the spacing between the logo and text
  const logoY = textY - logoHeight / 2; // Center the logo vertically with the text

  ctx.drawImage(image, logoX, logoY, logoWidth, logoHeight);
  /** =============== Logo End ============= */

  /** =============== Draw the main page title Text  ============= */
  ctx.font = "bold 100 shortb";
  ctx.fillStyle = "#bababa";
  ctx.textAlign = "left";
  ctx.fillText(sanitizeText(getIndex(mainTitle)), 150, height / 3 + 30);
  /** =============== Main Title End ============= */

  /** ============ Add Descriptions if present ========= */
  if (description) {
    (ctx.font = "bold 30 open-sans"), (ctx.fillStyle = "#bababa"), (ctx.textAlign = "left");
    ctx.fillText(sanitizeText(getIndex(description)), 120, height / 2 + 30);
  }

  /** =============== Draw A Rectangle Box to display website link ============= */
  const boxPadding = 60;
  const boxWidth = 300;
  const boxHeight = 60;
  const boxX = width - boxWidth - boxPadding;
  const boxY = height - boxHeight - boxPadding;
  const borderRadius = 20;

  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(boxX + borderRadius, boxY);
  ctx.lineTo(boxX + boxWidth - borderRadius, boxY);
  ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius, borderRadius);
  ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius);
  ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - borderRadius, boxY + boxHeight, borderRadius);
  ctx.lineTo(boxX + borderRadius, boxY + boxHeight);
  ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius, borderRadius);
  ctx.lineTo(boxX, boxY + borderRadius);
  ctx.arcTo(boxX, boxY, boxX + borderRadius, boxY, borderRadius);
  ctx.closePath();

  // Fill the box with a brown background
  ctx.fillStyle = "#8B4513";
  ctx.fill();

  // Draw the website link text
  ctx.font = "bold 25 open-sans";
  ctx.fillStyle = "#fff"; // White text
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.fillText(getIndex(website), boxX + boxWidth / 2, boxY + boxHeight / 2);
  /** =============== DBox End ============= */

  /** =============== Draw Page Path at bottom Lefft  ============= */
  ctx.font = "bold 25 open-sans";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(getIndex(path), 100, height - 80);
  /** =============== Page path end ============= */

  /** =============== Send the Image ============= */
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, immutable, no-transform, s-maxage=31536000, max-age=31536000");

  res.send(canvas.toBuffer("image/png"));
}

const sanitizeText = (content: string) => decodeURIComponent(content);
