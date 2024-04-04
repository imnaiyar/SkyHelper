import spiritsData from './spiritsData';

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  time,
  AttachmentBuilder,
} from 'discord.js';

import moment from 'moment-timezone';
import path from 'path';
import { CDN_URL } from '@root/config.js';
const startBtn = new ButtonBuilder()
  .setCustomId("spirit-back-start")
  .setEmoji("<:purpleUp:1207632852770881576>")
  .setLabel("Back")
  .setStyle(ButtonStyle.Danger);

/**
 * @param {import('discord.js').ChatInputCommandInteraction | import('discord.js').ButtonInteraction | import('discord.js').StringSelectMenuInteraction} int
 * @param {String} value The spirt's value
 * @param {Boolean} guides whether the function was called from a guides command (for including back button)
 * @param {import('discord.js').EmbedBuilder} embs the initial emb to display if provided (mostly for traveling spirit command)
 */
export default async (int, value, guides, embs) => {
  // Get the spirits data
  const data = spiritsData[value];
  const icon = data.emote?.icon || data.stance?.icon || data.call?.icon || data.action?.icon || "";
  const desc = `**Type:** ${data.type}${
    data.realm ? `\n**Realm:** ${int.client.emojisMap.get("realms")[data.realm]} ${data.realm}` : ""
  }${data.season ? `\n**Season:** ${int.client.emojisMap.get("seasons")[data.season]} Season of ${data.season}` : ""}`;
  // Build the initial embed
  const embed = new EmbedBuilder()
    .setTitle(`${icon} ${data.name}`)
    .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
    .setDescription(desc)
    .setAuthor({ name: "Spirit Summary" });

  // Add TS field if spirit data has ts property
  if (data.ts) {
    embed.addFields({
      name: "TS Summary",
      value: !data.ts.eligible
        ? `<:purpleright:1207596527737118811> This spirit is not eligible to return as a TS yet, and will become eligible when the season after the ${
            int.client.emojisMap.get("seasons")[data.season]
          } **__Season of ${data.season}__** ends!`
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
                const dateE = dateM.clone().add(3, "days").endOf("day");
                return `- ${time(dateM.toDate(), "D")} - ${time(dateE.toDate(), "D")} ${index}`;
              })
              .join("\n")}`
          : "<:purpleright:1207596527737118811> This spirit has not returned yet, when they do return, they'll offer the same items offered during the season but in a restructured friendship tree.",
    });
  }

  // Build different components
  const row = new ActionRowBuilder();

  // Define location button
  const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle("2");

  // Define Friendship Tree button
  const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle("2").setLabel("Friendship Tree");

  // Define cosmetic button
  // TODO: Don't forget this..
  // const cosmeticBtn = new ButtonBuilder().setCustomId("spirit_cosmetic").setStyle("1").setLabel("Cosmetics");
  const emb = embs ? embs : embed;
  // If spirit's data has 'main' property (Regular Spirits), no location or tree buttons here since the initial guide already contains tree and location
  if (data.main) {
    emb.addFields({ name: `Infographics by Ed.7`, value: " " });
    emb.setImage(`${CDN_URL}/${data.main.image}`);
  } else {
    // For seasonal spirits
    emb.addFields({
      name: `${data.ts?.returned ? "Friendship Tree (Last Visit)" : "Seasonal Price Chart"} by ${data.tree.by}`,
      value: data.tree.total
        .replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
        .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
        .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
    });
    emb.setImage(`${CDN_URL}/${data.tree.image}`);

    // Add location buttons to seasonal spirits embed
    if (data.location) row.addComponents(lctnBtn);
  }

  // If spirit's data has cosmetic property, add cosmetic button
  // TODO: Complete cosmetics you guy!
  // if (data.cosmetics) row.addComponents(cosmeticBtn);

  // add expression button if it has any expressions
  let backBtn = null;
  if (data.emote || data.stance || data.action || data.call) {
    backBtn = new ButtonBuilder().setCustomId("emote_home").setEmoji(icon).setStyle("3");
    const expressionBtn = new ButtonBuilder()
      .setCustomId(data.call ? "spirit_call" : data.stance ? "spirit_stance" : "spirit_expression")
      .setLabel(data.emote ? "Emote" : data.stance ? "Stance" : data.call ? "Call" : "Friend Action")
      .setEmoji(icon)
      .setStyle("1");
    row.addComponents(expressionBtn);
  }

  // if the this function was triggered by 'guides' command, add a back button to get back to select menu
  let originalMsg;
  if (guides) {
    originalMsg = {
      content: int.message?.content,
      components: int.message?.components,
      embeds: int.message?.embeds,
    };
    row.addComponents(startBtn);
  }

  // update the message with the results
  let msg;
  if (row.components.length) {
   msg = await int.editReply({ content: "", embeds: [emb], components: [row], fetchReply: true });
  } else {
  await int.editReply({ content: "", embeds: [emb] });  
  return;
  }

  // create a collector for the embed buttons
  const filter = int.client.getFilter(int);
  const collector = msg.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000,
  });

  collector.on("collect", async (inter) => {
    const customID = inter.customId;
    if (!customID.startsWith("spirit")) return;
    await inter.deferUpdate();
    const newEmbed = EmbedBuilder.from(emb);
    switch (customID) {
      case "spirit_location": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = treeBtn;
        newEmbed.spliceFields(-1, 1, {
          name: `Location by ${data.location.by}`,
          value: data.location?.description || " ",
        });
        newEmbed.setImage(`${CDN_URL}/${data.location.image}`);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit-back-start": {
        await inter.editReply(originalMsg);
        collector.stop("Back");
        break;
      }
      case "spirit_expression": {
        const msgContent = inter.message.content;
        const msgComponents = inter.message.components;
        const msgEmbeds = inter.message.embeds;
        const content = { content: msgContent, components: msgComponents, embeds: msgEmbeds };
        await handleExpression(inter, data, backBtn, content);
        break;
      }
      // TODO: Figure out a way to handle back btns for these two
      case "spirit_stance": {
        const stanceEmbed = new EmbedBuilder()
          .setTitle(`${data.stance.icon} ${data.stance.title}`)
          .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
          .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
          .setImage(`${CDN_URL}/${data.stance.image}`)
          .setAuthor({ name: `Stance - ${data.name}` });
        await inter.editReply({
          embeds: [stanceEmbed],
          components: [
            new ActionRowBuilder().addComponents(ButtonBuilder.from(backBtn).setCustomId("spirit-exp-back")),
          ],
        });
        break;
      }
      case "spirit_call": {
        await inter.editReply({
          content: `### ${data.call.icon} [${
            data.call.title
          }](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${
            data.name
          } call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
          embeds: [],
          files: [`${CDN_URL}/${data.call.image}`],
          components: [
            new ActionRowBuilder().addComponents(ButtonBuilder.from(backBtn).setCustomId("spirit-exp-back")),
          ],
        });
        break;
      }
      // case "spirit_cosmetic": {
      //   await handleCosmetic(inter, data, collector);
      //   break;
      // }
      case "spirit_tree": {
        const newRow = ActionRowBuilder.from(row);
        newRow.components[0] = lctnBtn;
        newEmbed.spliceFields(-1, 1, {
          name: `${data.ts?.returned ? "Friendship Tree" : "Seasonal Price Chart"} by ${data.tree.by}`,
          value: data.tree.total
            .replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
            .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
            .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
        });
        newEmbed.setImage(`${CDN_URL}/${data.tree.image}`);
        await inter.editReply({ embeds: [newEmbed], components: [newRow] });
        break;
      }
      case "spirit-exp-back": {
        await inter.editReply({ embeds: [embed], components: [row], content: "", files: [] });
      }
    }
  });

  collector.on("end", async (collected, reason) => {
    if (reason === "Back") return;
    const msg2 = await int.fetchReply().catch(() => {});

    const components = ActionRowBuilder.from(msg2.components[0]);
    components?.components?.forEach((component) => component.setDisabled(true));
    int.editReply({ components: [components] }).catch((err) => {});
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
        `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
          data.emote ? "Expression" : "Friend_Action"
        }`,
      )
      .setImage(`${CDN_URL}/${emote.image}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("emote_prev")
        .setLabel(`⬅️ ${exprsn.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`)
        .setStyle("1")
        .setDisabled(page === 1),
      backBtn,
      new ButtonBuilder()
        .setCustomId("emote_next")
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
    if (!customID.startsWith("emote")) return;
    await inter.deferUpdate();
    switch (customID) {
      case "emote_prev": {
        page--;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
      case "emote_next": {
        page++;
        const respn = getEmote();
        await inter.editReply(respn);
        break;
      }
      case "emote_home": {
        await inter.editReply(content);
        collector.stop("Back");
      }
    }
  });
}
// TODO
// async function handleCosmetic(int, data, collector) {}
