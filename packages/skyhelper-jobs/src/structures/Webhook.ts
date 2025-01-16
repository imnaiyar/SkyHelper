import { APIAllowedMentions, APIEmbed, APIMessage, APIMessageComponent, APIWebhook, Routes } from "discord-api-types/v10";
import { makeURLSearchParams, REST } from "@discordjs/rest";
import { logger } from "./Logger.js";
const api = new REST().setToken(process.env.TOKEN);

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
  "ConnectTimeout"
];
class Webhook {
  private id: string;
  private token: string | undefined;
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
  async send(options: WebhookMessageCreateOptions, retries = 3): Promise<APIMessage> {
    try {
      if (!this.token) this.token = (await this.getWebhook(this.id)).token;
      const query = makeURLSearchParams({ wait: true });
      return api.post(Routes.webhook(this.id, this.token), { body: { ...options }, query }) as Promise<APIMessage>;
    } catch (err: any) {
      if (retries > 0 && retraibleErrors.includes(err.code)) {
        logger.warn(`Retrying webhook send... Attempts left: ${retries}`);
        await new Promise((r) => setTimeout(r, 2000));
        return this.send(options, retries - 1);
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
  async editMessage(messageId: string, options: WebhookEditMessageOptions, retries = 3) {
    try {
      if (!this.token) this.token = (await this.getWebhook(this.id)).token!;
      if (!messageId) throw new Error("Yout must provide message id to edit");
      return api.patch(Routes.webhookMessage(this.id, this.token, messageId), { body: { ...options } });
    } catch (err: any) {
      if (retries > 0 && retraibleErrors.includes(err.code)) {
        logger.warn(`Retrying webhook send... Attempts left: ${retries}`);
        await new Promise((r) => setTimeout(r, 2000));
        return this.send(options, retries - 1);
      }
      throw err;
    }
  }

  /**
   * Deletes a message sent by this webhook
   * @param messageId The id of the message to delete
   * @returns
   */
  async deleteMessage(messageId: string) {
    if (!this.token) this.token = (await this.getWebhook(this.id)).token!;
    if (!messageId) throw new Error("Yout must provide message id to delete");
    return await api.delete(Routes.webhookMessage(this.id, this.token, messageId));
  }

  async getWebhook(id: string, token?: string): Promise<APIWebhook> {
    return (await api.get(Routes.webhook(id, token))) as APIWebhook;
  }

  async delete() {
    api.delete(Routes.webhook(this.id, this.token));
  }
}

export { Webhook };
type WebhookData = {
  id: string;
  token?: string;
};

/* Only adding options that'll be using, this is not all o fthe options that can be passed,*/
export type WebhookMessageCreateOptions = {
  content?: string;
  embeds?: APIEmbed[];
  components?: APIMessageComponent[];
  username?: string;
  avatar_url?: string;
  allowed_mentions?: APIAllowedMentions;
};

export type WebhookEditMessageOptions = Omit<WebhookMessageCreateOptions, "username" | "avatar_url">;
