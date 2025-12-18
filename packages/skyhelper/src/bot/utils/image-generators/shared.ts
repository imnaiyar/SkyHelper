import { type SKRSContext2D, loadImage } from "@napi-rs/canvas";
export interface BotTitleHeaderOptions {
  botIcon?: string;
  botName: string;
  headerY?: number;
  headerX?: number;
  size?: number;
  ctx: SKRSContext2D;
}
export async function drawBotTitleHeader({ botIcon, botName, headerY = 20, headerX, size = 16, ctx }: BotTitleHeaderOptions) {
  headerX ??= ctx.canvas.width - 20;
  if (botIcon) {
    try {
      const icon = await loadImage(botIcon);
      const iconSize = size * 2.5;
      ctx.save();
      ctx.beginPath();
      ctx.arc(headerX - iconSize / 2, headerY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(icon, headerX - iconSize, headerY, iconSize, iconSize);
      ctx.restore();

      // Bot name
      ctx.font = `bold ${size}px noto-sans-bold`;
      ctx.fillStyle = "#F6EAE0";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(botName, headerX - iconSize - 10, headerY + iconSize / 2);
    } catch (error) {
      console.error("Failed to load bot icon:", error);
      // Just show bot name if icon fails
      ctx.font = `bold ${size}px noto-sans-bold`;
      ctx.fillStyle = "#F6EAE0";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(botName, headerX, headerY);
    }
  } else {
    ctx.font = `bold ${size}px noto-sans-bold`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(botName, headerX, headerY);
  }
}
