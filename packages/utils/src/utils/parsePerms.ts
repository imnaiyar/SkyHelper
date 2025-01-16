const permissions = {
  AddReactions: "Add Reactions",
  Administrator: "Administrator",
  AttachFiles: "Attach Files",
  BanMembers: "Ban Members",
  ChangeNickname: "Change Nickname",
  Connect: "Connect",
  CreateInstantInvite: "Create Instant Invite",
  CreatePrivateThreads: "Create Private Threads",
  CreatePublicThreads: "Create Public Threads",
  DeafenMembers: "Deafen Members",
  EmbedLinks: "Embed Links",
  KickMembers: "Kick Members",
  ManageChannels: "Manage Channels",
  ManageEmojisAndStickers: "Manage Emojis and Stickers",
  ManageEvents: "Manage Events",
  ManageGuild: "Manage Server",
  ManageMessages: "Manage Message",
  ManageNicknames: "Manage Nicknames",
  ManageRoles: "Manage Roles",
  ManageThreads: "Manage Threads",
  ManageWebhooks: "Manage Webhooks",
  MentionEveryone: "Mention Everyone",
  ModerateMembers: "Moderate Members",
  MoveMembers: "Move Members",
  MuteMembers: "Mute Members",
  PrioritySpeaker: "Priority Speaker",
  ReadMessageHistory: "Read Message History",
  RequestToSpeak: "Request to Speak",
  SendMessages: "Send messages",
  SendMessagesInThreads: "Send Messages In Threads",
  SendTTSMessages: "Send TTS messages",
  Speak: "Speak",
  Stream: "Video",
  UseApplicationCommands: "Use Application Commands",
  UseEmbeddedActivities: "Use Embedded Activities",
  UseExternalEmojis: "Use External Emojis",
  UseExternalStickers: "Use External Stickers",
  UseVAD: "Use Voice Activity",
  ViewAuditLog: "View Audit Log",
  ViewChannel: "View Channel",
  ViewGuildInsights: "View Server Insights",
} as const;

export type Permission = keyof typeof permissions;

/**
 * @param {string[]|string} perms
 */
export const parsePerms = (perms: Permission | Permission[]): string => {
  if (Array.isArray(perms)) {
    return perms.map((perm) => `\`${permissions[perm]}\` `).join(", ");
  } else {
    return `\`${permissions[perms] || perms}\``;
  }
};
