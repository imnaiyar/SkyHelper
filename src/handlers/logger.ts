import { EmbedBuilder, WebhookClient, codeBlock } from "discord.js";
import pino from "pino";
import config from "#src/config";
import { v4 as genId } from "uuid";
import util from "node:util";
import { postToHaste } from "skyhelper-utils";
const webhookLogger = process.env.ERROR_LOGS ? new WebhookClient({ url: process.env.ERROR_LOGS }) : undefined;

let toHide = true;
if (process.env.npm_lifecycle_event === "dev" || process.env.npm_lifecycle_event === "commands") {
  toHide = false;
}

const pinoLogger = pino.default(
  {
    level: "debug",
  },
  pino.multistream([
    {
      level: "info",
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          singleLine: false,
          hideObject: toHide,
          customColors: "info:green,warn:yellow,error:red,message:cyan,",
        },
      }),
    },
    {
      level: "debug",
      stream: pino.destination({
        dest: `${process.cwd()}/logs/combined-${new Date().getFullYear()}.${
          new Date().getMonth() + 1
        }.${new Date().getDate()}.log`,
        sync: true,
        mkdir: true,
      }),
    },
  ]),
);

async function sendWebhook(id: string, content: any, err?: any): Promise<void> {
  if (!content && !err) return;
  const embed = new EmbedBuilder().setColor("Blue").setAuthor({ name: err?.name ?? "Error" });
  const errString: string = err?.stack || err || content?.stack || content;
  embed.setDescription(`${codeBlock("js", errString.toString().substring(0, 4000))}`);
  embed.addFields({
    name: "Description",
    value: `${content?.message || content || err?.message || "NA"}`,
  });
  const fullErr = await postToHaste(util.inspect(err ?? content, { depth: null }));
  webhookLogger
    ?.send({ username: "Error Log", avatarURL: config.BOT_ICON, embeds: [embed], content: `Error ID: \`${id}\`\n${fullErr}` })
    .catch(() => {});
}

/**
 * Custom logger
 */
export default class {
  /**
   * @param content
   */
  static success(content: string) {
    pinoLogger.info(content);
  }

  /**
   * @param content
   */
  static log(content: string) {
    pinoLogger.info(content);
  }

  /**
   * @param content
   */
  static warn(content: string) {
    pinoLogger.warn(content);
  }

  /**
   * @param content
   * @param ex
   * @returns The error ID
   */
  static error(content: any, ex?: any) {
    const id = genId();
    if (ex) {
      pinoLogger.error(ex, `${id} ${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content, `${id}`);
    }
    if (webhookLogger) sendWebhook(id, content, ex);
    return id;
  }

  /**
   * @param content
   */
  static debug(content: string) {
    pinoLogger.debug(content);
  }
}
