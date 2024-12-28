import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { Node } from "../types.js";
export class TreeDiagram {
  nodeSpacing = 150;
  itemSpacing = 100;
  iconSize = 60;
  canvas = createCanvas(800, 600);
  ctx = this.canvas.getContext("2d");
  maxNode = 1;
  nodesY: { node: number; y: number }[] = [];
  constructor(
    private readonly nodes: Node,
    private readonly spiritName: string,
    private readonly user: { username: string },
  ) {
    this.maxNode = Math.max(...nodes.map((item) => item.node));
    if (this.maxNode > 3) this.canvas.height = 800 + (this.maxNode - 3) * 60;
    let currentY = this.canvas.height - 150;
    const nodesDone: number[] = [];
    this.nodesY = this.nodes
      .sort((a, b) => a.node - b.node)
      .map((item) => {
        if (nodesDone.includes(item.node)) return null;
        if (item.node > 1) currentY -= this.nodeSpacing - 20;
        nodesDone.push(item.node);
        return {
          node: item.node,
          y: currentY,
        };
      })
      .filter((x) => x !== null);
  }

  async drawTree() {
    const data = this.nodes;
    // Clear canvas
    this.ctx.fillStyle = "#d1cccc";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw spirit name and username at top left of convase
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText(this.spiritName, 20, 40);
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`@${this.user.username}`, 20, 70);
    const centerX = this.canvas.width / 2;
    for (const item of data) {
      const currentY = this.getYPosition(item.node);
      // Draw center line connecting nodes
      if (item.node < this.maxNode) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000000";
        this.ctx.moveTo(centerX, currentY - this.nodeSpacing + 80);
        this.ctx.lineTo(centerX, currentY - 5);
        this.ctx.stroke();
      }

      const x = this.getXPosition(centerX, item.position);

      // Draw connecting line if item is on the left or right
      if (item.position !== "center") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000000";
        const lineX = item.position === "left" ? centerX - 20 : centerX + 20;
        this.ctx.moveTo(lineX, currentY + 18);
        this.ctx.lineTo(x + this.iconSize / 2, currentY + this.iconSize / 2 - 40);
        this.ctx.stroke();
      }

      // Draw icon
      const iconY = item.position === "center" ? currentY : currentY - 45;
      const iconX = item.position === "center" ? x : item.position === "left" ? x - 25 : x + 30;
      try {
        const icon = await loadImage(item.icon);
        if (!item.acquired) this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(icon, iconX, iconY, this.iconSize, this.iconSize);
        this.ctx.globalAlpha = 1;
      } catch (error) {
        console.error("Error loading image:", error);
        // Draw placeholder rectangle if image fails to load
        this.ctx.fillStyle = "#cccccc";
        this.ctx.fillRect(x, currentY, this.iconSize, this.iconSize);
      }

      // Draw a small green checkmark on the bottom right of the icon if acquired
      if (item.acquired) {
        const checkmark = await loadImage("assets/images/green-checkmark.png");
        const checkX = item.position === "right" ? iconX + 10 : iconX;
        this.ctx.drawImage(checkmark, checkX + this.iconSize - 25, iconY + this.iconSize - 30, 30, 30);
      }

      // Draw price if exists
      if (item.price) {
        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "#000000";
        const textX = item.position === "center" ? x : item.position === "left" ? x - 45 : x;
        const textY = item.position === "center" ? currentY + 10 : currentY - 10;
        this.ctx.fillText(`${item.price}`, textX + this.iconSize + 5, textY + this.iconSize / 2 + 5);
      }

      // Draw exclusive icon if exists
      if (item.exclusive) {
        try {
          const exclusiveIcon = await loadImage(
            "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3a/Season-of-Moomin-icon.png",
          );
          const exclusiveX = item.position === "center" ? x - 25 : item.position === "left" ? x - 45 : x + 45;
          const exclusiveY = item.position === "center" ? currentY + 35 : currentY;
          this.ctx.drawImage(exclusiveIcon, exclusiveX + this.iconSize / 2 - 10, exclusiveY - 50, 20, 20);
        } catch (error) {
          console.error("Error loading exclusive icon:", error);
        }
      }
    }

    return this.canvas;
  }

  getXPosition(centerX: number, position: "center" | "left" | "right") {
    switch (position) {
      case "left":
        return centerX - this.itemSpacing - this.iconSize - 20;
      case "right":
        return centerX + this.itemSpacing + 20;
      case "center":
      default:
        return centerX - this.iconSize / 2;
    }
  }

  getYPosition(node: number) {
    return this.nodesY.find((item) => item.node === node)!.y;
  }
}
