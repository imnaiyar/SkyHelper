import { getUser } from "@/schemas/UserSchema";
import type { APIUser } from "@discordjs/core";

export async function updateUserGameStats(
  user: APIUser,
  game: "hangman" | "scrambled",
  mode: "singleMode" | "doubleMode",
  won?: boolean,
) {
  const userSchema = await getUser(user);
  if (!userSchema) return;

  if (!userSchema[game]) {
    userSchema[game] = { singleMode: { gamesPlayed: 0, gamesWon: 0 }, doubleMode: { gamesPlayed: 0, gamesWon: 0 } };
  }

  const gameMode = userSchema[game][mode];
  gameMode.gamesPlayed++;
  if (won) gameMode.gamesWon++;

  await userSchema.save();
}
