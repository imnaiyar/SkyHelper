import type { Command } from "#bot/structures/Command";
import { ApplicationCommandOptionType } from "discord.js";

// #region Annoouncement
export const ANNOUNCEMENT_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "announce",
  description: "announce new release/updates to the subscribed channels",
  prefix: {
    aliases: ["an", "as"],
  },
  ownerOnly: true,
  category: "Owner",
  userPermissions: ["Administrator"],
  data: {
    guilds: ["852141490105090059"],
  },
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
  category: "Owner",
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
      callback(_msg, _t, messageOptions) {
        if (messageOptions.args) return { status: true };
        const sub = messageOptions.args[0];
        if (["g", "rmG", "u", "rmU"].includes(sub) && !messageOptions.args[1]) {
          return { status: false, message: "Id must be provided with the subcommand" };
        }
        return { status: true };
      },
    },
  ],
  category: "Owner",
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
  category: "Owner",
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
  category: "Owner",
};

// #region Register
export const REGISTER_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "register",
  description: "register data commands",
  ownerOnly: true,
  category: "Owner",
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
  data: {
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
  category: "Owner",
  userPermissions: ["Administrator"],
  validations: [
    {
      type: "message",
      callback(_msg, _t, { args }) {
        if (!args[1]) return { status: false, message: "You need to provide a message to send" };
        return { status: true };
      },
    },
    {
      type: "message",
      callback(msg, _t, { args }) {
        if (!args[0] && !msg.mentions.users.first()) return { status: false, message: "You need to provide a user" };
        return { status: true };
      },
    },
  ],
  ownerOnly: true,
};
