import type { Command } from "@/structures";
/* import { Type } from "@sapphire/type"; */ // TODO: uncomment when use of Bun is done
import * as d from "@discordjs/core";

import { postToHaste, resolveColor } from "@skyhelperbot/utils";
import util from "node:util";
import { EVAL_DATA } from "@/modules/commands-data/owner-commands";

export default {
  ...EVAL_DATA,
  async messageRun({ message, args, flags, client }) {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { author, member } = message;
    const channel = client.channels.get(message.channel_id);
    const guild = message.guild_id && client.guilds.get(message.guild_id);
    /* eslint-enable @typescript-eslint/no-unused-vars */

    let code = args.join(" ");
    if (flags.hasAny(["a", "async"])) code = `(async () => { ${code} })()`;
    let response;
    const depth = parseFloat(flags.getFlag("depth")?.split("=")[1] || "0") || 0;
    let errored = false;
    const formatTime = (duration: number) =>
      duration < 1
        ? `${(duration * 1000).toFixed(2)} µs`
        : duration < 1000
          ? `${duration.toFixed(2)} ms`
          : `${(duration / 1000).toFixed(2)} s`;

    try {
      const start = performance.now();
      const output = await eval(code);
      const time = formatTime(performance.now() - start);
      const type = typeof output;
      response = await buildSuccessResponse(output, type, time, flags.has("haste"), depth, code);
    } catch (ex) {
      errored = true;
      response = await buildErrorResponse(ex);
    }
    if (flags.hasAny(["s", "silent"]) && !errored) return;
    await client.api.channels.createMessage(message.channel_id, response);
  },
} satisfies Command;

async function buildSuccessResponse(
  output: any,
  type: string,
  time: any,
  haste: boolean,
  depth: number,
  input: any,
): Promise<{
  embeds: d.APIEmbed[];
}> {
  // Token protection
  output = (typeof output !== "string" ? util.inspect(output, { depth: depth }) : output).replaceAll(
    process.env.TOKEN!,
    "~~REDACTED~~",
  );
  let embOutput;

  if (!haste && output.length <= 2048) {
    embOutput = `\`\`\`js\n${output}\n\`\`\``;
  } else {
    embOutput = await postToHaste(output);
  }
  const embed: d.APIEmbed = {
    author: { name: "📤 Output" },
    description: `**Input**\n\n` + `\`\`\`\n${input}\n\`\`\`` + "\n**Output**\n\n" + embOutput,
    fields: [
      {
        name: `Type`,
        value: `\`\`\`\n${type ? type : "Unknown"}\`\`\``,
      },
    ],
    color: resolveColor("Random"),
    footer: {
      text: `⏱️ Took ${time}`,
    },
    timestamp: new Date().toISOString(),
  };

  return { embeds: [embed] };
}

async function buildErrorResponse(err: any) {
  const post = await postToHaste(util.inspect(err, { depth: null }));
  const embed: d.APIEmbed = {
    author: { name: "📤 Error" },
    description: "```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```",
    color: resolveColor("Red"),
    timestamp: new Date().toISOString(),
  };

  return { content: `Error: <${post}>`, embeds: [embed] };
}
