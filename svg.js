const generateSvg = (svgContent) => {
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
};
import { GlobalFonts } from "@napi-rs/canvas";
import path from "node:path";
import fs from "node:fs";

function registerFont(fontPath, fontName) {
  const rootFontsPath = path.join(import.meta.dirname, "./fonts", fontPath);
  if (fs.existsSync(rootFontsPath)) {
    GlobalFonts.registerFromPath(rootFontsPath, fontName);
  } else {
    const srcFontsPath = path.join(import.meta.dirname, "./fonts", fontPath);
    if (fs.existsSync(srcFontsPath)) {
      GlobalFonts.registerFromPath(srcFontsPath, fontName);
    } else {
      throw new Error(`Font file not found at ${rootFontsPath} or ${srcFontsPath}`);
    }
  }
}

export { registerFont };

export { generateSvg };
