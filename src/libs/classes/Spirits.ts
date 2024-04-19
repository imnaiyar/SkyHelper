import { SpiritsData } from "#libs/types";
import { SkyHelper } from "#structures";
import {
  APIActionRowComponent,
  APIButtonComponent,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionCollector,
  time,
} from "discord.js";
import config from "#src/config";
import moment from "moment-timezone";

// Define location button
const lctnBtn = new ButtonBuilder().setCustomId("spirit_location").setLabel("Location").setStyle(ButtonStyle.Secondary);

// Define Friendship Tree button
const treeBtn = new ButtonBuilder().setCustomId("spirit_tree").setStyle(ButtonStyle.Secondary).setLabel("Friendship Tree");

const getBackBtn = (emote: string, id: string): ButtonBuilder =>
  new ButtonBuilder().setCustomId(id).setEmoji(emote).setStyle(ButtonStyle.Success);

const getExpressionBtn = (data: SpiritsData, icon: string): ButtonBuilder =>
  new ButtonBuilder()
    .setCustomId(data.call ? "spirit_call" : data.stance ? "spirit_stance" : "spirit_expression")
    .setLabel(data.emote ? "Emote" : data.stance ? "Stance" : data.call ? "Call" : "Friend Action")
    .setEmoji(icon)
    .setStyle(ButtonStyle.Primary);

/**
 * Handle Spirit data and interactions
 */
export class Spirits {
  constructor(
    private data: SpiritsData,
    private client: SkyHelper,
  ) {
    this.data = data;
    this.client = client;
  }

  /**
   * Get the embed for the spirit response
   */
  public getEmbed(): EmbedBuilder {
    const data = this.data;
    const client = this.client;
    const icon = data.emote?.icon ?? data.call?.icon ?? data.stance?.icon ?? data.action?.icon;
    const desc = `**Type:** ${data.type}${
      data.realm ? `\n**Realm:** ${client.emojisMap.get("realms")![data.realm]} ${data.realm}` : ""
    }${data.season ? `\n**Season:** ${client.emojisMap.get("seasons")![data.season]} Season of ${data.season}` : ""}`;
    const embed = new EmbedBuilder()
      .setTitle(`${icon} ${data.name}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
      .setDescription(desc)
      .setAuthor({ name: "Spirit Summary" });
    if (data.ts && !data.current) {
      embed.addFields({
        name: "TS Summary",
        value: !data.ts.eligible
          ? `- This spirit is not eligible to return as a TS yet, and will become eligible when the season after the ${
              client.emojisMap.get("seasons")![data.season as string]
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
            : "- This spirit has not returned yet, when they do return, they'll offer the same items offered during the season but in a restructured friendship tree.",
      });
    }

    if (data.main) {
      embed.addFields({ name: `Infographics by Ed.7`, value: " " });
      embed.setImage(`${config.CDN_URL}/${data.main.image}`);
    } else {
      // For seasonal spirits
      embed.addFields({
        name: `${data.ts?.returned ? "Friendship Tree (Last Visit)" : "Seasonal Price Chart"} by ${data.tree!.by}`,
        value: data
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
      });
      embed.setImage(`${config.CDN_URL}/${data.tree!.image}`);
    }
    return embed;
  }

  /**
   * Get the buttons for the spirit response
   */
  public getButtons(): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const data = this.data;
    if (data.location) row.addComponents(lctnBtn);
    // prettier-ignore
    if (data.emote || data.stance || data.action || data.call) row.addComponents(getExpressionBtn(data, (data.emote?.icon ?? data.call?.icon ?? data.stance?.icon ?? data.action?.icon) as string));

    // TODO: Add cosmetics and cosmetics buttons
    return row;
  }

  /**
   * A manager to handle spirit buttons interactions
   * @param interaction The initial interaction that initiated the response
   */
  public async handleInt(interaction: ChatInputCommandInteraction): Promise<void> {
    const data = this.data;

    // prettier-ignore
    const customIDs = ["spirit_location", "spirit_tree", "spirit_call", "spirit_stance", "spirit_expression", "spirit_tree", "guide-back"];
    try {
      const reply = await interaction.fetchReply();

      const collector = reply.createMessageComponentCollector({
        filter: (i) => customIDs.includes(i.customId),
        idle: 60_000,
      }) as InteractionCollector<ButtonInteraction>;

      collector.on("collect", async (int: ButtonInteraction): Promise<void> => {
        if (int.user.id !== interaction.user.id) {
          await int.reply({ content: "You cannot use menu(s) meant for others!", ephemeral: true });
          return;
        }
        await int.deferUpdate();
        const newEmbed = EmbedBuilder.from(reply.embeds[0]);
        switch (int.customId) {
          // Handle Location Button
          case "spirit_location": {
            // prettier-ignore
            const newRow = ActionRowBuilder.from(reply.components[0] as APIActionRowComponent<APIButtonComponent>) as ActionRowBuilder<ButtonBuilder>;
            newRow.components[0] = treeBtn;
            newEmbed.spliceFields(-1, 1, {
              name: `Location by ${data.location!.by}`,
              value: data.location?.description || " ",
            });
            newEmbed.setImage(`${config.CDN_URL}/${data.location!.image}`);
            await int.editReply({ embeds: [newEmbed], components: [newRow] });
            break;
          }

          // Handle Tree Button
          case "spirit_tree": {
            // prettier-ignore
            const newRow = ActionRowBuilder.from(reply.components[0] as APIActionRowComponent<APIButtonComponent>) as ActionRowBuilder<ButtonBuilder>;
            newRow.components[0] = lctnBtn;
            newEmbed.spliceFields(-1, 1, {
              name: `${data.ts?.returned ? "Friendship Tree" : "Seasonal Price Chart"} by ${data.tree!.by}`,
              value: data
                .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
                .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
                .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
            });
            newEmbed.setImage(`${config.CDN_URL}/${data.tree!.image}`);
            await int.editReply({ embeds: [newEmbed], components: [newRow] });
            break;
          }

          // Handle Call Button
          case "spirit_call": {
            await int.editReply({
              content: `### ${data.call!.icon} [${
                data.call!.title
              }](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${
                data.name
              } call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
              embeds: [],
              files: [`${config.CDN_URL}/${data.call!.image}`],
              // prettier-ignore
              components: [new ActionRowBuilder().addComponents(getBackBtn(data.call!.icon, "exprsn_back")) as ActionRowBuilder<ButtonBuilder>],
            });
            break;
          }
          // Handle Stance Button
          case "spirit_stance": {
            const stanceEmbed = new EmbedBuilder()
              .setTitle(`${data.stance!.icon} ${data.stance!.title}`)
              .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
              .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
              .setImage(`${config.CDN_URL}/${data.stance!.image}`)
              .setAuthor({ name: `Stance - ${data.name}` });

            await int.editReply({
              embeds: [stanceEmbed],
              components: [new ActionRowBuilder<ButtonBuilder>().addComponents(getBackBtn(data.stance!.icon, "exprsn_back"))],
            });
            break;
          }

          // Handle Emote/Action Button
          case "spirit_expression":
            await this.handleExpression(data, int);
            break;
          case "guide-back":
            collector.stop("Guide Back");
            break;
        }
      });

      collector.on("end", async (_coll, reason) => {
        if (reason === "Guide Back") return;
        const msg = await interaction.fetchReply();
        const components = msg.components.map((row) => {
          const actionRow = ActionRowBuilder.from(row);
          actionRow.components.forEach((com) => (com as unknown as any).setDisabled(true));
          return actionRow;
        }) as ActionRowBuilder<ButtonBuilder>[];
        await interaction.editReply({ components });
      });
    } catch (err) {
      this.client.logger.error(err);
    }
  }

  /**
   * A manager to handle spirits expressions
   * @param data The spirti data
   * @param btnInt The button interaction that initiated this manager
   * @param collector The collector active on this message
   */
  private async handleExpression(data: SpiritsData, btnInt: ButtonInteraction) {
    const orgData = {
      content: btnInt.message.content,
      embeds: btnInt.message.embeds,
      files: btnInt.message.attachments.map((a) => a.url),
      components: btnInt.message.components,
    };
    let page = 1;
    const exprsn = data.emote ? data.emote : data.action;
    const total = exprsn!.level.length - 1;
    const getEmote = (): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } => {
      const emote = exprsn!.level[page - 1];

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${data.emote ? "Emote" : "Friend Action"} - ${data.name}` })
        .setTitle(`${exprsn!.icon} ${emote.title}`)
        .setURL(
          `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
            data.emote ? "Expression" : "Friend_Action"
          }`,
        )
        .setImage(`${config.CDN_URL}/${emote.image}`);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("emote_prev")
          .setLabel(`⬅️ ${exprsn!.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        getBackBtn(exprsn!.icon, "emote_back"),
        new ButtonBuilder()
          .setCustomId("emote_next")
          .setLabel(`${exprsn!.level[page]?.title.slice(-7) || emote.title.slice(-7)} ➡️`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === total + 1),
      );

      return {
        embeds: [embed],
        components: [row],
      };
    };
    try {
      await btnInt.editReply(getEmote());
      const collector = btnInt.message.createMessageComponentCollector({
        filter: (i) => ["emote_prev", "emote_next", "emote_back"].includes(i.customId),
        idle: 60_000,
      });
      collector.on("collect", async (i) => {
        if (i.user.id !== btnInt.user.id) {
          await i.reply({ content: "You cannot use menu(s) meant for others!", ephemeral: true });
          return;
        }
        await i.deferUpdate();
        switch (i.customId) {
          case "emote_prev":
            page--;
            await i.editReply(getEmote());
            break;
          case "emote_next":
            page++;
            await i.editReply(getEmote());
            break;
          case "emote_back":
            collector.stop("Spirit Back");
            await i.editReply(orgData);
            break;
        }
      });
    } catch (err) {
      this.client.logger.error(err);
    }
  }
}
