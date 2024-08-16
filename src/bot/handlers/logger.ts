import { EmbedBuilder, WebhookClient, codeBlock } from "discord.js";
import config from "#bot/config";
import util from "node:util";
import { postToHaste } from "skyhelper-utils";
import { Logger } from "@nestjs/common";
import { captureException } from "@sentry/node";
const webhookLogger = process.env.ERROR_LOGS ? new WebhookClient({ url: process.env.ERROR_LOGS }) : undefined;

async function sendWebhook(id: string, content: any, err?: any): Promise<void> {
  if (!content && !err) return;
  const embed = new EmbedBuilder().setColor("Blue").setAuthor({ name: err?.name ?? "Error" });
  const errString: string = err?.stack || err || content?.stack || content;
  embed.setDescription(`${codeBlock("js", errString.toString().substring(0, 4000))}`);
  embed.addFields({
    name: "Description",
    value: `${content?.message || content || err?.message || "NA"}`,
  });
  const fullErr = await postToHaste(util.inspect(err ?? content, { depth: null })).catch(() => {});
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
  static success(content: string, message?: string) {
    Logger.log(content, message);
  }

  /**
   * @param content
   */
  static log(content: string, message?: string) {
    Logger.log(content, message);
  }

  /**
   * @param content
   */
  static warn(content: string, message: string) {
    Logger.warn(content, message);
  }

  /**
   * @param content
   * @param ex
   * @returns The error ID
   */
  static error(content: any, ex?: any) {
    const id = captureException(ex || content);
    if (ex) {
      Logger.error(ex, `${id} => ${content}`);
    } else {
      Logger.error(content, `${id}`);
    }
    if (process.isBun) console.error(content, ex);
    if (webhookLogger) sendWebhook(id, content, ex);
    return id;
  }

  /**
   * @param content
   */
  static debug(content: string) {
    Logger.debug(content);
  }
}
