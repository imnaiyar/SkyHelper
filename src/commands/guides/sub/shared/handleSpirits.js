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
    .addFields({
        name: "Type",
        value: `<:purpleright:1207596527737118811> ${data.type}`,
      })
    .setAuthor({ name: "Spirit Summary" });
    if (data.realm) embed.addFields({
      name: "Realm",
      value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("realms")[data.realm]} ${data.realm}`,
    })
  if (data.season) {
    embed.addFields({ name: "Season", value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("seasons")[data.season]} Season of ${data.season}` });
  }
  if (data.ts)
    embed.addFields({
      name: "TS Summary",
      value: !data.ts.eligible ?
       `<:purpleright:1207596527737118811> This spirit is not eligible to return as a TS yet, and will become eligible when the season after the ${int.client.emojisMap.get("seasons")[data.season]} **__Season of ${data.season}**__ ends!`
        : data.ts.returned
        ? '<:purpleright:1207596527737118811>' + data.ts.dates.map((date) => `\n- ${date}`).join("\n")
        : "<:purpleright:1207596527737118811> This spirit has not returned yet",
    });
  const row = new ActionRowBuilder();
  const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle("2");

  const emoteBtn = new ButtonBuilder().setCustomId("spirit_emote").setStyle("1").setLabel("Emote");

  const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle("1").setLabel("Friendship Tree");

  const cosmeticBtn = new ButtonBuilder().setCustomId("spirit_cosmetic").setStyle("1").setLabel("Cosmetics");

  const callBtn = new ButtonBuilder().setCustomId("spirit_call").setLabel("Call").setStyle("1");

  const stanceBtn = new ButtonBuilder().setCustomId("spirit_stance").setLabel("Stance").setStyle("1");

  if (data.main) {
    embed.addFields({ name: `Infographics by Ed.7`, value: data.main.total });
    embed.setImage(data.main.image);
  } else {
    embed.addFields({ name: `Friendship Tree ${data.tree.credit}`, value: data.tree.total });
    row.addComponents(lctnBtn);
  }

  if (data.cosmetics) row.addComponents(cosmeticBtn);
  if (data.emote) row.addComponents(emoteBtn);
  if (data.stance) row.addComponents(stanceBtn.setEmoji(data.stance?.icon));
  if (data.call) row.addComponents(callBtn.setEmoji(data.call?.icon));

  const msg = await int.reply({ embeds: [embed], components: [row], ephemeral: ephemeral, fetchReply: true });
  const filter = int.client.getFilter(int);
  const collector = msg.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000,
  });

  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const customID = inter.customId;
    const newEmbed = EmbedBuilder.from(embed);
    const lastField = newEmbed.data.fields[newEmbed.data.fields.length - 1]; 
   const backBtn = new ButtonBuilder()
       .setCustomId("spirit_home")
       .setEmoji(data.emote?.icon || data.stance?.icon || data.call?.icon)
       .setStyle("3");
    switch (customID) {
      case "spirit_location": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = treeBtn;
        lastField.name = `Location by ${data.location.credit}`;
        lastField.value = " ";
       // newEmbed.setImage(data.location.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit_emote": {
        await handleEmote(inter, data, collector, backBtn);
        break;
      }
      case "spirit_stance": {
        const stanceEmbed = new EmbedBuilder()
        .setDescription(`### ${data.stance.icon} [${data.stance.title}](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance)\n${data.name} stance preview (Standing, sitting, kneeling and laying).`)
        .setImage(data.stance.image);
        await inter.editReply({
          embeds: [stanceEmbed],
          components: [new ActionRowBuilder().addComponents(backBtn)]
        })
      }
      case "spirit_call": {
        await inter.editReply({
          content: `### ${data.call.icon} [${data.call.title}](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${data.name} call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
          embeds: [],
          files: [data.call.image],
          components: [new ActionRowBuilder().addComponents(backBtn)],
        })
      }
      case "spirit_cosmetic": {
        await handleCosmetic(inter, data, collector);
        break;
      }
      case "spirit_tree": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = lctnBtn;
        lastField.name = `Friendship Tree ${data.tree.credit}`;
        lastField.value = " ";
       // newEmbed.setImage(data.tree.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit_home": {
        await inter.editReply({content: '', embeds: [embed], components: [row], files: [] });
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

async function handleEmote(int, data, collector, backBtn) {
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
      backBtn,
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
