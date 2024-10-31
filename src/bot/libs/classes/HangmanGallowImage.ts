import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { User } from "discord.js";

export async function drawHangmanGallow(remainingLives: number, player: User) {
  const width = 500,
    height = 400,
    canvas = createCanvas(width, height),
    ctx = canvas.getContext("2d"),
    totalLives = 6;

  // #region Bot Info
  const botLogo = await loadImage(player.client.user.displayAvatarURL({ extension: "png" }));
  const logoX = width - 200;
  const logoY = 20;
  const logoSize = 40;

  // Draw logo arc
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.drawImage(botLogo, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  // Bot name
  ctx.font = "25px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("SkyHelper", logoX + logoSize + 10, logoY + 30);

  // Game name
  ctx.font = "14px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Skygame: Hangman", logoX + logoSize + 10, logoY + 50);

  // #region Base
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";

  // Draw the gallows
  ctx.beginPath();
  ctx.moveTo(50, 350); // base
  ctx.lineTo(150, 350);
  ctx.moveTo(100, 350); // pole
  ctx.lineTo(100, 80);
  ctx.lineTo(250, 80); // top bar
  ctx.lineTo(250, 120); // rope
  ctx.stroke();

  const lifeStages = totalLives - remainingLives;

  // #region Head
  if (lifeStages >= 1) {
    // Use user's profile as head
    const img = await loadImage(player.displayAvatarURL({ extension: "png" })).catch(() => null);

    ctx.beginPath();
    ctx.arc(250, 150, 30, 0, Math.PI * 2); // Circle around the profile
    ctx.closePath();
    ctx.stroke();

    ctx.save();
    ctx.clip();
    if (img) ctx.drawImage(img, 220, 120, 60, 60);
    ctx.restore();
  }

  // #region Body
  if (lifeStages >= 2) {
    ctx.beginPath();
    ctx.moveTo(250, 180);
    ctx.lineTo(250, 270);
    ctx.stroke();
  }

  // Left Arm
  if (lifeStages >= 3) {
    ctx.beginPath();
    ctx.moveTo(250, 210);
    ctx.lineTo(210, 250);
    ctx.stroke();
  }

  // Right Arm
  if (lifeStages >= 4) {
    ctx.beginPath();
    ctx.moveTo(250, 210);
    ctx.lineTo(290, 250);
    ctx.stroke();
  }

  // Left Leg
  if (lifeStages >= 5) {
    ctx.beginPath();
    ctx.moveTo(250, 270);
    ctx.lineTo(210, 340);
    ctx.stroke();
  }

  // Right Leg
  if (lifeStages >= 6) {
    ctx.beginPath();
    ctx.moveTo(250, 270);
    ctx.lineTo(290, 340);
    ctx.stroke();
  }

  // User's username
  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`${player.username}`, 300, 155);

  return canvas.toBuffer("image/png");
}
