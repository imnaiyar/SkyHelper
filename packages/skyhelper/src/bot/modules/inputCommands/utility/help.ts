import { type Command, Category } from "@/structures";
import { HELP_DATA } from "@/modules/commands-data/utility-commands";
import { handleCategoryCommands, handleSingleCmd } from "./sub/help.js";
import type { APIActionRowComponent, APIButtonComponent, APIEmbed, APIStringSelectComponent } from "@discordjs/core";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";

export default {
  async interactionRun({ helper, options }) {
    const { client, t } = helper;
    const commandName = options.getString("command");
    const reply = await helper.defer(
      {
        flags: commandName ? 64 : undefined,
      },
      true,
    );
    const commands = client.applicationCommands;

    if (commandName) {
      await handleSingleCmd(helper, commandName);
      return;
    }
    let category: (typeof Category)[number] = Category.find((c) => c.name === "Admin")!;

    const collector = client.componentCollector({
      filter: (i) => i.message.id === reply.id,
      idle: 2 * 60 * 1000,
      message: reply,
    });
    const guild = client.guilds.get(helper.int.guild_id || "");
    let page = 1;
    const guildCommands = guild ? [...(await client.api.applicationCommands.getGuildCommands(client.user.id, guild.id))] : [];
    const updateSlashMenu = async () => {
      const totalCommands: string[] = handleCategoryCommands([...commands.values(), ...guildCommands], client, category.name, t);
      const commandsPerPage = 5;
      const totalPages = Math.ceil(totalCommands.length / commandsPerPage);
      const slashEmbed: APIEmbed = {
        author: {
          name: t("commands:HELP.RESPONSES.REQUESTED_BY", {
            USER: helper.user.username,
          }),
          icon_url: client.utils.getUserAvatar(helper.user),
        },
        color: 0xffd700, // Gold color
        footer: {
          text: t("commands:HELP.RESPONSES.FOOTER", {
            PAGE: page,
            TOTAL: totalPages,
          }),
        },
      };

      const startIndex = (page - 1) * commandsPerPage;
      const endIndex = startIndex + commandsPerPage;

      slashEmbed.description = totalCommands.length ? totalCommands.slice(startIndex, endIndex).join("\n\n") : "No Commands";
      const hmBtn: APIActionRowComponent<APIButtonComponent> = {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: client.utils.encodeCustomId({ id: "prevBtn", user: helper.user.id }),
            label: t("commands:HELP.RESPONSES.BTN-PREV"),
            style: 2,
            disabled: page === 1,
          },
          {
            type: 2,
            custom_id: client.utils.encodeCustomId({ id: "homeBtn", user: helper.user.id }),
            label: "🏠",
            style: 3,
            disabled: true,
          },
          {
            type: 2,
            custom_id: client.utils.encodeCustomId({ id: "nextBtn", user: helper.user.id }),
            label: t("commands:HELP.RESPONSES.BTN-NEXT"),
            style: 2,
            disabled: page === totalPages,
          },
        ],
      };

      const categoryMenu: APIActionRowComponent<APIStringSelectComponent> = {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: client.utils.encodeCustomId({ id: "help_category", user: helper.user.id }),
            placeholder: "Select a category",
            options: Category.filter(
              (c) =>
                (c.name === "Owner" ? client.config.OWNER.includes(helper.user.id) : true) /* check owner */ &&
                client.commands.some((com) => com.category === c.name), // filter cateories that don't have any commands
            ).map((c) => ({
              label: c.name,
              value: c.name,
              emoji: { name: c.emoji },
              default: c.name === category.name,
            })),
          },
        ],
      };
      return {
        embeds: [slashEmbed],
        components: [categoryMenu, hmBtn],
      };
    };
    await helper.followUp(await updateSlashMenu());
    collector.on("collect", async (int) => {
      const compHelper = new InteractionHelper(int, client);
      const selectedChoice = client.utils.parseCustomId(int.data.custom_id).id;
      if (selectedChoice === "nextBtn") {
        page++;
        await compHelper.update(await updateSlashMenu());
      } else if (selectedChoice === "prevBtn") {
        if (page > 1) {
          page--;
          await compHelper.update(await updateSlashMenu());
        }
      }
      if (compHelper.isStringSelect(int)) {
        category = Category.find((c) => c.name === int.data.values[0])!;
        page = 1;
        await compHelper.update(await updateSlashMenu());
      }
    });
  },

  async autocomplete({ helper, options }) {
    const focused = options.getFocusedOption();
    const { client } = helper;
    const commands = client.applicationCommands.map((c) => c);
    const guild = client.guilds.get(helper.int.guild_id || "");
    const guildCommands = guild ? await client.api.applicationCommands.getGuildCommands(helper.client.user.id, guild.id) : [];
    commands.push(...guildCommands);
    const choices = commands
      .filter((cmd) =>
        (client.commands.get(cmd.name) || client.contexts.get(cmd.name + cmd.type))?.category === "Owner"
          ? client.config.OWNER.includes(helper.user.id)
          : true,
      )
      .filter((cmd) => cmd.name.includes(focused.value as string))
      .map((cmd) => ({
        name: cmd.name,
        value: cmd.name,
      }));
    await helper.respond({ choices });
  },
  ...HELP_DATA,
} satisfies Command<true>;
