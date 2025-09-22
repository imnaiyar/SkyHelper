import { getTranslator } from "@/i18n";
import { supportedLang } from "@skyhelperbot/constants";
import type { Command } from "@/structures";
import { LANGUAGE_DATA } from "@/modules/commands-data/utility-commands";
export default {
  async interactionRun({ helper, options }) {
    const type = options.getString("category", true);
    const sub = options.getSubcommand();
    const { client, t } = helper;
    const guild = helper.client.guilds.get(helper.int.guild_id ?? "");
    if (type === "server") {
      if (!guild) {
        return void (await helper.reply({
          content: t("errors:NOT_A_SERVER"),
          flags: 64,
        }));
      }
      if (!client.permUtils(helper.int.member!.permissions as `${number}`).has("ManageGuild")) {
        return void (await helper.reply({
          content: t("commands:LANGUAGE.options.RESPONSES.NO-PERM", {
            PERMISSION: "`Manage Server`",
          }),
          flags: 64,
        }));
      }
    }
    await helper.defer();
    if (sub === "set") {
      const lang = options.getString("languages", true);
      const language = supportedLang.find((l) => l.value === lang)!;
      switch (type) {
        case "server": {
          const settings = await client.schemas.getSettings(guild!);
          if (lang === settings.language?.value) {
            return void (await helper.editReply({
              content: t("commands:LANGUAGE.options.RESPONSES.ALREADY_SET", {
                TYPE: "The server's",
                LANGUAGE: `${language.name} (${
                  settings.language?.flag ? settings.language.flag + " " : ""
                }\`${language.value}\`)`,
              }),
            }));
          }
          settings.language = language;
          await settings.save();
          const user_settings = await client.schemas.getUser(helper.user);
          const ts = getTranslator(user_settings.language?.value ?? lang);
          return void (await helper.editReply({
            content: ts("commands:LANGUAGE.options.RESPONSES.SUCCESS", {
              TYPE: `\`${guild!.name}\``,
              Language: `${language.name} (${settings.language?.flag ? settings.language.flag + " " : ""}\`${language.value}\`)`,
              LINK: "<https://docs.skyhelper.xyz/pages/translating>",
            }),
          }));
        }
        case "user": {
          const user_settings = await client.schemas.getUser(helper.user);
          if (lang === user_settings.language?.value) {
            return void (await helper.editReply({
              content: t("commands:LANGUAGE.options.RESPONSES.ALREADY_SET", {
                TYPE: "Your",
                LANGUAGE: `${language.name} (${
                  user_settings.language?.flag ? user_settings.language.flag + " " : ""
                }\`${language.value}\`)`,
              }),
            }));
          }
          user_settings.language = language;
          await user_settings.save();
          const ts = getTranslator(lang);
          await helper.editReply({
            content: ts("commands:LANGUAGE.options.RESPONSES.SUCCESS", {
              TYPE: `\`${helper.user.username}\``,
              Language: `${language.name} (${
                user_settings.language?.flag ? user_settings.language.flag + " " : ""
              }\`${language.value}\`)`,
              LINK: "<https://crowdin.com/project/skyhelper>",
            }),
          });
          return;
        }
      }
    }
    if (sub === "remove") {
      const settings = type === "server" ? await client.schemas.getSettings(guild!) : null;
      const user_settings = await client.schemas.getUser(helper.user);
      const lang = (type === "server" ? settings! : user_settings).language;
      const formattedLang = lang && `${lang.name} (${lang.flag} ${lang.value})`;
      if (!lang?.value) {
        await helper.followUp({
          content: t("commands:LANGUAGE.options.RESPONSES.ALREADY_NOT_SET", {
            CATEGORY: `\`${type === "server" ? guild!.name : helper.user.username}\``,
          }),
        });
        return;
      }
      switch (type) {
        case "server": {
          settings!.language = undefined;
          const ts = getTranslator(user_settings.language?.value ?? "en-US");
          await settings!.save();
          await helper.followUp({
            content: ts("commands:LANGUAGE.options.RESPONSES.SUCCESS_REMOVED", {
              LANGUAGE: formattedLang,
              CATEGORY: `\`${guild!.name}\``,
            }),
          });
          return;
        }
        case "user": {
          user_settings.language = undefined;
          const ts = getTranslator(settings?.language?.value ?? "en-US");
          await user_settings.save();
          await helper.followUp({
            content: ts("commands:LANGUAGE.options.RESPONSES.SUCCESS_REMOVED", {
              LANGUAGE: formattedLang,
              CATEGORY: `\`${helper.user.username}\``,
            }),
          });
          return;
        }
      }
    }
  },
  ...LANGUAGE_DATA,
} satisfies Command;
