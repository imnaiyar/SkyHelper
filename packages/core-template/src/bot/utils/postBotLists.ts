import type { SkyHelper } from "@/structures/Client";

/** Post DBL and TopGG Stats */
export async function postBotListStats(client: SkyHelper) {
  const [topgg, dbl] = ["https://discordbotlist.com/api/v1", "https://top.gg/api"];
  const guilds = client.guilds.size;
  const users = client.guilds.reduce((total, guild) => total + guild.member_count, 0);
  const [TopGGToken, DBLToken] = [process.env.TOPGG_TOKEN, process.env.DBL_TOKEN];
  if (TopGGToken) await post(topgg, TopGGToken, { server_count: guilds, shard_count: 1 }, client);
  if (DBLToken) await post(dbl, DBLToken, { guilds, users }, client);
}

async function post(endpoint: string, token: string, stats: Record<string, number>, client: SkyHelper) {
  const response = await fetch(`${endpoint}/bots/${client.user.id}/stats`, {
    method: "POST",
    body: JSON.stringify(stats),
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  if (!response.ok) {
    client.logger.error(`Error Discord Bots: ${response.status}: ${response.statusText}`);
    return response.text();
  }

  return response.json();
}
