import type {
  APIBaseInteraction,
  APIMessageChannelSelectInteractionData,
  APIMessageComponentButtonInteraction,
  APIMessageMentionableSelectInteractionData,
  APIMessageRoleSelectInteractionData,
  APIMessageSelectMenuInteractionData,
  APIMessageStringSelectInteractionData,
  APIMessageUserSelectInteractionData,
  ComponentType,
  InteractionType,
} from "@discordjs/core";

export type SelectMenuWrapper<T extends APIMessageSelectMenuInteractionData> = APIBaseInteraction<
  InteractionType.MessageComponent,
  T
> &
  Required<
    Pick<
      APIBaseInteraction<InteractionType.MessageComponent, T>,
      "app_permissions" | "channel_id" | "channel" | "data" | "message"
    >
  >;

export interface ComponentInteractionMap {
  [ComponentType.Button]: APIMessageComponentButtonInteraction;
  [ComponentType.StringSelect]: SelectMenuWrapper<APIMessageStringSelectInteractionData>;
  [ComponentType.UserSelect]: SelectMenuWrapper<APIMessageUserSelectInteractionData>;
  [ComponentType.ChannelSelect]: SelectMenuWrapper<APIMessageChannelSelectInteractionData>;
  [ComponentType.RoleSelect]: SelectMenuWrapper<APIMessageRoleSelectInteractionData>;
  [ComponentType.MentionableSelect]: SelectMenuWrapper<APIMessageMentionableSelectInteractionData>;
}

export type MessageComponentType =
  | ComponentType.Button
  | ComponentType.ChannelSelect
  | ComponentType.MentionableSelect
  | ComponentType.RoleSelect
  | ComponentType.StringSelect
  | ComponentType.UserSelect;
