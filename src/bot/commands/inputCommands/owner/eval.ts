import type { Command, SkyHelper } from "#structures";
import { Stopwatch } from "@sapphire/stopwatch";
import { Type } from "@sapphire/type";
import { EmbedBuilder, codeBlock } from "discord.js";

import * as d from "discord.js";
import { postToHaste } from "skyhelper-utils";
import util from "node:util";
import { EVAL_DATA } from "#bot/commands/commands-data/owner-commands";
export default {
  ...EVAL_DATA,
  async messageRun({ message, args, flags }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      response = await buildSuccessResponse(output, message.client as SkyHelper, type, time, flags.has("haste"), depth, code);
    } catch (ex) {
      errored = true;
      response = await buildErrorResponse(ex);
    }
    if (flags.hasAny(["s", "silent"]) && !errored) return;
    message.channel.send(response);
  },
} satisfies Command;

// prettier-ignore
async function buildSuccessResponse(output: any, client: SkyHelper, type: string, time: any, haste: boolean, depth: number, input: any): Promise<{
  embeds: EmbedBuilder[];
}> {
  // Token protection
  output = (typeof output !== "string" ? util.inspect(output, { depth: depth }) : output).replaceAll(client.token, "~~REDACTED~~");
  let embOutput;

  if (!haste && output.length <= 2048) {
    embOutput = codeBlock("js", output);
  } else {
    embOutput = await postToHaste(output);
  }
  const embed = new d.EmbedBuilder()
    .setAuthor({ name: "📤 Output" })
    .setDescription(`**Input**\n\n` + codeBlock(input) + "\n**Output**\n\n" + embOutput)
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

async function buildErrorResponse(err: any) {
  const post = await postToHaste(util.inspect(err, { depth: null }));
  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Error" })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor("Red")
    .setTimestamp();

  return { content: `Error: <${post}>`, embeds: [embed] };
}
