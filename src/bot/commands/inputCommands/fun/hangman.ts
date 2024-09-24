import { Hangman } from "#bot/libs/classes/HangMan";
import type { Command } from "#structures";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  MessageComponentInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  User,
  UserSelectMenuBuilder,
  type APIEmbed,
  type BaseMessageOptions,
} from "discord.js";
import { setTimeout } from "timers/promises";
export default {
  name: "skygame",
  description: "Various fun games based around Sky: CotL",
  slash: {
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "hangman",
        description: "Play a game of hangman based on sky-related words, or a custom word",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "mode",
            description: "The mode of the game",
            choices: [
              { name: "Single Player", value: "single" },
              { name: "Double Player", value: "double" },
            ],
            required: true,
          },
        ],
      },
    ],
  },
  async interactionRun(interaction, _t, _client) {
    const mode = interaction.options.getString("mode", true);
    if (!interaction.channel || !interaction.channel.isSendable()) {
      return void (await interaction.reply({
        content: "This game can only be played in channels where I can send messages.",
        ephemeral: true,
      }));
    }

    let word: string | null = null;
    let type: string = "random";
    let maxLives: number = 7;
    let players: User[] = [interaction.user];

    const validateAndReply = async (int: MessageComponentInteraction, message: string, ephemeral = true) => {
      await int.update(getResponse());
      return await int.followUp({ content: message, ephemeral });
    };

    const getCompletedStatus = (completed: boolean) => (completed ? "✅" : "❌");

    const getResponse = (): BaseMessageOptions => {
      const embed: APIEmbed = {
        title: "Sky Hangman Game",
        description: `**Selected Mode:** ${mode === "single" ? "Single Player" : "Double Player"}
        **Word Type:** ${type === "custom" ? "Custom" : "Random"}
        ${mode === "single" ? `**Max Lives:** ${maxLives}` : ""}
        **Provide the following information:**
        ${mode === "double" ? `- ${getCompletedStatus(players.length === 2)} Mention the player you want to play with.\n` : ""}${type === "custom" ? `- ${getCompletedStatus(!!word)} Provide a custom word.\n` : ""}${mode === "single" ? "- Optionally choose the maximum number of lives for 'single' mode (max: 10).\n" : ""}`,
        color: 0x00ff00,
      };

      return {
        embeds: [embed],
        components: createComponents(),
      };
    };

    const createComponents = () => {
      const components = [];
      if (mode === "double") {
        components.push(
          new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            new UserSelectMenuBuilder()
              .setCustomId("skygame_hangman_user")
              .setPlaceholder("Select players")
              .setDefaultUsers(players.map((p) => p.id))
              .setMaxValues(2),
          ),
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("skygame_hangman_type")
              .setPlaceholder("Select word type")
              .addOptions([
                { label: "Random", description: "Bot selects random words", value: "random", default: type === "random" },
                { label: "Custom", description: "Provide your own word", value: "custom", default: type === "custom" },
              ]),
          ),
        );
      }

      if (mode === "single") {
        components.push(
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("skygame_hangman_maxlives")
              .setPlaceholder("Select max lives")
              .addOptions(
                Array.from({ length: 10 }, (_, i) => ({
                  label: i.toString(),
                  value: i.toString(),
                  default: i === maxLives,
                })),
              ),
          ),
        );
      }

      components.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          ...(mode === "double" && type === "custom"
            ? [new ButtonBuilder().setCustomId("skygame_hangman_word").setLabel("Provide Word").setStyle(ButtonStyle.Primary)]
            : []),
          new ButtonBuilder()
            .setCustomId("skygame_hangman_start")
            .setLabel("Start Game")
            .setDisabled((type === "custom" && !word) || (mode === "double" && players.length !== 2))
            .setStyle(ButtonStyle.Success),
        ),
      );

      return components;
    };

    const msg = await interaction.reply({ ...getResponse(), fetchReply: true });

    const col = msg.createMessageComponentCollector({ idle: 90_000, filter: (i) => i.user.id === interaction.user.id });
    col.on("collect", async (i) => {
      const action = i.customId.split("_").last();

      if (i.isStringSelectMenu()) {
        const value = i.values[0];
        if (action === "type") {
          if (value === "custom" && players.some((p) => p.id === i.user.id)) {
            return validateAndReply(
              i,
              "You can't change the word type to 'custom' when you are one of the player, either choose someone else, or continue",
            );
          }
          type = value;
          if (value === "random") word = null;
          return await i.update({ ...getResponse() });
        }
        if (action === "maxlives" && mode === "single") {
          maxLives = parseInt(value);
          return await i.update({ ...getResponse() });
        }
      }

      if (i.isUserSelectMenu()) {
        if (type === "custom" && i.users.has(i.user.id)) {
          return validateAndReply(i, "You can't play with yourself when providing a custom word.");
        }
        players = [...i.users.values()];
        return await i.update({ ...getResponse() });
      }

      if (i.isButton()) {
        if (action === "word") {
          if (mode === "single") {
            return validateAndReply(i, "Custom words are not allowed in single mode.");
          }
          const modal = new ModalBuilder().setCustomId("skygame_hangman_word_modal").setTitle("Provide a Word");
          modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("skygame_hangman_word_input")
                .setLabel("Word")
                .setRequired(true)
                .setStyle(TextInputStyle.Short),
            ),
          );
          await i.showModal(modal);

          const modalSubmit = await i.awaitModalSubmit({ time: 60_000 }).catch(() => null);
          if (modalSubmit) {
            word = modalSubmit.fields.getTextInputValue("skygame_hangman_word_input");
            if (!modalSubmit.isFromMessage()) return;
            await modalSubmit.update({ ...getResponse() });
          }
        } else if (action === "start") {
          col.stop();
          if (!interaction.channel?.isSendable()) return;
          const game = new Hangman(interaction.channel, {
            mode: mode as "single" | "double",
            players,
            ...(word ? { word } : {}),
            ...(mode === "single" ? { totalLives: maxLives } : {}),
          });
          await i.update({ components: [] });
          await i.followUp({
            content: constants[mode as "single" | "double"],
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId("hangman_game_confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("hangman_game_deny").setLabel("Cancel").setStyle(ButtonStyle.Danger),
              ),
            ],
          });
          await setTimeout(2000);
          game.inititalize();
        }
      }
    });
  },
} satisfies Command;

const BASE =
  "Game starting! You will have 30 seconds to answer in each round. Every attempt (or lack of within the specified time) will count as wrong answer. If you think you know the full word, you can type it so (like `Ascended Candles`).";
const constants = {
  ["single"]: `- ${BASE}\n- Each wrong answer will cost lives. The embed will show how many live you have left. You'll loose if you fail to guess the word correctly before your lives runs out.`,
  ["double"]: `- ${BASE}\n- Each player will answer in turn, randomly picking for the first round, the player who guesses correctly will stay in the round until they guess incorrectly (or fail to do so within time), the round will pass to next person. Whoever guesses the word first wins.`,
};
