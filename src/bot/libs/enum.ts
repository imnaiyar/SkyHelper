export enum ContextTypes {
  /** Command can be used in guilds */
  Guild,

  /** Command can be used in Bot's DM */
  BotDM,

  /** Command can be used in other's DMs (Group DMs, DMs) */
  PrivateChannels,
}

export enum IntegrationTypes {
  /** Command is for guild */
  Guilds,

  /** Command is for User apps */
  Users,
}
