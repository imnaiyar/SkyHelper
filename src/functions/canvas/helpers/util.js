const { loadImage } = require("canvas");
const { join } = require("path");

const colors = {
  blue: "#7289DA",
  white: "#FFFFFF",
  lightgrey: "#99AAB5",
  grey: "#2C2F33",
  darkgrey: "#23272A",
  black: "#000000",
  online: "#2db85b",
  offline: "#666",
  dnd: "#cc3737",
  idle: "#dab026",
};

function fancyCount(n) {
  if (n > 1000000) return Math.floor(n / 1000000) + "M";

  if (n > 1000) {
    if (n < 10000) return (n / 1000).toFixed(1) + "k";
    return Math.floor(n / 1000) + "k";
  }

  return Math.floor(n) + "";
}

module.exports = { colors, fancyCount };
