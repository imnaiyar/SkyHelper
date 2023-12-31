const fetch = require('node-fetch');

module.exports = async (client) => {
  await fetch(
    `https://discordbotlist.com/api/v1/bots/${client.user.id}/stats`,
    {
      method: 'POST',
      body: JSON.stringify({
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce(
          (total, guild) => total + guild.memberCount,
          0,
        ),
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${process.env.DBL_TOKEN}`,
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        console.log(
          `Error Discord Bots: ${response.status}: ${response.statusText}`,
        );
        return response.text();
      }
      return response.json();
    })
    .catch((error) => console.log(error));
};
