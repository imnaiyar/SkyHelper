import { loadCommands, loadContextCmd } from "@/utils/loaders";
import logger from "./logger.js";
import chalk from "chalk";
import { parseCommands } from "@/utils/parseCommands";
import { Routes, type RESTPutAPIApplicationCommandsJSONBody, type RESTPutAPIApplicationCommandsResult } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import fs from "fs";
const commands = await loadCommands();
const contexts = await loadContextCmd();
const toRegister: RESTPutAPIApplicationCommandsJSONBody = [];

const rest = new REST().setToken(process.env.TOKEN);

// Filter slash commands
commands
  .filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && !cmd.data?.guilds)
  .map((cmd) => parseCommands(cmd))
  .forEach((s) => toRegister.push(s));

// Filter context menu commands
contexts
  .filter((cmd) => !cmd.data.guilds)
  .map((cmd) => parseCommands(cmd))
  .forEach((s) => toRegister.push(s));

if (!process.env.CLIENT_ID) throw new Error("Cliend ID is missing from env");
fs.writeFileSync("commands.json", JSON.stringify(toRegister, null, 2));
const data = (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
  body: toRegister,
})) as RESTPutAPIApplicationCommandsResult;

logger.success(`Successfully registered ${data.length} interactions`);

// Attempt to register any guild commands
const guilCommandsSlash = commands.filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && cmd.data?.guilds);
const guilCommandsContext = contexts.filter((cmd) => cmd.data.guilds);
const guildCommands = [...guilCommandsSlash.values(), ...guilCommandsContext.values()];
if (!guildCommands.length) process.exit(0);

console.log(chalk.blueBright("\n\n<------------ Attempting to register guild commands ----------->\n"));
const guildCommandsMap = new Collection<string, RESTPutAPIApplicationCommandsJSONBody>();

// Group guild commands by guild
for (const cmd of guildCommands) {
  const guilds = cmd.data?.guilds;

  if (!guilds) continue;
  for (const guild of guilds) {
    const cmds = guildCommandsMap.get(guild) ?? [];
    cmds.push(parseCommands(cmd));
    guildCommandsMap.set(guild, cmds);
  }
}
await Promise.all(
  guildCommandsMap.map(async (cmds, guildID) => {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID), {
      body: cmds,
    });
    logger.custom(`Successfully registered [${cmds.map((c) => c.name).join(", ")}] in ${guildID}`, "GUILD COMMANDS");
  }),
);
