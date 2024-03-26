const { ApplicationCommandOptionType } = require("discord.js");
const handleSpirits = require("./sub/shared/handleSpirits");
/**
 * @type {import('@src/frameworks').SlashCommands}
 */
module.exports = {
  data: {
    name: "spirits",
    description: "Search for a spirits informations",
    options: [
      {
        name: "search",
        description: "value to search",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: "hide",
        description: "hide the guides from others (default: false)",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2], 
  },

  async execute(interaction, client) {
    const ephmrl = interaction.options.getBoolean("hide");
    const ephemeral = ephmrl === null ? false : ephmrl;
    const spiritValue = interaction.options.getString("search");
    if (!Object.keys(client.spiritsData).includes(spiritValue)) {
      await interaction.reply({
        content: `Provided spirit value (\`${spiritValue}\`) does not exists, wanna try again?`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: ephemeral });
    await handleSpirits(interaction, spiritValue, false);
  },

  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const data = Object.entries(client.spiritsData)
      .filter(([, v]) => v.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .map(([key, value]) => ({
        name: `↪️ ${value.name}`,
        value: key,
      }));
    await interaction.respond(data.slice(0, 25));
  },
};
