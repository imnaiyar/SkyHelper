const { ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { handleSeasonal, handleRealms, handleEvents } = require("./sub/index");
const { seasonalSpirits, realmsSpirits } = require("./sub/extends/spiritsIndex.js");
const desc = require("@src/cmdDesc");
module.exports = {
  cooldown: 3,
  data: {
    name: "guides",
    description: "various guides",
    longDesc: desc.guides,
    options: [
      {
        name: "seasonal",
        description: "various seasonal guides",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "spirit",
            description: "directly search for a seasonal spirit`s tree/location",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
          },
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      {
        name: "realms",
        description: "various realms guides",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "spirit",
            description: "directly search for a base spirit`s tree/location",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
          },
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      {
        name: "events",
        description: "various event guides (Days of ...)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
    ],
  },
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const spiritValue = interaction.options.getString("spirit");

    const ephmrl = interaction.options.getBoolean("hide");
    const ephemeral = ephmrl !== null ? ephmrl : true;
    if (spiritValue) {
      await handleSpirits(interaction, sub, spiritValue, ephemeral);
      return;
    }
    switch (sub) {
      case "seasonal":
        await handleSeasonal(interaction, ephemeral);
        break;
      case "realms":
        await handleRealms(interaction, ephemeral);
        break;
      case "events":
        await handleEvents(interaction, ephemeral);
        break;
    }
  },
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const sub = interaction.options.getSubcommand();
    if (sub === "seasonal") {
      const spiritNames = Object.keys(seasonalSpirits);
      const filtered = spiritNames
        .filter((choice) => choice.toUpperCase().includes(focusedValue.toUpperCase()))
        .slice(0, 25);
      await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
    } else if (sub === "realms") {
      const spiritNames = Object.keys(realmsSpirits);
      const filtered = spiritNames
        .filter((choice) => choice.toUpperCase().includes(focusedValue.toUpperCase()))
        .slice(0, 25);
      await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
    }
  },
};

async function handleSpirits(interaction, sub, spiritValue, ephemeral) {
  const msg = await interaction.deferReply({ ephemeral: ephemeral, fetchReply: true });
  let index;
  let responses;
  if (sub === "seasonal") {
    responses = require("./sub/extends/seasonal/GuideResponse");
    index = seasonalSpirits;
  } else if (sub === "realms") {
    responses = require("./sub/extends/realms/summaries");
    index = realmsSpirits;
  }

  const getSpirit = (value) => {
    for (const key in index) {
      if (key.toUpperCase() === value.toUpperCase()) {
        return index[key];
      }
    }
  };
  const spirit = getSpirit(spiritValue);
  if (!spirit) {
    return interaction.followUp({
      content: `\`${spiritValue}\` does not exist.\n\nMake sure the spirit name is valid and you provide the full name, like, \`Talented Builder\` (without any extra spaces)`,
      ephemeral: true,
    });
  }

  let tree;
  let location;
  if (Array.isArray(spirit)) {
    tree = spirit[1];
    location = spirit[0];
  } else {
    tree = spirit + "_tree";
    location = spirit + "_location";
  }

  const response = await responses.getResponse(tree);
  const respn = await responses.getResponse(location);
  let disabled;
  if (respn) {
    disabled = false;
  } else {
    disabled = true;
  }
  const lctnBtn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji("<:location:1131173266883612722>")
      .setLabel("Location")
      .setCustomId("sprtLctn")
      .setDisabled(disabled)
      .setStyle("1")
  );
  const treeBtn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji("<:tree:1131279758907424870>")
      .setLabel("Friendship Tree")
      .setCustomId("sprtTree")
      .setStyle("1")
  );
  await interaction.followUp({
    ...response,
    components: [lctnBtn],
  });

  const filter = (i) => {
    if (i.user.id !== interaction.user.id) {
      i.reply({
        content:
          "You can't use the menu generated by others. Run the command </seasonal-guides:1147244751708491897> if you wish to use it.",
        ephemeral: true,
      });
      return false;
    }
    return true;
  };

  const collector = msg.createMessageComponentCollector({
    filter,
    idle: 3 * 60 * 1000,
  });
  collector.on("collect", async (int) => {
    const id = int.customId;
    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setDisabled(true)
        .setCustomId("search")
        .setStyle("1")
        .setEmoji("1205464032182665239")
        .setLabel("Searching")
    );
    await int.update({ components: [btn] });
    if (id === "sprtTree") {
      await int.editReply({
        ...response,
        components: [lctnBtn],
      });
    } else if (id === "sprtLctn") {
      await int.editReply({
        ...respn,
        components: [treeBtn],
      });
    }
  });

  collector.on("end", async () => {
    await msg.edit({
      components: [],
    });
  });
}
