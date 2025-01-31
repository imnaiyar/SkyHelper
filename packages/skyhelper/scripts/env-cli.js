import readline from "node:readline";
import chalk from "chalk";
import fs from "node:fs";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function generateEnvFile() {
  console.log(
    chalk.bold.redBright`\nWelcome to the ${chalk.bold.greenBright`SkyHelper`} Bot setup!\n` +
      `Repository URL: ${chalk.blueBright`https://github.com/imnaiyar/skyhelper\n`}`,
  );
  console.log(
    `Here are some tutorials to get you started:\n${chalk.bold.rgb(47, 163, 148)`• MongoDB connection URL:`} ${chalk.bold.blueBright`https://www.youtube.com/watch?v=nv38zCeFBHg`}\n${chalk.bold.rgb(47, 163, 148)`• Bot Token:`} ${chalk.bold.blueBright`https://www.youtube.com/watch?v=aI4OmIbkJH8`}\n${chalk.bold.rgb(47, 163, 148)`• Webhook URL:`} ${chalk.bold.blueBright`https://www.youtube.com/watch?v=fKksxz2Gdnc`}\n${chalk.bold.rgb(47, 163, 148)`• Sentry DSN:`} ${chalk.blueBright`https://docs.sentry.io/concepts/key-terms/dsn-explainer`}`,
  );
  console.log(
    `Please provide the following information ${chalk.bgMagentaBright.white`(* means required)`} - right click in the console to paste:\n`,
  );

  const envData = {};

  function askDatabaseUrl() {
    rl.question(chalk.bold.cyanBright`Enter your MongoDB connection URL${chalk.red`*`}: `, (dbUrl) => {
      const mongoUrlRegex = /^mongodb\+srv:\/\//;
      if (mongoUrlRegex.test(dbUrl)) {
        envData["MONGO_CONNECTION"] = dbUrl;
        askBotToken();
      } else {
        console.log(chalk.red`ERROR: ` + `Invalid MongoDB URL format. Please enter a valid MongoDB URL. Tutorials are above.`);
        askDatabaseUrl();
      }
    });
  }

  function askBotToken() {
    rl.question(chalk.bold.cyanBright`Enter your bot token${chalk.red`*`}: `, (botToken) => {
      if (botToken.trim().length >= 40) {
        envData["BOT_TOKEN"] = botToken;
        askSentryDSN();
      } else {
        console.log(chalk.red`ERROR: ` + "Invalid bot token. Please enter a valid token. Tutorials are above.");
        askBotToken();
      }
    });
  }

  function askSentryDSN() {
    rl.question(chalk.bold.cyanBright`Enter your Sentry.io DSN${chalk.red`*`}: `, (dsn) => {
      if (/https:\/\/[a-zA-Z0-9]+@o\d+\.ingest\.(?:de\.)?sentry\.io\/\d+/.test(dsn.trim())) {
        envData["SENTRY_DSN"] = dsn;
        askWebhookErrors();
      } else {
        console.log(chalk.red`ERROR: ` + "Invalid Sentry.io DSN. Please enter a valid dsn. Tutorials are above.");
        askSentryDSN();
      }
    });
  }
  rl.prom;
  function askWebhookErrors() {
    rl.question(chalk.bold.cyanBright`Enter the Webhook URL for error logs: [Hit enter to skip]`, (errLogs) => {
      const webhookUrlRegex = /^https:\/\/discord\.com\/api\/webhooks/;
      if (!errLogs?.length) {
        askWebhookJoinLeave();
      } else if (webhookUrlRegex.test(errLogs)) {
        envData["ERROR_LOGS"] = errLogs;
        askWebhookJoinLeave();
      } else {
        console.log(chalk.red`ERROR: ` + "Invalid Webhook URL format. Please enter a valid Webhook URL. Tutorials are above.");
        askWebhookErrors();
      }
    });
  }

  function askWebhookJoinLeave() {
    rl.question(chalk.bold.cyanBright`Enter the Webhook URL for join/leave logs: [Hit enter to skip]`, (joinLeaveLogs) => {
      const webhookUrlRegex = /^https:\/\/discord\.com\/api\/webhooks/;
      if (!joinLeaveLogs?.length) {
        writeEnvFile();
      } else if (webhookUrlRegex.test(joinLeaveLogs)) {
        envData["JOIN_LEAVE_LOGS"] = joinLeaveLogs;
        writeEnvFile();
      } else {
        console.log(chalk.red`ERROR: ` + "Invalid Webhook URL format. Please enter a valid Webhook URL. Tutorials are above.");
        askWebhookJoinLeave();
      }
    });
  }

  function writeEnvFile() {
    fs.writeFileSync(
      ".envs",
      Object.entries(envData)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n"),
    );
    console.log("Setup success!");
    rl.close();
  }

  askDatabaseUrl();
}

generateEnvFile();
