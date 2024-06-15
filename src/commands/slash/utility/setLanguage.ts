import { getTranslator } from "#src/il8n";
import { supportedLang } from "#src/libs/constants/supportedLang";
import { IntegrationTypes } from "#src/libs/types";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";

export default {
  async execute(interaction, t, client) {
    const type = interaction.options.getString("type", true);
    const lang = interaction.options.getString("languages", true);
    const language = supportedLang.find((l) => l.value === lang)!;
    switch (type) {
      case "server": {
        if (!interaction.inCachedGuild()) {
          return void (await interaction.reply({
            content: t("common.errors.NOT_A_SERVER"),
            ephemeral: true,
          }));
        }
        if (!interaction.member.permissions.has("ManageGuild")) {
          return void (await interaction.reply({
            content: t("commands.LANGUAGE.options.RESPONSES.NO-PERM", { PERMISSION: "`Manage Server`" }),
            ephemeral: true,
          }));
        }
        await interaction.deferReply();
        const settings = await client.database.getSettings(interaction.guild);
        if (lang === settings.language?.value) {
          return void (await interaction.editReply(
            t("commands.LANGUAGE.options.RESPONSES.ALREADY_SET", {
              TYPE: "The server's",
              LANGUAGE: `${language.name} (${settings.language?.flag ? settings.language.flag + " " : ""}\`${language.value}\`)`,
            }),
          ));
        }
        settings.language = language;
        await settings.save();
        const user_settings = await client.database.getUser(interaction.user);
        const ts = getTranslator(user_settings.language?.value ?? lang);
        return void (await interaction.editReply(
          ts("commands.LANGUAGE.options.RESPONSES.SUCCESS", {
            TYPE: `\`${interaction.guild.name}\``,
            Language: `${language.name} (${settings.language?.flag ? settings.language.flag + " " : ""}\`${language.value}\`)`,
            LINK: "<https://crowdin.com/project/skyhelper>",
          }),
        ));
      }
      case "user": {
        await interaction.deferReply();
        const user_settings = await client.database.getUser(interaction.user);
        if (lang === user_settings.language?.value) {
          return void (await interaction.editReply(
            t("commands.LANGUAGE.options.RESPONSES.ALREADY_SET", {
              TYPE: "Your",
              LANGUAGE: `${language.name} (${user_settings.language?.flag ? user_settings.language.flag + " " : ""}\`${language.value}\`)`,
            }),
          ));
        }
        user_settings.language = language;
        await user_settings.save();
        const ts = getTranslator(lang);
        await interaction.editReply(
          ts("commands.LANGUAGE.options.RESPONSES.SUCCESS", {
            TYPE: `\`${interaction.user.username}\``,
            Language: `${language.name} (${user_settings.language?.flag ? user_settings.language.flag + " " : ""}\`${language.value}\`)`,
            LINK: "<https://crowdin.com/project/skyhelper>",
          }),
        );
        return;
      }
    }
  },
  data: {
    name: "set-language",
    description: "set a preferred language for the bot's response",
    options: [
      {
        name: "type",
        description: "what level to set the language up?",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "Server",
            value: "server",
          },
          {
            name: "User",
            value: "user",
          },
        ],
        required: true,
      },
      {
        name: "languages",
        description: "select a language",
        type: ApplicationCommandOptionType.String,
        choices: supportedLang.map((lang) => ({
          name: `${lang.flag} ${lang.name}`,
          value: lang.value
        })),
        required: true,
      },
    ],
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [0, 1, 2],
  },
} satisfies SlashCommand;
