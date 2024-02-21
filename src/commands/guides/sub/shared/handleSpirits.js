const spiritsData = require("./spiritsData");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");
const moment = require("moment-timezone");
const startBtn = new ButtonBuilder()
  .setCustomId("back-start")
  .setEmoji("<:purpleUp:1207632852770881576>")
  .setLabel("Back")
  .setStyle(ButtonStyle.Danger);
module.exports = async (int, value, guides) => {
  // Get the spirits data
  const data = spiritsData[value];
  const icon = data.emote?.icon || data.stance?.icon || data.call?.icon || data.action?.icon;

  // Build the initial embed
  const embed = new EmbedBuilder()
    .setTitle(`${icon} ${data.name}`)
    .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
    .addFields({
      name: "Type",
      value: `<:purpleright:1207596527737118811> ${data.type}`,
    })
    .setAuthor({ name: "Spirit Summary" });

  // Add realm fields if spirits data has realm property
  if (data.realm) {
    embed.addFields({
      name: "Realm",
      value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("realms")[data.realm]} ${data.realm}`,
    });
  }

  // Add season field if spirit data has season property
  if (data.season) {
    embed.addFields({
      name: "Season",
      value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("seasons")[data.season]} Season of ${data.season}`,
    });
  }

  // Add TS field if spirit data has ts property
  if (data.ts) {
    embed.addFields({
      name: "TS Summary",
      value: !data.ts.eligible
        ? `<:purpleright:1207596527737118811> This spirit is not eligible to return as a TS yet, and will become eligible when the season after the ${int.client.emojisMap.get("seasons")[data.season]} **__Season of ${data.season}**__ ends!`
        : data.ts.returned
          ? `Total Visits: ${data.ts.dates.length}\n__Returned Dates__\n${data.ts.dates
              .map((date) => {
                let index;
                const formatDate = date
                  .replace(/\([^)]+\)/g, (match) => {
                    index = match.trim();
                    return "";
                  })
                  .trim();
                const dateM = moment.tz(formatDate, "MMMM DD, YYYY", "America/Los_Angeles").startOf("day");
                const dateE = dateM.clone().add(3, "days");
                return `- ${time(dateM.toDate(), "D")} - ${time(dateE.toDate(), "D")} ${index}`;
              })
              .join("\n")}`
          : "<:purpleright:1207596527737118811> This spirit has not returned yet, when they do return, they'll offer the same items during the season but in a restructured friendship tree.",
    });
  }

  // Build different components
  const row = new ActionRowBuilder();

  // Define location button
  const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle("2");

  // Define Expression (Emote/Friend Action) button
  const expressionBtn = new ButtonBuilder()
    .setCustomId(data.call ? "spirit_call" : data.stance ? "spirit_stance" : "spirit_expression")
    .setLabel(data.emote ? "Emote" : data.stance ? "Stance" : data.call ? "Call" : "Friend Action")
    .setEmoji(icon)
    .setStyle("1");

  // Define Friendship Tree button
  const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle("2").setLabel("Friendship Tree");

  // Define cosmetic button
  // TODO: Don't forget this..
  // const cosmeticBtn = new ButtonBuilder().setCustomId("spirit_cosmetic").setStyle("1").setLabel("Cosmetics");

  // If spirit's data has 'main' property (Regular Spirits), no location or tree buttons here since the initial guide already contains tree and location
  if (data.main) {
    embed.addFields({ name: `Infographics by Ed.7`, value: " " });
    embed.setImage(data.main.image);
  } else {
    // For seasonal spirits
    embed.addFields({ name: `Friendship Tree ${data.tree.by}`, value: data.tree.total });

    // Add location buttons to seasonal spirits embed
    row.addComponents(lctnBtn);
  }

  // If spirit's data has cosmetic property, add cosmetic button
  // TODO: Complete cosmetics you guy!
  // if (data.cosmetics) row.addComponents(cosmeticBtn);
  // add expression button
  row.addComponents(expressionBtn);

  // if the this function was triggered by 'guides' command, add a back button to get back to select menu
  let originalEmb;
  let originalCnt;
  let originalBtns;
  if (guides) {
    originalCnt = int.message?.content;
    originalBtns = int.message?.components;
    originalEmb = int.message.embeds;
    row.addComponents(startBtn);
  }

  // update the message with the results
  await int.editReply({ content: "", embeds: [embed], components: [row] });

  // create a collector for the embed buttons
  const filter = int.client.getFilter(int);
  const collector = int.message.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000,
  });

  collector.on("collect", async (inter) => {
    const customID = inter.customId;
    if (
      ![
        "spirit_home",
        "spirit_location",
        "select_back",
        "spirit_expression",
        "spirit_stance",
        "spirit_call",
        "spirit_home",
        "spirit_tree",
        "spirit_cosmetic",
        "spirit_emote_next",
        "spirit_emote_prev",
      ].includes(customID)
    ) {
      collector.stop();
    }
    const newEmbed = EmbedBuilder.from(embed);
    const lastField = newEmbed.data.fields[newEmbed.data.fields.length - 1];
    const backBtn = new ButtonBuilder().setCustomId("spirit_home").setEmoji(icon).setStyle("3");
    switch (customID) {
      case "spirit_location": {
        await inter.deferUpdate();
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = treeBtn;
        lastField.name = `Location by ${data.location.by}`;
        lastField.value = " ";
         newEmbed.setImage(data.location.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "back-start": {
        await inter.deferUpdate();
        await inter.editReply({ content: originalCnt, components: originalBtns, embeds: originalEmb });
        collector.stop();
        break;
      }
      case "spirit_expression": {
        await inter.deferUpdate();
        const msgContent = inter.message.content;
        const msgComponents = inter.message.components;
        const msgEmbeds = inter.message.embeds;
        const content = { content: msgContent, components: msgComponents, embeds: msgEmbeds };
        await handleExpression(inter, data, backBtn, content);
        break;
      }
      case "spirit_stance": {
        await inter.deferUpdate();
        const stanceEmbed = new EmbedBuilder()
          .setTitle(`${data.stance.icon} ${data.stance.title}`)
          .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
          .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
          .setImage(data.stance.image)
          .setAuthor({ name: `Stance - ${data.name}` });
        await inter.editReply({
          embeds: [stanceEmbed],
          components: [new ActionRowBuilder().addComponents(backBtn)],
        });
        break;
      }
      case "spirit_call": {
        await inter.deferUpdate();
        await inter.editReply({
          content: `### ${data.call.icon} [${data.call.title}](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${data.name} call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
          embeds: [],
          files: [data.call.image],
          components: [new ActionRowBuilder().addComponents(backBtn)],
        });
        break;
      }
      case "spirit_cosmetic": {
        await inter.deferUpdate();
        await handleCosmetic(inter, data, collector);
        break;
      }
      case "spirit_tree": {
        await inter.deferUpdate();
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = lctnBtn;
        lastField.name = `Friendship Tree ${data.tree.by}`;
        lastField.value = data.tree.total;
         newEmbed.setImage(data.tree.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
    }
  });

  collector.on("end", async () => {
    // const components = ActionRowBuilder.from(msg.components[0]);
    // components?.components?.forEach((component) => component.setStyle(ButtonStyle.Danger).setDisabled(true));
    // int.editReply({ components: [components] }).catch((err) => {});
  });
};

async function handleExpression(int, data, backBtn, content) {
  let page = 1;
  const exprsn = data.emote ? data.emote : data.action;
  const total = exprsn.level.length - 1;
  const getEmote = () => {
    const emote = exprsn.level[page - 1];

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${data.emote ? "Emote" : "Friend Action"} - ${data.name}` })
      .setTitle(`${exprsn.icon} ${emote.title}`)
      .setURL(
        `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${data.emote ? "Expression" : "Friend_Action"}`,
      )
      .setImage(emote.image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("spirit_emote_prev")
        .setLabel(`⬅️ ${exprsn.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`)
        .setStyle("1")
        .setDisabled(page === 1),
      backBtn,
      new ButtonBuilder()
        .setCustomId("spirit_emote_next")
        .setLabel(`${exprsn.level[page]?.title.slice(-7) || emote.title.slice(-7)} ➡️`)
        .setStyle("1")
        .setDisabled(page === total + 1),
    );

    return {
      embeds: [embed],
      components: [row],
    };
  };
  const response = getEmote();
  await int.editReply(response);
  const filter = int.client.getFilter(int);
  const collector = int.message.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000,
  });
  collector.on("collect", async (inter) => {
    const customID = inter.customId;
    switch (customID) {
      case "spirit_emote_prev": {
        await inter.deferUpdate();
        page--;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
      case "spirit_emote_next": {
        await inter.deferUpdate();
        page++;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
      case "spirit_home": {
        await inter.deferUpdate();

        await inter.editReply(content);
        collector.stop();
      }
    }
  });
}

async function handleCosmetic(int, data, collector) {}
