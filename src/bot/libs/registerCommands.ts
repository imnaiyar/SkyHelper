import { REST, Routes, type RESTPutAPIApplicationCommandsResult } from "discord.js";
import { loadCommands, loadContextCmd } from "../utils/loaders.js";
import logger from "#handlers/logger";
import chalk from "chalk";
import { parseCommands } from "#bot/utils/parseCommands";

const commands = await loadCommands();
const contexts = await loadContextCmd();
const toRegister: Record<string, any>[] = [];

const rest = new REST().setToken(process.env.TOKEN);

// Filter slash commands
commands
  .filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && !cmd.slash?.guilds)
  .map((cmd) => parseCommands(cmd))
  .forEach((s) => toRegister.push(s));

// Filter context menu commands
contexts
  .filter((cmd) => !cmd.data.guilds)
  .map((cmd) => parseCommands(cmd))
  .forEach((s) => toRegister.push(s));
if (!process.env.CLIENT_ID) throw new Error("Cliend ID is missing from env");
const data = (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
  body: toRegister,
})) as RESTPutAPIApplicationCommandsResult;

logger.success(`Successfully registered ${data.length} interactions`);

// Attempt to register any guild commands
const guilCommandsSlash = commands.filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && cmd.slash?.guilds);
const guilCommandsContext = contexts.filter((cmd) => cmd.data.guilds);
const guildCommands = [...guilCommandsSlash.values(), ...guilCommandsContext.values()];
if (guildCommands.length) {
  console.log(chalk.blueBright("\n\n<------------ Attempting to register guild commands ----------->\n"));
  await Promise.all(
    guildCommands.map(async (cmd) => {
      const guilds = "description" in cmd ? cmd.slash?.guilds! : cmd.data.guilds!;
      for (const guild of guilds) {
        await rest.post(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guild), {
          body: parseCommands(cmd),
        });
        logger.custom(`Successfully registered "${cmd.name} "in ${guild}`, "GUILD COMMANDS");
      }
    }),
  );
}
