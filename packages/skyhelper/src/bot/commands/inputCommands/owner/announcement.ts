import { ANNOUNCEMENT_DATA } from "#bot/commands/commands-data/owner-commands";
import type { Command } from "#structures";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  User,
} from "discord.js";
export default {
  ...ANNOUNCEMENT_DATA,
  async messageRun({ message, client }) {
    const msg = await message.channel.send({
      content: "Please send the text you want to announce through the modal.",
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Announcement Text")
            .setCustomId("announcement_text_button")
            .setStyle(ButtonStyle.Secondary),
        ),
      ],
    });
    const collected = await msg
      .awaitMessageComponent<ComponentType.Button>({
        filter: (i) => i.user.id === message.author.id && client.config.OWNER.includes(i.user.id),
        componentType: ComponentType.Button,
        time: 60_000,
      })
      .catch(() => null);

    if (!collected) return;
    await handleModal(collected, message.author);
  },
  async interactionRun(interaction) {
    await handleModal(interaction, interaction.user);
  },
} satisfies Command;

async function handleModal(int: ButtonInteraction | ChatInputCommandInteraction, user: User) {
  const textInput = new TextInputBuilder()
    .setCustomId("announcement_text_input")
    .setLabel("Announcement Text")
    .setPlaceholder("Enter the announcement text here")
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

  const aModal = new ModalBuilder().setCustomId("announcement_text_modal" + int.id).setTitle("Announcement Text");
  aModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));

  await int.showModal(aModal);
  const modalSubmit = await int
    .awaitModalSubmit({
      filter: (i) =>
        i.user.id === user.id &&
        user.client.config.OWNER.includes(i.user.id) &&
        i.customId === "announcement_text_modal" + int.id,
      time: 2_60_000,
    })
    .catch(() => null);

  if (!modalSubmit) return;
  await modalSubmit.deferUpdate();
  const text = modalSubmit.fields.getTextInputValue("announcement_text_input");
  const data = await user.client.database.getAnnouncementGuilds();

  for (const { annoucement_channel } of data) {
    const channel = user.client.channels.cache.get(annoucement_channel!);
    if (!channel) continue;
    if (!channel.isSendable()) continue;
    await channel.send(text).catch(() => null);
  }
  await modalSubmit.editReply({ content: "Announcement sent to all the announcement channels.", components: [] });
}
