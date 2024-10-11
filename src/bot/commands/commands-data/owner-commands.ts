import type { Command } from "#bot/structures/Command";
import { ApplicationCommandOptionType, Message } from "discord.js";

// #region Annoouncement
export const ANNOUNCEMENT_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "announce",
  description: "announce new release/updates to the subscribed channels",
  prefix: {
    aliases: ["an", "as"],
  },
  ownerOnly: true,
  category: "OWNER",
};

// #region Eval
export const EVAL_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "eval",
  description: "Evaluate a JavaScript code",
  ownerOnly: true,
  prefix: {
    flags: ["a", "async", "haste", "depth", "silent", "s"],
    aliases: ["e", "ev"],
    usage: "<script>",
    minimumArgs: 1,
  },
  botPermissions: ["ViewChannel", "SendMessages"],
  category: "OWNER",
};

// #region Blacklist
export const BLACKLIST_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "blacklist",
  description: "blacklist a guild or an user.",
  prefix: {
    aliases: ["bl"],
    minimumArgs: 1,
    usage: "g <id> Doing some shady stuff",
    subcommands: [
      {
        trigger: "g <id> [reason]",
        description: "Adds a guild to blacklist",
      },
      {
        trigger: "rmg <id>",
        description: "Removes a guild from blacklist",
      },
      {
        trigger: "u <id> [reason]",
        description: "Adds a user to blacklist",
      },
      {
        trigger: "rmu <id>",
        description: "Removes a user from blacklist",
      },
      {
        trigger: "glist",
        description: "Lists all blacklisted guilds",
      },
    ],
  },
  validations: [
    {
      type: "message",
      message: "ID must be provided with this subcommand",
      callback(msg, messageOptions) {
        if (!(msg instanceof Message) || !messageOptions?.args) return true;
        const sub = messageOptions.args[0];
        if (["g", "rmG", "u", "rmU"].includes(sub) && !messageOptions.args[1]) return false;
        return true;
      },
    },
  ],
  category: "OWNER",
  ownerOnly: true,
};

// #region Exec
export const EXEC_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "run",
  description: "runs commands on the console",
  prefix: {
    aliases: ["exec"],
    minimumArgs: 1,
    usage: "<command>",
  },
  category: "OWNER",
  ownerOnly: true,
};

// #region ListServers
export const LIST_SERVERS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "listserver",
  description: "list servers",
  prefix: {
    aliases: ["ls"],
    usage: "[guildId | name]",
  },
  ownerOnly: true,
};

// #region Register
export const REGISTER_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "register",
  description: "register slash commands",
  ownerOnly: true,
  category: "OWNER",
  prefix: {
    aliases: ["r", "rs"],
  },
};

// #region SendMessage
export const SEND_MESSAGE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "sendmessage",
  description: "Send a message to a user",
  prefix: {
    aliases: ["sm"],
    minimumArgs: 2,
    usage: "<user|userId> <message>",
  },
  slash: {
    options: [
      {
        name: "user",
        description: "the user to send a message to",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
    guilds: ["852141490105090059"],
  },
  category: "OWNER",
  userPermissions: ["Administrator"],
  validations: [
    {
      type: "message",
      message: "You need to provide a message to send",
      callback(_msg, { args }) {
        if (!args[1]) return false;
        return true;
      },
    },
    {
      type: "message",
      message: "You need to provide a valid user to send a message to",
      callback(msg, { args }) {
        if (!args[0] && !msg.mentions.users.first()) return false;
        return true;
      },
    },
  ],
  ownerOnly: true,
};
