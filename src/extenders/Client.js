const { Client } = require('discord.js');

Client.prototype.codeBlock = function (content, language = 'js') {
  return `\`\`\`${language}\n${content}\`\`\``;
};