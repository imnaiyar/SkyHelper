import { PrefixCommand } from "#structures";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
export default {
  data: {
    name: "announce",
    description: "announce new release/updates to the subscribed channels",
    aliases: ["an", "as"],
    ownerOnly: true,
    category: "OWNER",
  },
  async execute({ message, client }) {
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
    const textInput = new TextInputBuilder()
      .setCustomId("announcement_text_input")
      .setLabel("Announcement Text")
      .setPlaceholder("Enter the announcement text here")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const aModal = new ModalBuilder().setCustomId("announcement_text_modal" + collected.id).setTitle("Announcement Text");
    aModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));

    await collected.showModal(aModal);
    const modalSubmit = await collected
      .awaitModalSubmit({
        filter: (i) =>
          i.user.id === message.author.id &&
          client.config.OWNER.includes(i.user.id) &&
          i.customId === "announcement_text_modal" + collected.id,
        time: 2_60_000,
      })
      .catch(() => null);

    if (!modalSubmit) return;
    await modalSubmit.deferUpdate();
    const text = modalSubmit.fields.getTextInputValue("announcement_text_input");
    const data = await client.database.getAnnouncementGuilds();

    for (const { annoucement_channel } of data) {
      const channel = client.channels.cache.get(annoucement_channel!);
      if (!channel) continue;
      if (!channel.isTextBased()) continue;
      await channel.send(text);
    }
    await modalSubmit.editReply({ content: "Announcement sent to all the announcement channels.", components: [] });
  },
} satisfies PrefixCommand;
