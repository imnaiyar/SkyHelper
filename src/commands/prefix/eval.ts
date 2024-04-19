import { PrefixCommand, SkyHelper } from "#structures";
import { Stopwatch } from "@sapphire/stopwatch";
import { Type } from "@sapphire/type";
import { EmbedBuilder } from "discord.js";
// @ts-ignore
// eslint-disable-next-line
import * as d from "discord.js";
import { postToHaste } from "skyhelper-utils";
import util from "node:util";
export default {
  data: {
    name: "eval",
    description: "Evaluate a JavaScript code",
    flags: ["a", "async", "haste", "depth", "suppress", "s"],
    ownerOnly: true,
    aliases: ["e", "ev"],
    botPermissions: ["ViewChannel", "SendMessages"],
    category: "OWNER",
  },
  async execute(message, args, flags) {
    /* eslint-disable no-unused-vars */
    /* @ts-ignore */
    const { author, guild, member, channel, client } = message;
    let code = args.join(" ");
    if (flags.hasAny(["a", "async"])) code = `(async () => { ${code} })()`;
    let response;
    const depth = parseFloat(flags.getFlag("depth")?.split("=")[1] || "0") || 0;
    let errored = false;
    try {
      const time = new Stopwatch().start();
      const output = await eval(code);
      time.stop();
      const type = new Type(output).toString();
      response = await buildSuccessResponse(output, message.client as SkyHelper, type, time, flags.has("haste"), depth);
    } catch (ex) {
      errored = true;
      response = buildErrorResponse(ex);
    }
    if (flags.hasAny(["s", "suppress"]) && !errored) return;
    message.channel.send(response);
  },
} satisfies PrefixCommand;

// prettier-ignore
async function buildSuccessResponse(output: any, client: SkyHelper, type: string, time: any, haste: boolean, depth: number): Promise<{
  embeds: EmbedBuilder[];
}> {
  // Token protection
  output = util.inspect(output, { depth: depth }).replaceAll(client.token, "~~REDACTED~~");
  let embOutput;

  if (!haste && output.length <= 2048) {
    embOutput = `\`\`\`js\n${output}\n\`\`\``;
  } else {
    embOutput = await postToHaste(output);
  }
  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Output" })
    .setDescription(embOutput)
    .addFields({
      name: `Type`,
      value: `\`\`\`\n${type ? type : "Unknown"}\`\`\``,
    })
    .setColor("Random")
    .setFooter({
      text: `⏱️ Took ${time}`,
    })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}

function buildErrorResponse(err: any) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Error" })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor("Red")
    .setTimestamp();

  return { embeds: [embed] };
}
