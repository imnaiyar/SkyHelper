import { dailyQuestEmbed } from "#utils";
import type { Command, SkyHelper } from "#structures";
import moment from "moment-timezone";
import {
  ButtonBuilder,
  type APIActionRowComponent,
  type APIButtonComponent,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  type APIStringSelectComponent,
  type BaseMessageOptions,
  Message,
  ChatInputCommandInteraction,
} from "discord.js";
import type { getTranslator } from "#bot/i18n";
import { DAILY_QUESTS_DATA } from "#bot/commands/commands-data/info-commands";
export default {
  async interactionRun(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") || undefined });

    const m = await interaction.editReply(await getQuestResponse(client, t));
    disableButtons(m, interaction);
  },

  async messageRun({ message, t }) {
    const m = await message.reply(await getQuestResponse(message.client, t));
    disableButtons(m);
  },
  ...DAILY_QUESTS_DATA,
} satisfies Command;

const getQuestResponse = async (client: SkyHelper, t: ReturnType<typeof getTranslator>): Promise<string | BaseMessageOptions> => {
  const data = await client.database.getDailyQuests();
  const now = moment().tz(client.timezone).startOf("day");
  const last_updated = moment.tz(data.last_updated, client.timezone).startOf("day");
  if (!data.last_updated || !now.isSame(last_updated) || !data.quests.length) {
    return t("commands:DAILY_QUESTS.RESPONSES.NO_DATA");
  }
  return dailyQuestEmbed(data, 0);
};

const disableButtons = (m: Message, int?: ChatInputCommandInteraction): void => {
  const collector = m.createMessageComponentCollector({ idle: 90_000 });
  collector.on("end", () => {
    const components = m.components.map((row) => {
      const r = ActionRowBuilder.from(row);
      r.components.forEach((c) => {
        if (c instanceof ButtonBuilder || c instanceof StringSelectMenuBuilder) {
          c.setDisabled(true);
        }
      });
      return r.toJSON();
    });
    (int?.editReply.bind(int) ?? m.edit.bind(m))({
      components: components as APIActionRowComponent<APIButtonComponent | APIStringSelectComponent>[],
    }).catch(() => {});
  });
};
