import {
  ActionRowBuilder,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  type InteractionUpdateOptions,
  StringSelectMenuBuilder,
  User,
  parseEmoji,
  time,
} from "discord.js";
import SeasonProgressCard from "#libs/classes/SeasonProgressCard";
import { SeasonPrices as prices, SeasonData as ssn } from "#libs/constants/seasonPrices";
import type { UserSpiritData } from "#schemas/seasonsData";
import moment from "moment-timezone";

interface UserSpiritProgress {
  title: string;
  icon?: string;
  items: string[];
}
export default class {
  public season: string = "Unknown";
  public seasonIcon: string = "";
  public totalCurrency: number = 0;
  public obtainableCurrency: number = 0;
  public requiredCurrency: number = 0;
  public remainingCandles: number = 0;
  public remainingDays: number = 0;
  public seasonEndsIn: number = 0;
  private progressLevel: number = 1;
  constructor(
    private author: GuildMember | User,
    private data: UserSpiritData,
    private dailies: boolean,
    private candles: number,
  ) {
    this.candles = candles;
    this.dailies = dailies;
    this.data = data;
    this.author = author;
  }

  /**
   * Syncs the data with the current season
   */
  public sync(): this {
    this.season = ssn.name;
    this.seasonIcon = ssn.icon;
    this.totalCurrency = Object.keys(prices)
      .map((k) => {
        const spirit = prices[k];
        return spirit.cosmetics.reduce((acc, value) => acc + value.price, 0);
      })
      .reduce((acc, num) => acc + num, 0);
    const candlesUsed = Object.keys(this.data.spirits)
      .map((k) => {
        const spirit = this.data.spirits[k];
        return spirit.cosmetics.filter((sp) => sp.acquired).reduce((acc, value) => acc + value.price, 0);
      })
      .reduce((acc, num) => acc + num, 0);
    this.requiredCurrency = this.totalCurrency - candlesUsed;
    this.requiredCurrency = this.requiredCurrency < 0 ? 0 : this.requiredCurrency;
    const divider = this.data.hasPass ? 6 : 5;
    this.remainingDays = (this.requiredCurrency - this.candles) / divider;
    const now = moment().tz("America/Los_Angeles");
    const seasonEnds = moment.tz(ssn.end, "DD-MM-YYYY", "America/Los_Angeles").endOf("day");
    this.seasonEndsIn = seasonEnds.diff(now, "days");
    this.obtainableCurrency = (this.data.hasPass ? 6 : 5 * ((this.dailies ? 0 : 1) + this.seasonEndsIn)) + this.candles;
    this.remainingCandles = this.obtainableCurrency - this.requiredCurrency;
    this.remainingCandles = this.remainingCandles < 0 ? 0 : this.remainingCandles;

    this.progressLevel = 100 - (this.requiredCurrency / this.totalCurrency) * 100;
    return this;
  }

  private getAcquiredItems() {
    const spirits = this.data.spirits;
    const SpiritsProgress: UserSpiritProgress[] = [];
    for (const spirit of Object.keys(spirits)) {
      const spiritData = spirits[spirit];
      SpiritsProgress.push({
        title: spirit,
        icon: spiritData.icon,
        items: spiritData.cosmetics.map((item) => item.icon + " " + (item.acquired ? item.item + " (✅)" : item.item + " (❌)")),
      });
    }
    return SpiritsProgress;
  }

  public async getContent(): Promise<InteractionUpdateOptions> {
    const { client } = this.author;
    const emoji = client.emojis.cache.get(parseEmoji(this.seasonIcon)?.id ?? "");
    const startDate = moment.tz(ssn.start, "DD-MM-YYYY", "America/Los_Angeles").startOf("day");
    const endDate = moment.tz(ssn.end, "DD-MM-YYYY", "America/Los_Angeles").endOf("day");
    const embeds = new EmbedBuilder()
      .setAuthor({
        name: `${this.season} Currency Calculator`,
        iconURL: emoji?.imageURL(),
      })
      .setDescription(
        `**Season Pass**: ${this.data.hasPass ? "True" : "False"}\n**Dailies**: ${this.dailies ? "Completed" : "Not Done"} \n**Currency Required:**${this.requiredCurrency.toFixed(0)} Candles\n**Obtainable Candles:** ${this.obtainableCurrency} Candles\n**Days to complete:**${Math.ceil(this.remainingDays)} Days ${this.remainingDays > this.seasonEndsIn ? "(Not Possible)" : ""} \n**Remaining candles at the end of the season:** ${this.remainingCandles.toFixed(0)} Candles`,
      )
      .setTitle(
        `${this.seasonIcon} ${this.season} (${time(startDate.unix(), "D")} - ${time(endDate.unix(), "D")}) ( Ends in ${this.seasonEndsIn} days)`,
      )
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${this.season.split(" ").join("_")}`);
    const datas = this.getAcquiredItems();
    for (const data of datas) {
      const items = data.items.join(", ");
      embeds.addFields({ name: data.title, value: items });
    }
    const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
    const spirits = Object.keys(this.data.spirits);
    spirits.forEach((spirit) => {
      const items = this.data.spirits[spirit].cosmetics;
      const row = new ActionRowBuilder<StringSelectMenuBuilder>();
      const menu = new StringSelectMenuBuilder()
        .setCustomId("calendar-" + spirit.split(" ").join("_"))
        .setPlaceholder(spirit)
        .setMaxValues(items.length)
        .setMinValues(0)
        .addOptions(
          items.map((item, index) => {
            return {
              label: item.item + ` (${item.price}SC)`,
              value: index.toString(),
              emoji: item.icon,
              default: item.acquired,
            };
          }),
        );
      components.push(row.addComponents(menu));
    });

    // Add the progress card
    const attchment = new AttachmentBuilder(await this.buildCard(), {
      name: "progress.png",
    });
    embeds.setImage("attachment://progress.png");
    return { embeds: [embeds], components, files: [attchment] };
  }

  async handleInt(interaction: ChatInputCommandInteraction) {
    this.sync();
    const reply = await interaction.editReply(await this.getContent());
    const collector = reply.createMessageComponentCollector({
      idle: 90_000,
      componentType: ComponentType.StringSelect,
      filter: (i) => i.customId.startsWith("calendar-"),
    });

    collector.on("collect", async (int) => {
      const spirit = int.customId.split("-")[1].split("_").join(" ");
      const values = int.values;
      this.data.spirits[spirit].cosmetics.forEach((it) => (it.acquired = false));
      values.forEach((i) => {
        this.data.spirits[spirit].cosmetics[parseInt(i)].acquired = true;
      });
      this.data.markModified("spirits");
      await this.data.save();
      this.sync();
      await int.update(await this.getContent());
    });
    collector.on("end", () => {
      interaction
        .fetchReply()
        .then(() => {
          const components = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder().setCustomId("anyyyy").setDisabled(true).setPlaceholder("Menu expired!").setOptions({
              label: "hmm",
              value: "hmm",
            }),
          );
          interaction.editReply({ components: [components] });
        })
        .catch(() => {});
    });
  }
  public async buildCard(): Promise<Buffer> {
    const emojiURL = this.author.client.emojis.cache
      .get(parseEmoji(this.seasonIcon)?.id as unknown as string)
      ?.imageURL({ extension: "png" });
    const card = new SeasonProgressCard()
      .setName(this.author instanceof GuildMember ? this.author.nickname ?? this.author.displayName : this.author.displayName)
      .setProgress(parseInt(this.progressLevel.toFixed()))
      .setSeason(this.season)
      .setSeasonIcon(emojiURL as unknown as string)
      .setThumbnailImage(this.author.displayAvatarURL({ forceStatic: true, extension: "png" }));
    return await card.build();
  }
}
