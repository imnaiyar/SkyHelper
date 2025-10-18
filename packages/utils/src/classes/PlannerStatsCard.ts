import { createCanvas, loadImage, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import type { APIUser } from "discord-api-types/v10";
import path from "node:path";

GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../shared/fonts/NotoSans-Regular.ttf`), "noto-sans");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, `../shared/fonts/notosans-black.ttf`), "noto-sans-bold");

export interface ProfileCardProgressData {
  items: {
    total: number;
    unlocked: number;
    percentage: number;
  };
  nodes: {
    total: number;
    unlocked: number;
    percentage: number;
  };
  wingedLights: {
    total: number;
    unlocked: number;
    percentage: number;
  };
  iaps: {
    total: number;
    bought: number;
    percentage: number;
  };
}

export interface ProfileCardOptions {
  user: APIUser;
  progress: ProfileCardProgressData;
  botIcon?: string;
  botName?: string;
}

// Category colors matching the reference image style
const CATEGORY_COLORS = {
  items: { bg: "#4A90E2", fill: "#2E5F8F" },
  nodes: { bg: "#7B68EE", fill: "#4B3A9E" },
  wingedLights: { bg: "#50C878", fill: "#2E7D4F" },
  iaps: { bg: "#FF6B9D", fill: "#B8385E" },
};

/**
 * Generate a profile card showing user progress in Sky: Children of the Light planner
 * @param options Configuration options for the profile card
 * @returns Buffer containing the PNG image
 */
export async function generatePlannerProfileCard(options: ProfileCardOptions): Promise<Buffer> {
  const { user, progress, botIcon, botName = "SkyHelper" } = options;

  // Canvas dimensions - wider rectangle
  const width = 1000;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx: SKRSContext2D = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#0f0f1e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern overlay
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < width; i += 20) {
    for (let j = 0; j < height; j += 20) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(i, j, 1, 1);
    }
  }
  ctx.globalAlpha = 1;

  // Header section with bot info (top right)
  const headerY = 20;
  const headerRightX = width - 20;

  // Bot icon and name (top right)
  if (botIcon) {
    try {
      const icon = await loadImage(botIcon);
      const iconSize = 40;
      ctx.save();
      ctx.beginPath();
      ctx.arc(headerRightX - iconSize / 2, headerY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(icon, headerRightX - iconSize, headerY, iconSize, iconSize);
      ctx.restore();

      // Bot name
      ctx.font = `bold 16px noto-sans-bold`;
      ctx.fillStyle = "#F6EAE0";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(botName, headerRightX - iconSize - 10, headerY + iconSize / 2);
    } catch (error) {
      console.error("Failed to load bot icon:", error);
      // Just show bot name if icon fails
      ctx.font = `bold 16px noto-sans-bold`;
      ctx.fillStyle = "#F6EAE0";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(botName, headerRightX, headerY);
    }
  } else {
    ctx.font = `bold 16px noto-sans-bold`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(botName, headerRightX, headerY);
  }

  // User profile section (left side with avatar and name side by side)
  const profileY = 110;
  const profileLeftMargin = 60;

  // User avatar
  const avatarSize = 100;
  const avatarX = profileLeftMargin + avatarSize / 2;
  try {
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    const avatar = await loadImage(avatarUrl);

    // Draw avatar with circular mask and border
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, profileY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.strokeStyle = "#4A90E2";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarSize / 2, profileY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error("Failed to load user avatar:", error);
    // Draw placeholder circle
    ctx.beginPath();
    ctx.arc(avatarX, profileY, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#333344";
    ctx.fill();
    ctx.strokeStyle = "#4A90E2";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // User display name and username (to the right of avatar)
  const displayName = user.global_name ?? user.username;
  const username = user.username;
  const nameX = avatarX + avatarSize / 2 + 30;

  ctx.font = `bold 32px noto-sans-bold`;
  ctx.fillStyle = "#F6EAE0";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const nameY = user.global_name ? profileY - 15 : profileY;
  ctx.fillText(displayName, nameX, nameY);

  if (user.global_name) {
    ctx.font = `20px noto-sans`;
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText(`@${username}`, nameX, profileY + 20);
  }

  // Progress section with circular indicators
  const progressStartY = profileY + 80;
  const centerX = width / 2;

  // Title for progress section
  ctx.font = `bold 20px noto-sans-bold`;
  ctx.fillStyle = "#F6EAE0";
  ctx.textAlign = "center";
  ctx.fillText("Sky Planner Progress Stats", centerX, progressStartY);

  const categories = [
    { key: "items", label: "Items", data: progress.items },
    { key: "nodes", label: "Spirit Nodes", data: progress.nodes },
    { key: "wingedLights", label: "Winged Lights", data: progress.wingedLights },
    { key: "iaps", label: "IAPs", data: progress.iaps },
  ] as const;

  // Circular progress bars layout - 4 items in a row
  const circleRadius = 45;
  const circleSpacing = 220;
  const circlesPerRow = 4;
  const startX = centerX - (circleSpacing * (circlesPerRow - 1)) / 2;
  const startY = progressStartY + 80;

  categories.forEach((category, index) => {
    const row = Math.floor(index / circlesPerRow);
    const col = index % circlesPerRow;
    const x = startX + col * circleSpacing;
    const y = startY + row * 150;
    const colors = CATEGORY_COLORS[category.key];

    // Draw circular progress
    drawCircularProgress(ctx, x, y, circleRadius, category.data.percentage, colors.bg, colors.fill);

    // Category label below circle
    ctx.font = `bold 14px noto-sans-bold`;
    ctx.fillStyle = "#F6EAE0";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(category.label, x, y + circleRadius + 15);

    // Progress stats below label
    const statsText =
      category.key === "iaps"
        ? `${category.data.bought}/${category.data.total}`
        : `${category.data.unlocked}/${category.data.total}`;
    ctx.font = `12px noto-sans`;
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText(statsText, x, y + circleRadius + 35);
  });

  // Date footer
  const footerY = height - 30;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  ctx.font = `14px noto-sans`;
  ctx.fillStyle = "#6B7280";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Generated on ${currentDate}`, centerX, footerY);

  return canvas.toBuffer("image/png");
}

/**
 * Helper function to draw a circular progress indicator
 */
function drawCircularProgress(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  radius: number,
  percentage: number,
  backgroundColor: string,
  fillColor: string,
): void {
  const lineWidth = 12;
  const startAngle = -Math.PI / 2; // Start at top
  const endAngle = startAngle + (Math.PI * 2 * percentage) / 100;

  // Background circle (light gray)
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = backgroundColor + "33"; // 20% opacity
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Progress arc
  if (percentage > 0) {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Percentage text in center
  ctx.font = `bold 20px noto-sans-bold`;
  ctx.fillStyle = "#F6EAE0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${percentage}%`, x, y);
}
