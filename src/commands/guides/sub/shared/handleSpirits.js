const spiritsData = require("./spiritsData");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = async (int, value, ephemeral, userChoices) => {
  const data = spiritsData[value];
  const embed = new EmbedBuilder()
    .setDescription(
      `### ${data.emote?.icon || data.stance?.icon || data.call?.icon} [${
        data.name
      }](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")})`
    )
    .addFields(
      {
        name: "Type",
        value: data.type,
      },
      {
        name: "Realm",
        value: `${int.client.emojisMap.get("realms")[data.realm]} ${data.realm}`,
      }
    )
    .setAuthor({ name: "Spirit Summary" });
  if (data.season)
    embed.addFields({ name: "Season", value: `${int.client.emojisMap.get("season")[data.season]} ${data.season}` });
  if (data.ts)
    embed.addFields({
      name: "TS Summary",
      value: data.ts.returned
        ? data.ts.dates.map((date) => `\n- ${date}`).join("\n")
        : "This spirit has not returned yet",
    });
  const row = new ActionRowBuilder();
  const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle("2");

  const emoteBtn = new ButtonBuilder().setCustomId("spirit_emote").setStyle("1").setLabel("Emote");

  const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle("1").setLabel("Friendship Tree");

  const cosmeticBtn = new ButtonBuilder().setCustomId("spirit_cosmetic").setStyle("1").setLabel("Cosmetics");

  const callBtn = new ButtonBuilder().setCustomId("spirit_call").setLabel("Call").setStyle("1");

  const stanceBtn = new ButtonBuilder().setCustomId("spirit_stance").setLabel("Stance").setStyle("1");

  if (data.main) {
    embed.addFields({ name: `Infographics by Ed.7`, value: " " });
    embed.setImage(data.main.image);
  } else {
    embed.addFields({ name: `Friendship Tree ${data.tree.credit}`, value: " " });
    row.addComponents(lctnBtn);
  }

  if (data.cosmetics) row.addComponents(cosmeticBtn);
  if (data.emote) row.addComponents(emoteBtn.setEmoji(data.emote?.icon));
  if (data.stance) row.addComponents(stanceBtn.setEmoji(data.stance?.icon));
  if (data.call) row.addComponents(callBtn.setEmoji(data.call?.icon));

  const msg = await int.reply({ embeds: [embed], components: [row], ephemeral: ephemeral, fetchReply: true });
  const filter = int.client.getFilter(int);
  const collector = msg.createMessageComponentCollector({
    filter,
    idle: 20 * 1000,
  });

  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const customID = inter.customId;
    const newEmbed = EmbedBuilder.from(embed);
    switch (customID) {
      case "spirit_location": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = treeBtn;
        const lastField = newEmbed.fields[embed.fields.length - 1];
        lastField.name = `Location by ${data.location.credit}`;
        lastField.value = " ";
        newEmbed.setImage(data.location.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit_emote": {
        await handleEmote(inter, data, collector);
        break;
      }
      case "spirit_cosmetic": {
        await handleCosmetic(inter, data, collector);
        break;
      }
      case "spirit_tree": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = lctnBtn;
        const lastField = newEmbed.fields[embed.fields.length - 1];
        lastField.name = `Friendship Tree ${data.tree.credit}`;
        lastField.value = " ";
        newEmbed.setImage(data.tree.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit_emote_home": {
        await inter.editReply({ embeds: [embed], components: [row] });
        break;
      }
    }
  });

  collector.on("end", async () => {
    const reply = await msg.fetch().catch((err) => {});
    if (!reply) return;
    const components = ActionRowBuilder.from(reply.components[0]);
    components?.components?.forEach((component) => component.setDisabled(true));
    reply?.edit({ components: [components] }).catch((err) => {});
  });
};

async function handleEmote(int, data, collector) {
  let page = 1;
  const total = data.emote.level.length - 1;
  const getEmote = () => {
    const emote = data.emote.level[page - 1];
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Emote preview of ${data.name}` })
      .setDescription(
        `### ${data.emote.icon} [${emote.title}](https://sky-children-of-the-light.fandom.com/wiki/${data.name
          .split(" ")
          .join("_")}#Expression)`
      )
      .setImage(emote.image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("spirit_emote_prev")
        .setLabel(`⬅️ ${data.emote.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`)
        .setStyle("1")
        .setDisabled(page === 1),
      new ButtonBuilder().setCustomId("spirit_emote_home").setEmoji(data.emote.icon).setStyle("3"),
      new ButtonBuilder()
        .setCustomId("spirit_emote_next")
        .setLabel(`${data.emote.level[page]?.title.slice(-7) || emote.title.slice(-7)} ➡️`)
        .setStyle("1")
        .setDisabled(page === total + 1)
    );

    return {
      embeds: [embed],
      components: [row],
    };
  };
  const response = getEmote();
  await int.editReply(response);

  const wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  collector.on("collect", async (inter) => {
    const customID = inter.customId;
    await wait(1500);
    switch (customID) {
      case "spirit_emote_prev": {
        page--;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
      case "spirit_emote_next": {
        page++;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
    }
  });
}

async function handleCosmetic(int, data, collector) {}
