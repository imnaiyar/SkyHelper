import { type ContextMenuCommand } from "./ContextMenuCommands";
import { ContextTypes, UserContext } from "#libs/types";
import { ApplicationCommandType } from "discord.js";

export default <ContextMenuCommand<UserContext>>{
  data: {
    name: "test",
    type: ApplicationCommandType.User,
    integration_types: [0, 1],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  async execute(interaction) {
    const user = interaction.targetUser;
    await interaction.reply(user.toString());
  },
};
