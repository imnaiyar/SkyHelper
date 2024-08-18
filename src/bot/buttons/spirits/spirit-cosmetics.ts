import { Button } from "#structures";

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, parseEmoji, StringSelectMenuBuilder } from "discord.js";

export default {
  data: {
    name: "spirit_cosmetic",
  },
  async execute(interaction, _t, client) {
    const [, value] = interaction.customId.split("-");
    const data = client.spiritsData[value];
    if (!data || !data.cosmetics?.length) {
      return void (await interaction.reply({
        content: "No cosmetics found for this spirit, or something went wrong!",
        ephemeral: true,
      }));
    }
    await interaction.deferUpdate();
    const orgData = {
      content: interaction.message.content,
      embeds: interaction.message.embeds,
      files: interaction.message.attachments.map((a) => a.url),
      components: interaction.message.components,
    };
    const cosmetics = data.cosmetics;
    let index = 1;
    let imageIndex = 1;
    const total = cosmetics.length;
    const getResponse = () => {
      const d = cosmetics[index - 1];
      const imageTotal = d.images.length;
      const stringSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("spirit_cosmetic_select")
          .setPlaceholder("Cosmetics")
          .setOptions(
            cosmetics.map((c, i) => ({
              label: c.name,
              value: i.toString(),
              emoji: c.icon,
              default: index - 1 === i,
            })),
          ),
      );
      const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...(imageTotal && imageTotal > 1
          ? [
              new ButtonBuilder()
                .setCustomId("cosmetic_image_prev")
                .setLabel("◀️ " + d.images[imageIndex === 1 ? 0 : imageIndex - 2].description)
                .setDisabled(imageIndex === 1)
                .setStyle(ButtonStyle.Success),
            ]
          : []),
        new ButtonBuilder()
          .setCustomId("cosmetics_back")
          .setLabel("Back")
          .setEmoji(
            data.call?.icon || data.action?.icon || data.emote?.icon || data.stance?.icon || "<:spiritIcon:1206501060303130664>",
          )
          .setStyle(ButtonStyle.Danger),

        ...(imageTotal && imageTotal > 1
          ? [
              new ButtonBuilder()
                .setCustomId(`cosmetic_image_next`)
                .setLabel(d.images[imageIndex >= imageTotal ? imageTotal - 1 : imageIndex].description + " ▶️")
                .setDisabled(imageIndex === imageTotal)
                .setStyle(ButtonStyle.Success),
            ]
          : []),
      );

      const embed = new EmbedBuilder()
        .setTitle(`${d.icon} ${d.name || d.type}`)
        .setURL(
          `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${(d.type ? d.type : d.name).split(" ").join("_")}`,
        )
        .setAuthor({ name: `${data.name} Cosmetics (${index}/${total})`, iconURL: data.image });
      const emojiId = parseEmoji(d.icon)?.id,
        emojiUrl = emojiId ? client.rest.cdn.emoji(emojiId) : null;
      embed.setThumbnail(emojiUrl);
      let desc = "";

      if (d.type) desc += `- **Type**: ${d.type}\n`;
      if (d.price) desc += `- **Cost**: ${d.price}\n`;
      if (d.spPrice) desc += `- **Season Cost**: ${d.spPrice}\n`;
      if (d.isSP) desc += `- This item was season pass exclusive\n`;
      if (d.notes?.length) desc += "\n**Notes**:\n" + d.notes.map((n) => `-# - ${n}`).join("\n") + "\n";

      if (imageTotal) {
        desc += `\n**${d.images[imageIndex - 1].description}**${imageTotal > 1 ? ` (${imageIndex}/${imageTotal})` : ""}`;
        embed.setImage(d.images[imageIndex - 1].image);
      }
      embed.setDescription(desc);
      return { embeds: [embed], components: [stringSelect, btns] };
    };
    const reply = await interaction.editReply(getResponse());
    const collector = reply.createMessageComponentCollector({
      filter: (i) =>
        ["spirit_cosmetic_select", "cosmetic_image_next", "cosmetics_back", "cosmetic_image_prev"].includes(i.customId),
      idle: 60_000,
    });
    collector.on("collect", async (int) => {
      const ID = int.customId;
      await int.deferUpdate();
      switch (ID) {
        case "spirit_cosmetic_select": {
          if (!int.isStringSelectMenu()) return;
          index = parseInt(int.values[0]) + 1;
          imageIndex = 1;
          await int.editReply(getResponse());
          break;
        }
        case "cosmetic_image_next": {
          imageIndex++;
          await int.editReply(getResponse());
          break;
        }
        case "cosmetic_image_prev": {
          imageIndex--;
          await int.editReply(getResponse());
          break;
        }
        case "cosmetics_back": {
          collector.stop("Cosmetic Back");
          await int.editReply(orgData);
        }
      }
    });

    collector.on("end", async (_col, reason) => {
      if (reason === "Cosmetic Back") return;
      await interaction.editReply(orgData).catch(() => {});
    });
  },
} satisfies Button;
