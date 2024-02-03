const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "e",
    description: "Evaluate JavaScript code",
    category: "OWNER",
  },
  async execute(message, args, client) {
    const code = args.join(" ");
    let response;

    if (code.includes("process.env")) {
      return message.channel.send("You cannot evaluate code containing process.env.");
    }

    try {
      const output = await eval(code);
      response = buildSuccessResponse(output, client);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    message.channel.send(response);
  },
};

const buildSuccessResponse = (output, client) => {
  // Token protection
  output = require("util").inspect(output, { depth: 0 }).replaceAll(client.token, "LoL");

  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Output" })
    .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
    .setColor("Green")
    .setTimestamp();

  return { embeds: [embed] };
};

const buildErrorResponse = (err) => {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Error" })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor("Red")
    .setTimestamp();

  return { embeds: [embed] };
};
