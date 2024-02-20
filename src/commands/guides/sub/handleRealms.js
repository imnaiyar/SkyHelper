const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const summary = require("./extends/realms/summaries.js");
const maps = require("./extends/realms/maps.js");
const respondSpirits = require("./shared/handleSpirits.js");
class HandleRealms {
  constructor(interaction, realm, value, msg) {
    this.interaction = interaction;
    this.realm = realm;
    this.value = value;
    this.msg = msg;
    this.client = interaction.client;
    this.filter = this.client.getFilter(this.interaction);
  }
  async respond() {
    const value = this.value;
    if (value.startsWith("summary")) {
      await this.handleSummary();
    } else if (value.startsWith("maps")) {
      await this.handleMaps();
    } else if (value.startsWith("spirits")) {
      await this.handleSpirits();
    }
  }

  async handleSummary() {
    const data = summary.getSummary(this.value);
    const { client } = this.interaction;
    let page = 1;
    const total = data.areas.length - 1;
    const author = `Summary of ${this.realm}`;
    const emoji = client.emojisMap.get("realms")[this.realm];
    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${data.main.title}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.main.title.split(" ").join("_")}`)
      .setDescription(data.main.description)
      .setAuthor({ name: author })
      .setImage(data.main?.image);

    const rowFirst = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Different Areas").setCustomId("areas").setStyle("1"),
    );
    await this.interaction.followUp({
      embeds: [embed],
      components: [rowFirst],
    });

    const filter = client.getFilter(this.interaction);
    const collector = this.msg.createMessageComponentCollector({
      filter,
      idle: 2 * 60 * 1000,
    });

    collector.on("collect", async (inter) => {
      await inter.deferUpdate();
      const componentID = inter.customId;
      switch (componentID) {
        case "areas": {
          const datas = this.getRealmsRow(data.areas, page, total, author, emoji);
          await inter.editReply(datas);
          break;
        }
        case "back": {
          page--;
          const datas = this.getRealmsRow(data.areas, page, total, author, emoji);
          await inter.editReply(datas);
          break;
        }
        case "forward": {
          page++;
          const datas = this.getRealmsRow(data.areas, page, total, author, emoji);
          await inter.editReply(datas);
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
          const datas = this.getRealmsRow(data.areas, page, total, author, emoji);
          await inter.editReply(datas);
          break;
        }
        default:
          inter.editReply({ content: "Invalid choice or Guide yet to be updated", ephemeral: true });
      }
    });

    collector.on("end", async () => {
      this.msg
        .fetch()
        .then((m) => {
          m.edit({
            components: [],
          });
        })
        .catch((err) => {});
    });
  }
  async handleMaps() {
    const data = maps.getMaps(this.value);

    let page = 1;
    const total = data.maps.length - 1;
    const author = `Maps of ${this.realm}`;
    const row = this.getRealmsRow(data.maps, page, total, author, true);
    await this.interaction.followUp({
      content: data?.content,
      ...row,
    });
    const filter = this.client.getFilter(this.interaction);
    const collector = this.msg.createMessageComponentCollector({
      filter,
      idle: 2 * 60 * 1000,
    });

    collector.on("collect", async (inter) => {
      await inter.deferUpdate();
      const componentID = inter.customId;
      switch (componentID) {
        case "back": {
          page--;
          const datas = this.getRealmsRow(data.maps, page, total, author, true);
          await inter.editReply(datas);
          break;
        }
        case "forward": {
          page++;
          const datas = this.getRealmsRow(data.maps, page, total, author, true);
          await inter.editReply(datas);
          break;
        }
        case "area-menu": {
          page = parseInt(inter.values[0].split("_")[1]) + 1;
          const datas = this.getRealmsRow(data.maps, page, total, author, true);
          await inter.editReply(datas);
          break;
        }
      }
    });
  }

  async handleSpirits() {
    const spiritsData = Object.entries(this.client.spiritsData);
    const getSpiritsObj = (type) => {
      return spiritsData
        .filter(([k, v]) => v.realm === this.realm && v.type === type)
        .map(([k, v]) => ({
          label: v.name,
          value: k,
          emoji: v?.emote?.icon || v?.stance?.icon || v?.call?.icon || v.action?.icon,
        }));
    };

    const regularRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`regular_${this.value}`)
        .setPlaceholder("Regular Spirits")
        .addOptions(getSpiritsObj("Regular Spirit")),
    );
    const seasonalRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`seasonal_${this.value}`)
        .setPlaceholder("Seasonal Spirits")
        .addOptions(getSpiritsObj("Seasonal Spirit")),
    );

    await this.interaction.followUp({
      content: `Spirits of __${this.realm}__`,
      components: [regularRow, seasonalRow],
    });

    const filter = this.filter;
    const collector = this.msg.createMessageComponentCollector({
      filter,
      idle: 2 * 60 * 1000,
    });
    collector.on("collect", async (inter) => {
      if (!inter.isStringSelectMenu()) return;
      await inter.deferUpdate();
      const value = inter.values[0];
      await respondSpirits(inter, value, true);
    });
  }
  getRealmsRow(data, page, total, author, emoji, maps) {
    const embed = data[page - 1];
    const emb = new EmbedBuilder()
      .setTitle(embed.title)
      .setImage(embed?.image)
      .setAuthor({ name: author })
      .setFooter({ text: `Page ${page}/${total + 1}` });
    if (embed.description) emb.setDescription(embed.description);

    if (maps) {
      emb.setURL(`https://sky-children-of-the-light.fandom.com/wiki/${this.realm.split(" ").join("_")}#Maps`);
    } else {
      emb.setURL(
        `https://sky-children-of-the-light.fandom.com/wiki/${this.realm.split(" ").join("_")}#${embed.title.split(" ").join("_")}`,
      );
    }
    const row = [];
    const btns = new ActionRowBuilder();

    btns.addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel(`⬅️ ${data[page - 2]?.title || data[page - 1].title}`)
        .setDisabled(page - 1 === 0)
        .setStyle("2"),
    );

    if (emoji) {
      btns.addComponents(new ButtonBuilder().setCustomId("realm").setEmoji(emoji).setStyle("3"));
    }

    btns.addComponents(
      new ButtonBuilder()
        .setCustomId("forward")
        .setLabel(`${data[page]?.title || data[page - 1].title} ➡️`)
        .setDisabled(page - 1 === total)
        .setStyle("2"),
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
          })),
        ),
    );
    row.push(menu, btns);
    return { embeds: [emb], components: row };
  }
}

module.exports = { HandleRealms };
