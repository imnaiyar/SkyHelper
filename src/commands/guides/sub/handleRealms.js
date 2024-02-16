const { firstChoices, spiritChoices } = require("./extends/realms/choices");
const { rowBuilder, getRealmsRow } = require("./shared/helpers");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const summary = require("./extends/realms/summaries");
const maps = require("./extends/realms/maps");
const handleSpirits = require("./shared/handleSpirits");
const CUSTOM_ID = {
  FIRST_CHOICE: "firstChoice",
  SECOND_CHOICE: "secondChoice",
  THIRD_CHOICE: "thirdChoice",
  FOURTH_CHOICE: "fourthChoice",
};
const startBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('back-start').setLabel('Start').setEmoji('<:purpleUp:1207632852770881576>').setStyle(ButtonStyle.Danger))
const userChoices = new Map();
module.exports = async (interaction, ephemeral) => {
  const row = rowBuilder(CUSTOM_ID.FIRST_CHOICE, firstChoices, "Choose a Realm", false);
  const reply = await interaction.reply({
    content: "Please Select a Realm",
    components: [row],
    fetchReply: true,
  });
  const collector = createCollector(reply, interaction);

  collector.on("collect", async (int) => {
    const value = int.values ? int.values[0] : null
    const id = int.customId;
    switch (id) {
      case CUSTOM_ID.FIRST_CHOICE:
        await handleFirst(int, value);
        break;
      case CUSTOM_ID.SECOND_CHOICE:
        await handleSecond(int, value, ephemeral);
        break;
      case 'back-start':
        await int.update({content: 'Please Select a Realm', components: [row], embeds: [], files: []})
        break;
      case CUSTOM_ID.THIRD_CHOICE:
        await handleThird(int, value, ephemeral);
        break;
      case CUSTOM_ID.FOURTH_CHOICE:
        await handleFourth(int, value, ephemeral, collector);
        break;
    }
  });

  collector.on("end", async () => {
    row.components.forEach((component) => component.setDisabled(true).setPlaceholder("Menu Expired"));
    await reply.edit({
      components: [row],
    }).catch(err => {});
  });
};

async function handleFirst(interaction, value) {
  userChoices.set(interaction.message.id, {
    firstChoice: {
      label: firstChoices.find((choice) => choice.value === value).label,
      value: value,
      emoji: firstChoices.find((choice) => choice.value === value).emoji,
    },
  });
  const row = buildSecondRow(value, interaction);
  await interaction.update({
    content: `Guides for __${userChoices.get(interaction.message.id).firstChoice.label}__`,
    components: [row, startBtn],
  });
}

async function handleSecond(interaction, value, ephemeral) {
  if (value === "back") {
    const row = rowBuilder(CUSTOM_ID.FIRST_CHOICE, firstChoices, "Choose a Realm", false);
    await interaction.update({
      content: "Please Select a Realm",
      components: [row],
    });
  } else if (value.startsWith("summary_")) {
    await respondSummary(interaction, value, ephemeral);
  } else if (value.startsWith("spirits_")) {
    const realmValue = value.split("_")[1];
    const row = buildSpiritsRow(realmValue);
    await interaction.update({
      content: `Spirits of __${userChoices.get(interaction.message.id).firstChoice.label}__`,
      components: [row, startBtn],
    });
  } else if (value.startsWith("maps_")) {
    await respondMaps(interaction, value, ephemeral);
  }
}

async function handleThird(interaction, value, ephemeral) {
  const choices = userChoices.get(interaction.message.id).firstChoice;
  if (value === "back") {
    const row = buildSecondRow(choices.value, interaction);

    await interaction.update({
      content: `Guides for __${choices.label}__`,
      components: [row, startBtn],
    });
    return;
  }

  try {
    const options = spiritChoices[value];
    if (!options) {
      return await interaction.reply({
        content: "Guide is yet to be updated. Coming Soon! Thank you for your patience.",
        ephemeral: true,
      });
    }
    const type = { regular: "Regular", seasonal: "Seasonal" }[value.split("_")[1]];
    const placeholder = `${type} Spirits - ${choices.label}`;
    const row = rowBuilder(CUSTOM_ID.FOURTH_CHOICE, options, placeholder, true);

    await interaction.update({
      content: `${type} Spirits of __${choices.label}__`,
      components: [row, startBtn],
    });
  } catch (err) {
    interaction.client.logger.error("Third Choice Error [Realm Guide]", err);
  }
}

async function handleFourth(interaction, value, ephemeral, collector) {
  const choices = userChoices.get(interaction.message.id).firstChoice;
  if (value === "back") {
    const row = buildSpiritsRow(choices.value);
    return await interaction.update({
      content: `Spirits of __${choices.label}__`,
      components: [row, startBtn],
    });
  }

  await handleSpirits(interaction, value, ephemeral, collector);
}

async function respondSummary(int, value, ephemeral) {
  const data = summary.getSummary(value);
  let page = 1;
  const total = data.areas.length - 1;

  const embed = new EmbedBuilder()
    .setTitle(data.main.title)
    .setDescription(data.main.description)
    .setAuthor({ name: `Summary of ${data.main.title}` })
    .setImage(data.main?.image);

  const rowFirst = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Different Areas").setCustomId("areas").setStyle("1")
  );
  const reply = await int.reply({
    content: `*This is only a short summary, please follow the sourced link for detailed informations.*`,
    embeds: [embed],
    components: [rowFirst],
    ephemeral: ephemeral,
    fetchReply: true,
  });

  const collector = createCollector(reply, int);

  const author = `Summary of ${userChoices.get(int.message.id).firstChoice.label}`;
  const emoji = userChoices.get(int.message.id).firstChoice.emoji;
  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const componentID = inter.customId;
    switch (componentID) {
      case "areas": {
        const datas = getRealmsRow(data.areas, page, total, author, emoji);
        await updateEmbed(inter, datas);
        break;
      }
      case "back": {
        page--;
        const datas = getRealmsRow(data.areas, page, total, author, emoji);
        await updateEmbed(inter, datas);
        break;
      }
      case "forward": {
        page++;
        const datas = getRealmsRow(data.areas, page, total, author, emoji);
        await updateEmbed(inter, datas);
        break;
      }
      case "realm": {
        page = 1;
        await inter.editReply({
          embeds: [embed],
          components: [rowFirst],
        });
        break;
      }
      case "area-menu": {
        page = parseInt(inter.values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(data.areas, page, total, author, emoji);
        await updateEmbed(inter, datas);
        break;
      }
      default:
        inter.reply({ content: "Invalid choice or Guide yet to be updated", ephemeral: true });
    }
  });

  collector.on("end", async () => {
    reply
      .fetch()
      .then((m) => {
        m.edit({
          components: [],
        });
      })
      .catch((err) => {});
  });
}

async function respondMaps(int, value, ephemeral) {
  const data = maps.getMaps(value);
  let page = 1;
  let total = data.maps.length - 1;
  const author = `Maps of ${userChoices.get(int.message.id).firstChoice.label}`;
  const row = getRealmsRow(data.maps, page, total, author);
  const reply = await int.reply({
    content: data?.content,
    ...row,
    ephemeral: ephemeral,
    fetchReply: true,
  });

  const collector = createCollector(reply, int);

  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const componentID = inter.customId;
    switch (componentID) {
      case "back": {
        page--;
        const datas = getRealmsRow(data.maps, page, total, author);
        await updateEmbed(inter, datas);
        break;
      }
      case "forward": {
        page++;
        const datas = getRealmsRow(data.maps, page, total, author);
        await updateEmbed(inter, datas);
        break;
      }
      case "area-menu": {
        page = parseInt(inter.values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(data.maps, page, total, author);
        await updateEmbed(inter, datas);
        break;
      }
    }
  });
}

async function updateEmbed(inter, data) {
  await inter.editReply(data).catch((err) => inter.client.logger.error("Error while Fetching Realm Guides:", err));
}

function createCollector(reply, interaction) {
  const filter = (i) => {
    if (i.user.id !== interaction.user.id) {
      i.reply({
        content: `You can't use the menu generated by others. Run the command </guides realms:139030832> if you wish to use it.`,
        ephemeral: true,
      });
      return false;
    }
    return true;
  };
  return reply.createMessageComponentCollector({
    filter,
    idle: 2 * 60 * 1000,
  });
}

function buildSecondRow(value, interaction) {
  const options = [
    {
      label: "Realm Summary",
      value: "summary_" + value,
      emoji: "<:realms:1206132657851736094>",
    },
    {
      label: "Maps",
      value: "maps_" + value,
      emoji: "<:map_shrine:1205944136826617856>",
    },
  ];

  if (value !== "eden")
    options.push({
      label: "Spirits",
      value: "spirits_" + value,
      emoji: "<:spiritIcon:1206501060303130664>",
    });
  const map = userChoices.get(interaction.message.id);
  const placeholder = map.firstChoice.label;
  return rowBuilder(CUSTOM_ID.SECOND_CHOICE, options, placeholder, true);
}
function buildSpiritsRow(value) {
  const options = [
    {
      label: "Regular Spirits",
      value: value + "_regular",
    },
    {
      label: "Seasonal Spirits",
      value: value + "_seasonal",
    },
  ];
  return rowBuilder(CUSTOM_ID.THIRD_CHOICE, options, "Choose a Spirit Type", true);
}
