import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
class TreeDiagram {
  constructor(width = 800, height = 1200) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.nodeSpacing = 100; // Vertical space between nodes
    this.itemSpacing = 80; // Horizontal space for items
    this.iconSize = 40; // Size of the icons
  }

  async drawTree(data) {
    // Clear canvas
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    let currentY = this.canvas.height / 2;
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      // Draw center line connecting nodes
      if (i > 0) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000000";
        this.ctx.moveTo(centerX, currentY - this.nodeSpacing + 40);
        this.ctx.lineTo(centerX, currentY);
        this.ctx.stroke();
      }

      // Process each item in the node
      for (const item of node) {
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
        try {
          const icon = await loadImage(item.icon);
          const iconY = item.position === "center" ? currentY : currentY - 45;
          const iconX = item.position === "center" ? x : item.position === "left" ? x - 20 : x + 20;
          this.ctx.drawImage(icon, iconX, iconY, this.iconSize, this.iconSize);
        } catch (error) {
          console.error("Error loading image:", error);
          // Draw placeholder rectangle if image fails to load
          this.ctx.fillStyle = "#cccccc";
          this.ctx.fillRect(x, currentY, this.iconSize, this.iconSize);
        }

        // Draw price if exists
        if (item.price) {
          this.ctx.font = "14px Arial";
          this.ctx.fillStyle = "#000000";
          const textX = item.position === "center" ? x : item.position === "left" ? x - 40 : x - 5;
          const textY = item.position === "center" ? currentY + 10 : currentY - 15;
          this.ctx.fillText(`${item.price}`, textX + this.iconSize + 5, textY + this.iconSize / 2 + 5);
        }

        // Draw exclusive icon if exists
        if (item.exclusive) {
          try {
            const exclusiveIcon = await loadImage(
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3a/Season-of-Moomin-icon.png",
            );
            const exclusiveX = item.position === "center" ? x - 25 : item.position === "left" ? x - 40 : x + 40;
            const exclusiveY = item.position === "center" ? currentY + 35 : currentY;
            this.ctx.drawImage(exclusiveIcon, exclusiveX + this.iconSize / 2 - 10, exclusiveY - 50, 20, 20);
          } catch (error) {
            console.error("Error loading exclusive icon:", error);
          }
        }
      }

      currentY += this.nodeSpacing;
    }

    return this.canvas;
  }

  getXPosition(centerX, position) {
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
}

// Example usage:
async function createDiagram() {
  const treeDiagram = new TreeDiagram();
  const canvas = await treeDiagram.drawTree(
    [
      [
        {
          name: "Blessings Node",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
          price: 6,
          position: "center",
        },
        {
          name: "Bridge Painting",
          position: "left",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/56/Comfort-of-Kindness-Painting-Prop-icon.png",
          exclusive: true,
        },
      ],
      [
        {
          position: "center",
          name: "Hair",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/62/Comfort-of-Kindness-Hair-icon.png",
          price: 16,
        },
        {
          name: "Blessings Node",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
          position: "left",
          exclusive: true,
        },
      ],
      [
        {
          position: "center",
          name: "Blessings Node",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
          price: 20,
        },
        {
          name: "Somethin",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5f/Comfort-of-Kindness-Chandelier-Prop-icon.png",
          position: "left",
          exclusive: true,
        },
      ],
      [
        {
          position: "center",
          name: "Bow tie",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a7/Comfort-of-Kindness-Neck-Accessory-icon.png",
          price: 24,
        },
        {
          name: "Blessings Node",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
          position: "left",
          exclusive: true,
        },
      ],
      [
        {
          position: "center",
          name: "Blessings Node",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
          price: 32,
        },
        {
          name: "Cape",
          position: "left",
          exclusive: true,
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c8/Comfort-of-Kindness-Cape-icon.png",
        },
      ],
      [
        {
          position: "center",
          name: "Heart",
          icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/52/Season-of-Moomin-Seasonal-Heart-icon.png",
          price: 3,
          exclusive: true,
        },
      ],
    ].reverse(),
  );

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("tree-diagram.png", buffer);
}

createDiagram().catch(console.error);
