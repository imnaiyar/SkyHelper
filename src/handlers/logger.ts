import { EmbedBuilder, WebhookClient } from "discord.js";
import pino from "pino";
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

async function sendWebhook(content: any, err?: any): Promise<void> {
  if (!content && !err) return;
  const link = await postToHaste(err ?? content);

  const embed = new EmbedBuilder().setColor("Blue").setAuthor({ name: err?.name ?? "Error" });

  embed.setDescription(`${link}`);
  embed.addFields({
    name: "Description",
    value: `${content?.message || content || err?.message || "NA"}`,
  });

  webhookLogger?.send({ username: "Logs", embeds: [embed] }).catch(() => {});
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
   */
  static error(content: any, ex?: any) {
    if (ex) {
      pinoLogger.error(ex, `${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content);
    }
    if (webhookLogger) sendWebhook(content, ex);
  }

  /**
   * @param content
   */
  static debug(content: string) {
    pinoLogger.debug(content);
  }
}
