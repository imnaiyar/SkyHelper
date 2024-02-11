const { firstChoices } = require("./extends/realms/choices");
const { rowBuilder } = require("./shared/helpers");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const summary = require("./extends/realms/summaries");
const maps = require('./extends/realms/maps')
const CUSTOM_ID = {
  FIRST_CHOICE: "firstChoice",
  SECOND_CHOICE: "secondChoice",
  THIRD_CHOICE: "thirdChoice",
};

const userChoices = new Map();
module.exports = async (interaction, ephemeral) => {
  const row = rowBuilder(CUSTOM_ID.FIRST_CHOICE, firstChoices, "Choose a Realm", false);
  const reply = await interaction.reply({
    content: "Please Select a Realm",
    components: [row],
    fetchReply: true,
  });
  const collector = createCollector(reply , interaction)

  collector.on("collect", async (int) => {
    const value = int.values[0];
    const id = int.customId;
    switch (id) {
      case CUSTOM_ID.FIRST_CHOICE:
        await handleFirst(int, value);
        break;
      case CUSTOM_ID.SECOND_CHOICE:
        await handleSecond(int, value, ephemeral);
        break;
      default:
        int.reply("Invalid choice selected.");
    }
  });

  collector.on("end", async () => {
    row.components.forEach((component) => component.setDisabled(true).setPlaceholder("Menu Expired"));
    await reply.edit({
      components: [row],
    });
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
  const options = [
    {
      label: "Realm Summary",
      value: "summary_" + value,
      emoji: "<:realms:1206132657851736094>"
    },
    {
      label: "Maps",
      value: "maps_" + value,
      emoji: "<:map_shrine:1205944136826617856>"
    },
    {
      label: "Spirits",
      value: "spirits_" + value,
      emoji: "<:spiritTomb:1206132906527952906>"
    },
  ];
  const map = userChoices.get(interaction.message.id);
  const placeholder = map.firstChoice.label;
  const row = rowBuilder(CUSTOM_ID.SECOND_CHOICE, options, placeholder, true);
  await interaction.update({
    content: `Guides for __${placeholder}__`,
    components: [row],
  });
}

async function handleSecond(interaction, value, ephemeral) {
  if (value === "back") {
    const row = rowBuilder(CUSTOM_ID.FIRST_CHOICE, firstChoices, "Choose a Realm", false);
    await interaction.update({
      content: 'Please Select a Realm',
      components: [row]
    });
  } else if (value.startsWith("summary_")) {
    await respondSummary(interaction, value, ephemeral);
  } else if (value.startsWith("spirits_")) {
    await interaction.reply({
      content: "Coming Soon!",
      ephemeral: true
    })
    return
  } else if (value.startsWith("maps_")) {
    await respondMaps(interaction, value, ephemeral);
  }
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

  const collector = createCollector(reply, int)

  const author = `Summary of ${userChoices.get(int.message.id).firstChoice.label}`
  const emoji = userChoices.get(int.message.id).firstChoice.emoji
  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const componentID = inter.customId;
    switch (componentID) {
      case "areas":{
        const datas = getRow(data.areas, page, total, author, emoji)
        await updateEmbed(inter, datas);
        break;
        }
      case "back":{
        page--;
        const datas = getRow(data.areas, page, total, author, emoji)
        await updateEmbed(inter, datas);
        break;
        }
      case "forward":{
        page++;
        const datas = getRow(data.areas, page, total, author, emoji)
        await updateEmbed(inter, datas);
        break;
        }
      case "realm":{
        page = 1;
        await inter.editReply({
          embeds: [embed],
          components: [rowFirst],
        });
        break;
        }
      case "area-menu":{
        page = parseInt(inter.values[0].split("_")[1]) + 1;
        const datas = getRow(data.areas, page, total, author, emoji)
        await updateEmbed(inter, datas);
        break;
      }
      default:
        inter.reply({ content: "Invalid choice or Guide yet to be updated", ephemeral: true });
    }
  });

  collector.on("end", async() => {
     reply.fetch().then((m) => {
      m.edit({
       components: []
     })
    }).catch(err => {});  
  });
}


async function respondMaps(int, value, ephemeral) {
const data = maps.getMaps(value);
let page = 1;
let total = data.maps.length - 1; 
const author = `Maps of ${userChoices.get(int.message.id).firstChoice.label}`
const row = getRow(data.maps, page, total, author)
const reply = await int.reply({ 
  content: data?.content,
  ...row,
  ephemeral: ephemeral, 
  fetchReply: true });

  const collector = createCollector(reply, int)

  collector.on("collect", async (inter) => {
    await inter.deferUpdate();
    const componentID = inter.customId;
    switch (componentID) {
      case "back": {
        page--;
        const data = getRow(data.maps, page, total, author)
        await updateEmbed(inter);
        break;
      }
      case "forward": {
        page++;
        const data = getRow(data.maps, page, total, author)
        await updateEmbed(inter, data);
        break;
      }
      case "area-menu":
        {
        page = parseInt(inter.values[0].split("_")[1]) + 1;
        const data = getRow(data.maps, page, author)
        await updateEmbed(inter, data);
        break;
        }
    }
  })
}


async function updateEmbed(inter, data) {
   await inter
    .editReply(data)
    .catch((err) => inter.client.logger.error("Error while Fetching Realm Guides:", err));
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

  function getRow(data, page, total, author, emoji) {
      const embed = data[page - 1];
      const emb = new EmbedBuilder()
        .setTitle(embed.title)
        .setImage(embed?.image)
        .setAuthor({ name: author })
        .setFooter({ text: `Page ${page}/${total + 1}` });
        if (embed.description) emb.setDescription(embed.description);
      const row = [];
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("back")
          .setLabel(`⬅️ ${data[page - 2]?.title || data[page-1].title}`)
          .setDisabled(page - 1 === 0)
          .setStyle("2"),
        emoji ?
        new ButtonBuilder()
          .setCustomId("realm")
          .setEmoji(emoji)
          .setStyle("3") : null,
        new ButtonBuilder()
          .setCustomId("forward")
          .setLabel(`${data[page]?.title || data[page-1].title} ➡️`)
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