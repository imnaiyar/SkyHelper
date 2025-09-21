import type { ComponentInteractionMap } from "@/@types/interactions";
import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures/Client";
import {
  API,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
  Utils,
  type APIApplicationCommandAutocompleteInteraction,
  type APIApplicationCommandInteraction,
  type APIChatInputApplicationCommandInteraction,
  type APICommandAutocompleteInteractionResponseCallbackData,
  type APIContextMenuInteraction,
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  type APIInteractionResponseDeferredChannelMessageWithSource,
  type APIMessageComponentButtonInteraction,
  type APIMessageComponentSelectMenuInteraction,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
  type APIUser,
} from "@discordjs/core";
import type { RawFile } from "@discordjs/rest";

type ResponseData = APIInteractionResponseCallbackData & { files?: RawFile[] };
export class InteractionHelper {
  public replied = false;
  public deferred = false;
  public api: API;
  public user: APIUser;
  public t: ReturnType<typeof getTranslator> = getTranslator("en-US");
  constructor(
    public readonly int: APIInteraction,
    public readonly client: SkyHelper,
  ) {
    this.api = client.api;
    this.user = int.member?.user || int.user!;
  }
  async initializeT() {
    const userSettings = await this.client.schemas.getUser(this.user);
    const guild = this.int.guild_id ? this.client.guilds.get(this.int.guild_id) : null;
    const guildSettings = guild ? await this.client.schemas.getSettings(guild) : null;
    this.t = getTranslator(userSettings.language?.value ?? guildSettings?.language?.value ?? "en-US");
  }

  async reply(data: ResponseData) {
    const res = await this.api.interactions.reply(this.int.id, this.int.token, { ...data, with_response: true });
    this.replied = true;
    return res;
  }

  async defer(data?: APIInteractionResponseDeferredChannelMessageWithSource["data"]) {
    const res = await this.api.interactions.defer(this.int.id, this.int.token, { ...data, with_response: true });
    this.deferred = true;
    return res;
  }

  async deferUpdate() {
    const res = await this.api.interactions.deferMessageUpdate(this.int.id, this.int.token, { with_response: true });
    this.deferred = true;
    return res;
  }

  async update(data: ResponseData) {
    const res = await this.api.interactions.updateMessage(this.int.id, this.int.token, { ...data, with_response: true });
    this.replied = true;
    return res;
  }

  async editReply(data: ResponseData, id = "@original") {
    const msg = this.api.interactions.editReply(this.int.application_id, this.int.token, data, id);
    this.replied = true;
    return msg;
  }

  async followUp(data: ResponseData) {
    const msg = await this.api.webhooks.execute(this.int.application_id, this.int.token, data);
    this.replied = true;
    return msg;
  }

  deleteReply(msg = "@original") {
    return this.api.interactions.deleteReply(this.client.user.id, this.int.token, msg);
  }
  async launchModal(data: APIModalInteractionResponseCallbackData) {
    await this.api.interactions.createModal(this.int.id, this.int.token, data);
    this.replied = true;
  }

  fetchReply(id?: string) {
    if (!id) return this.api.interactions.getOriginalReply(this.int.application_id, this.int.token);
    return this.api.webhooks.getMessage(this.int.application_id, this.int.token, id);
  }

  respond(data: APICommandAutocompleteInteractionResponseCallbackData) {
    return this.api.interactions.createAutocompleteResponse(this.int.id, this.int.token, data);
  }
  isCommand(interaction: APIInteraction): interaction is APIApplicationCommandInteraction {
    return interaction.type === InteractionType.ApplicationCommand;
  }
  isChatInput(interaction: APIInteraction): interaction is APIChatInputApplicationCommandInteraction {
    return interaction.type === InteractionType.ApplicationCommand && interaction.data.type === 1;
  }

  isContextMenu(interaction: APIInteraction): interaction is APIContextMenuInteraction {
    return (
      interaction.type === InteractionType.ApplicationCommand &&
      (interaction.data.type === ApplicationCommandType.Message || interaction.data.type === ApplicationCommandType.User)
    );
  }

  isButton(interaction: APIInteraction): interaction is APIMessageComponentButtonInteraction {
    return interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.Button;
  }

  isAutocomplete(interaction: APIInteraction): interaction is APIApplicationCommandAutocompleteInteraction {
    return interaction.type === InteractionType.ApplicationCommandAutocomplete;
  }

  isModalSubmit(interaction: APIInteraction): interaction is APIModalSubmitInteraction {
    return interaction.type === InteractionType.ModalSubmit;
  }
  isSelect(interaction: APIInteraction): interaction is APIMessageComponentSelectMenuInteraction {
    return interaction.type === InteractionType.MessageComponent && Utils.isMessageComponentSelectMenuInteraction(interaction);
  }

  isStringSelect(interaction: APIInteraction): interaction is ComponentInteractionMap[ComponentType.StringSelect] {
    return (
      interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.StringSelect
    );
  }

  isUserSelect(interaction: APIInteraction): interaction is ComponentInteractionMap[ComponentType.UserSelect] {
    return interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.UserSelect;
  }

  isChannelSelect(interaction: APIInteraction): interaction is ComponentInteractionMap[ComponentType.ChannelSelect] {
    return (
      interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.ChannelSelect
    );
  }

  isRoleSelect(interaction: APIInteraction): interaction is ComponentInteractionMap[ComponentType.RoleSelect] {
    return interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.RoleSelect;
  }

  isMentionableSelect(interaction: APIInteraction): interaction is ComponentInteractionMap[ComponentType.MentionableSelect] {
    return (
      interaction.type === InteractionType.MessageComponent && interaction.data.component_type === ComponentType.MentionableSelect
    );
  }
}
