const { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");

/**
 * Utilities for guide commands
 */
module.exports = class GuideUtils {
  /**
   * Returns StringSelect Menu ActionRow for guides
   * @param {string} customId - The custom Id for the select menu
   * @param {object} choices - The options to include in select menu
   * @param {string} placeholder - Placeholder for the select menu
   * @param {Boolean} back - Whether to include back option or not
   */
  static rowBuilder(customId, choices, placeholder, back) {
    let options = choices;
    if (back) {
      options = [
        ...choices,
        {
          label: "Back",
          value: "back",
          emoji: "⬅️",
        },
      ];
    }
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder).addOptions(options)
    );
  }

  /**
   * Responds with the chosen guide
   * @param {import('discord.js').Interaction} int - The SelectMenu Interaction
   * @param {object} answers - The guides to search from
   * @param {string} value - the value to search for
   * @param {Boolean} ephemeral - Whether reply should be ephemeral
   */
  static async respond(int, answers, value, ephemeral) {
    await int.deferReply({ ephemeral: ephemeral });
    const response = answers.getResponse(value);
    if (!response) {
      return int.followUp("Guide is still under development. Thank you for your patience");
    }
    await int.followUp(response);
    return;
  }

  /**
   * Returns embed and components for given datas
   * @param {Array} data Array of realms particular data
   * @param {Number} page Current index of the array
   * @param {Number} total Last index of the array
   * @param {String} author Text to put in Embed's author field
   * @param {String} emoji For Summary rows
   */
  static getRealmsRow(data, page, total, author, emoji) {
    const embed = data[page - 1];
    const emb = new EmbedBuilder()
      .setTitle(embed.title)
      .setImage(embed?.image)
      .setAuthor({ name: author })
      .setFooter({ text: `Page ${page}/${total + 1}` });
    if (embed.description) emb.setDescription(embed.description);
    const row = [];
    const btns = new ActionRowBuilder();

    btns.addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel(`⬅️ ${data[page - 2]?.title || data[page - 1].title}`)
        .setDisabled(page - 1 === 0)
        .setStyle("2")
    );

    if (emoji) {
      btns.addComponents(new ButtonBuilder().setCustomId("realm").setEmoji(emoji).setStyle("3"));
    }

    btns.addComponents(
      new ButtonBuilder()
        .setCustomId("forward")
        .setLabel(`${data[page]?.title || data[page - 1].title} ➡️`)
        .setDisabled(page - 1 === total)
        .setStyle("2")
    );

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setPlaceholder("Choose an area.")
        .setCustomId("area-menu")
        .addOptions(
          data.map((area, index) => ({
            label: area.title,
            default: area.title === embed.title,
            value: "area_" + index.toString(),
          }))
        )
    );
    row.push(menu, btns);
    return { embeds: [emb], components: row };
  }
};
