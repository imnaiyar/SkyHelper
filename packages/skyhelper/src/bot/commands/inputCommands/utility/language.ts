import { getTranslator } from "#bot/i18n";
import { supportedLang } from "#bot/libs/constants/supportedLang";
import type { Command } from "#structures";
import { LANGUAGE_DATA } from "#bot/commands/commands-data/utility-commands";
export default {
  async interactionRun(interaction, t, client) {
    const type = interaction.options.getString("category", true);
    const sub = interaction.options.getSubcommand();
    if (type === "server") {
      if (!interaction.inCachedGuild()) {
        return void (await interaction.reply({
          content: t("errors:NOT_A_SERVER"),
          ephemeral: true,
        }));
      }
      if (!interaction.member.permissions.has("ManageGuild")) {
        return void (await interaction.reply({
          content: t("commands:LANGUAGE.options.RESPONSES.NO-PERM", {
            PERMISSION: "`Manage Server`",
          }),
          ephemeral: true,
        }));
      }
    }
    await interaction.deferReply();
    if (sub === "set") {
      const lang = interaction.options.getString("languages", true);
      const language = supportedLang.find((l) => l.value === lang)!;
      switch (type) {
        case "server": {
          const settings = await client.database.getSettings(interaction.guild!);
          if (lang === settings.language?.value) {
            return void (await interaction.editReply(
              t("commands:LANGUAGE.options.RESPONSES.ALREADY_SET", {
                TYPE: "The server's",
                LANGUAGE: `${language.name} (${
                  settings.language?.flag ? settings.language.flag + " " : ""
                }\`${language.value}\`)`,
              }),
            ));
          }
          settings.language = language;
          await settings.save();
          const user_settings = await client.database.getUser(interaction.user);
          const ts = getTranslator(user_settings.language?.value ?? lang);
          return void (await interaction.editReply(
            ts("commands:LANGUAGE.options.RESPONSES.SUCCESS", {
              TYPE: `\`${interaction.guild!.name}\``,
              Language: `${language.name} (${settings.language?.flag ? settings.language.flag + " " : ""}\`${language.value}\`)`,
              LINK: "<https://docs.skyhelper.xyz/pages/translating>",
            }),
          ));
        }
        case "user": {
          const user_settings = await client.database.getUser(interaction.user);
          if (lang === user_settings.language?.value) {
            return void (await interaction.editReply(
              t("commands:LANGUAGE.options.RESPONSES.ALREADY_SET", {
                TYPE: "Your",
                LANGUAGE: `${language.name} (${
                  user_settings.language?.flag ? user_settings.language.flag + " " : ""
                }\`${language.value}\`)`,
              }),
            ));
          }
          user_settings.language = language;
          await user_settings.save();
          const ts = getTranslator(lang);
          await interaction.editReply(
            ts("commands:LANGUAGE.options.RESPONSES.SUCCESS", {
              TYPE: `\`${interaction.user.username}\``,
              Language: `${language.name} (${
                user_settings.language?.flag ? user_settings.language.flag + " " : ""
              }\`${language.value}\`)`,
              LINK: "<https://crowdin.com/project/skyhelper>",
            }),
          );
          return;
        }
      }
    }
    if (sub === "remove") {
      const settings = type === "server" ? await client.database.getSettings(interaction.guild!) : null;
      const user_settings = await client.database.getUser(interaction.user);
      const lang = (type === "server" ? settings! : user_settings)["language"];
      const formattedLang = lang && `${lang.name} (${lang.flag} ${lang.value})`;
      if (!lang?.value) {
        return void (await interaction.followUp(
          t("commands:LANGUAGE.options.RESPONSES.ALREADY_NOT_SET", {
            CATEGORY: `\`${type === "server" ? interaction.guild!.name : interaction.user.username}\``,
          }),
        ));
      }
      switch (type) {
        case "server": {
          settings!.language = undefined;
          const ts = getTranslator(user_settings.language?.value ?? "en-US");
          await settings!.save();
          return void (await interaction.followUp(
            ts("commands:LANGUAGE.options.RESPONSES.SUCCESS_REMOVED", {
              LANGUAGE: formattedLang,
              CATEGORY: `\`${interaction.guild!.name}\``,
            }),
          ));
        }
        case "user": {
          user_settings.language = undefined;
          const ts = getTranslator(settings?.language?.value ?? "en-US");
          await user_settings.save();
          return void (await interaction.followUp(
            ts("commands:LANGUAGE.options.RESPONSES.SUCCESS_REMOVED", {
              LANGUAGE: formattedLang,
              CATEGORY: `\`${interaction.user.username}\``,
            }),
          ));
        }
      }
    }
  },
  ...LANGUAGE_DATA,
} satisfies Command;
