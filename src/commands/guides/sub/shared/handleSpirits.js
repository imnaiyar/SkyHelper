const spiritsData = require("./spiritsData");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");
const moment = require('moment-timezone')
const startBtn = new ButtonBuilder().setCustomId('back-start').setLabel('Start').setEmoji('<:purpleUp:1207632852770881576>').setStyle(ButtonStyle.Danger)
module.exports = async (int, value, ephemeral) => {
  const data = spiritsData[value];
  const messageContent = int.message?.content
  const messageComponents = int.message?.components
  const icon = data.emote?.icon || data.stance?.icon || data.call?.icon || data.action?.icon;
  const embed = new EmbedBuilder()
    .setTitle(
      `${icon } ${
        data.name}`
    )
    .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
    .addFields({
        name: "Type",
        value: `<:purpleright:1207596527737118811> ${data.type}`,
      })
    .setAuthor({ name: "Spirit Summary" });
    if (data.realm) embed.addFields({
      name: "Realm",
      value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("realms")[data.realm]} ${data.realm}`,
    });
  if (data.season) {
    embed.addFields({ name: "Season", value: `<:purpleright:1207596527737118811> ${int.client.emojisMap.get("seasons")[data.season]} Season of ${data.season}` });
  }
  if (data.ts)
    embed.addFields({
      name: "TS Summary",
      value: !data.ts.eligible ?
       `<:purpleright:1207596527737118811> This spirit is not eligible to return as a TS yet, and will become eligible when the season after the ${int.client.emojisMap.get("seasons")[data.season]} **__Season of ${data.season}**__ ends!`
        : data.ts.returned
        ? `Total Visits: ${data.ts.dates.length}\n__Returned Dates__\n${data.ts.dates.map((date) => {
          let index;
          let formatDate = date.replace(/\([^)]+\)/g, (match) => {
            index = match.trim()
            return ''
          }).trim()
          const dateM = moment.tz(formatDate, 'MMMM DD, YYYY', 'America/Los_Angeles').startOf('day')
          const dateE = dateM.clone().add(3, 'days')
          return `- ${time(dateM.toDate(), 'D')} - ${time(dateE.toDate(), 'D')} ${index}`
        }).join("\n")}`
        : "<:purpleright:1207596527737118811> This spirit has not returned yet",
    });
  const row = new ActionRowBuilder();
  const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle("2");

  const expressionBtn = new ButtonBuilder().setCustomId(data.call ? 'spirit_call' : data.stance ? 'spirit_stance' : 'spirit_expression')
  .setLabel(data.emote ? 'Emote' : data.stance ? 'Stance' : data.call ? 'Call' : 'Friend Action')
  .setEmoji(icon )
  .setStyle("1");

  const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle("2").setLabel("Friendship Tree");

  const cosmeticBtn = new ButtonBuilder().setCustomId("spirit_cosmetic").setStyle("1").setLabel("Cosmetics");
  const selectBackBtn = new ButtonBuilder().setCustomId("select_back").setStyle(ButtonStyle.Danger).setLabel("Back");

  if (data.main) {
    embed.addFields({ name: `Infographics by Ed.7`, value: ' ' });
    embed.setImage(data.main.image);
  } else {
    embed.addFields({ name: `Friendship Tree ${data.tree.credit}`, value: ' ' });
    row.addComponents(lctnBtn);
  }

  if (data.cosmetics) row.addComponents(cosmeticBtn);
  row.addComponents(expressionBtn, selectBackBtn, startBtn);

   await int.update({ content: '', embeds: [embed], components: [row]});
  const filter = int.client.getFilter(int)
  const collector = int.message.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000
  })
  collector.on("collect", async (inter) => {
    const customID = inter.customId;
    if (!["spirit_home", "spirit_location", "select_back", "spirit_expression", "spirit_stance", "spirit_call", "spirit_home", "spirit_tree", "spirit_cosmetic", "spirit_emote_next", "spirit_emote_prev"].includes(customID)) collector.stop()
    const newEmbed = EmbedBuilder.from(embed);
    const lastField = newEmbed.data.fields[newEmbed.data.fields.length - 1]; 
   const backBtn = new ButtonBuilder()
       .setCustomId("spirit_home")
       .setEmoji(icon )
       .setStyle("3");
    switch (customID) {
      case "spirit_location": {
        await inter.deferUpdate();
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = treeBtn;
        lastField.name = `Location by ${data.location.credit}`;
        lastField.value = " ";
       // newEmbed.setImage(data.location.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "select_back": {
        await inter.deferUpdate();
        await inter.editReply({ content: messageContent, components: messageComponents, embeds: [] });
        collector.stop()
        break;
      }
      case "spirit_expression": {
        await inter.deferUpdate();
        await handleExpression(inter, data, collector, backBtn);
        break;
      }
      case "spirit_stance": {
        await inter.deferUpdate();
        const stanceEmbed = new EmbedBuilder()
        .setTitle(`${data.stance.icon} ${data.stance.title}`)
        .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
        .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
        .setImage(data.stance.image)
        .setAuthor({ name: `Stance - ${data.name}`});
        await inter.editReply({
          embeds: [stanceEmbed],
          components: [new ActionRowBuilder().addComponents(backBtn, startBtn)]
        });
        break;
      }
      case "spirit_call": {
        await inter.deferUpdate();
        await inter.editReply({
          content: `### ${data.call.icon} [${data.call.title}](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${data.name} call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
          embeds: [],
          files: [data.call.image],
          components: [new ActionRowBuilder().addComponents(backBtn, startBtn)],
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
        lastField.name = `Friendship Tree ${data.tree.credit}`;
        lastField.value = " ";
       // newEmbed.setImage(data.tree.image);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit_home": {
        await inter.deferUpdate();
        await inter.editReply({content: '', embeds: [embed], components: [row], files: [] });
        break;
      }
    }
  });

  collector.on("end", async () => {
    //const components = ActionRowBuilder.from(msg.components[0]);
    //components?.components?.forEach((component) => component.setStyle(ButtonStyle.Danger).setDisabled(true));
    //int.editReply({ components: [components] }).catch((err) => {});
  });
};

async function handleExpression(int, data, collector, backBtn, content) {
  let page = 1;
  const exprsn = data.emote ? data.emote :  data.action;
  const total = exprsn.level.length - 1;
  const getEmote = () => {
    const emote = exprsn.level[page - 1];
    
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${data.emote ? 'Emote' : 'Friend Action'} - ${data.name}` })
      .setTitle(
        `${exprsn.icon} ${emote.title}`
      )
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${data.emote ? 'Expression' : 'Friend_Action'}`)
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
        startBtn
    );

    return {
      embeds: [embed],
      components: [row],
    };
  };
  const response = getEmote();
  await int.editReply(response);

  
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
    }
  });
}

async function handleCosmetic(int, data, collector) {}
