const { shardInfos } = require('@shards/aboutShards');
const { shardLocation } = require('@shards/shardsLocation');
const { shardTimeline } = require('@shards/shardsTimeline');
const { ErrorForm } = require('@handler/functions/errorForm');
const { nextPrev } = require('@shards/sub/scrollFunc');
async function btnHandler(interaction) {
  if (!interaction.isButton()) return;
  const { client } = interaction;
  const Art = await client.users.fetch('504605855539265537');
  const Zhii = await client.users.fetch('650487047160725508');
  const Gale = await client.users.fetch('473761854175576075');
  const Clement = await client.users.fetch('693802004018888714');
  const Christian = await client.users.fetch('594485678625128466');

  if (interaction.customId === 'error_report') {
    await ErrorForm(interaction);
  }
  if (interaction.customId === 'next' || interaction.customId === 'prev') {
    const value = interaction.customId;
    await nextPrev(interaction, value);
  }
  if (interaction.customId.startsWith('timeline')) {
    shardTimeline(interaction, Zhii, Christian);
  }
  if (interaction.customId.startsWith('location')) {
    shardLocation(interaction, Gale, Clement);
  }
  if (interaction.customId.startsWith('about')) {
    shardInfos(interaction, Art);
  }
}

module.exports = { btnHandler };
