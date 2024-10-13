import { SEND_MESSAGE_DATA } from "#bot/commands/commands-data/owner-commands";
import type { Command } from "#bot/structures/Command";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  ...SEND_MESSAGE_DATA,
  async messageRun({ message, args, client }) {
    const user = message.mentions.users.first() || (await client.users.fetch(args[0]));
    const msg = args.slice(1).join(" ");
    // not catching explicitly to know if something went wrong
    await user.send(msg);
  },
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user", true);
    const modal = new ModalBuilder()
      .setCustomId(`send_message_modal:${interaction.id}`)
      .setTitle("Send Message")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("message")
            .setPlaceholder("The message to send")
            .setLabel("The message")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph),
        ),
      );
    await interaction.showModal(modal);
    const modal_collect = await interaction
      .awaitModalSubmit({
        filter: (i) => i.customId === `send_message_modal:${interaction.id}`,
        time: 9e4,
      })
      .catch(() => null);
    if (!modal_collect) return;
    await modal_collect.deferReply({ ephemeral: true });
    const msg = modal_collect.fields.getTextInputValue("message");
    // not catching explicitly to know if something went wrong
    await user.send(msg);
    await modal_collect.editReply("Message sent!");
  },
} satisfies Command;
