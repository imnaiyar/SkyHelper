import {
  type APIAllowedMentions,
  type APIEmbed,
  type APIMessage,
  type APIMessageComponent,
  type APIWebhook,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { makeURLSearchParams, REST } from "@discordjs/rest";
import { logger } from "./Logger.js";
const api = new REST().setToken(process.env.TOKEN);
interface WebhookExtraOptions {
  thread_id?: string;
  retries: number;
}
/** Error codes for which the operation will be retried in case of incident */
const retraibleErrors = [
  "ECONNRESET", // Forcefully closed connection
  "ETIMEDOUT", // Connection timed out
  "ENOTFOUND", // DNS lookup failed
  "EAI_AGAIN", // DNS lookup timed out
  "ECONNABORTED", // Connection aborted
  "ESOCKETTIMEDOUT", // Socket timed out
  "ERR_CONNECTION_REFUSED", // Connection refused
  "UND_ERR_CONNECT_TIMEOUT", // Connection timed out
  "ECONNREFUSED", // Connection refused
  "ConnectionRefused",
  "ConnectTimeout",
];
class Webhook {
  public id: string;
  public token: string | undefined;
  constructor(data: WebhookData) {
    this.id = data.id;
    this.token = data.token;
  }

  /**
   * Executes the webhook with retries in case of connection errors
   * @param options Payload options for the webhook
   * @param retries Number of tries in case of connection errors
   * @returns The message created by the webhook
   */
  async send(
    options: WebhookMessageCreateOptions,
    { thread_id, retries }: WebhookExtraOptions = { retries: 3 },
  ): Promise<APIMessage> {
    try {
      this.token ??= (await this.getWebhook(this.id)).token;
      const query = makeURLSearchParams({ wait: true, thread_id });
      // eslint-disable-next-line @typescript-eslint/return-await
      return api.post(Routes.webhook(this.id, this.token), { body: { ...options }, query }) as Promise<APIMessage>;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (retries > 0 && retraibleErrors.includes(err.code)) {
        logger.warn(`Retrying webhook send... Attempts left: ${retries}`);
        await new Promise((r) => setTimeout(r, 2000));
        return this.send(options, { retries: retries - 1, thread_id });
      }
      throw err;
    }
  }

  /**
   * Edits a message sent by this webhook, also retries in case of connection errors
   * @param messageId The id of the message to edit
   * @param options Edit options
   * @returns The edited message
   */
  async editMessage(
    messageId: string,
    options: WebhookEditMessageOptions,
    { thread_id, retries }: WebhookExtraOptions = { retries: 3 },
  ): Promise<APIMessage> {
    try {
      this.token ??= (await this.getWebhook(this.id)).token!;
      if (!messageId) throw new Error("Yout must provide message id to edit");
      const query = makeURLSearchParams({ thread_id });

      // eslint-disable-next-line @typescript-eslint/return-await
      return api.patch(Routes.webhookMessage(this.id, this.token, messageId), {
        body: { ...options },
        query,
      }) as Promise<APIMessage>;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (retries > 0 && retraibleErrors.includes(err.code)) {
        logger.warn(`Retrying webhook edit... Attempts left: ${retries}`);
        await new Promise((r) => setTimeout(r, 2000));
        return this.editMessage(messageId, options, { retries: retries - 1, thread_id });
      }
      throw err;
    }
  }

  /**
   * Deletes a message sent by this webhook
   * @param messageId The id of the message to delete
   * @returns
   */
  async deleteMessage(messageId: string, thread_id?: string) {
    this.token ??= (await this.getWebhook(this.id)).token!;
    if (!messageId) throw new Error("Yout must provide message id to delete");
    const query = makeURLSearchParams({ thread_id });
    return await api.delete(Routes.webhookMessage(this.id, this.token, messageId), { query });
  }

  async getWebhook(id: string, token?: string): Promise<APIWebhook> {
    return (await api.get(Routes.webhook(id, token))) as APIWebhook;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.delete(Routes.webhook(this.id, this.token));
  }
}

export { Webhook };
interface WebhookData {
  id: string;
  token?: string;
}

/* Only adding options that'll be using, this is not all o fthe options that can be passed,*/
export interface WebhookMessageCreateOptions {
  content?: string;
  embeds?: APIEmbed[];
  components?: APIMessageComponent[];
  username?: string;
  avatar_url?: string;
  allowed_mentions?: APIAllowedMentions;
  flags?: MessageFlags;
}

export type WebhookEditMessageOptions = Omit<WebhookMessageCreateOptions, "username" | "avatar_url">;
