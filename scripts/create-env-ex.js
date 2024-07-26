import fs from "node:fs";
const file = fs.readFileSync(".env").toString("utf8");
let content = "";
for (const l of file.split("\n")) {
  content += `${l.replace(/([A-Za-z0-9_-]+([^\\])=).*/i, "$1")}\n`;
}
fs.writeFileSync(".env.example", content);