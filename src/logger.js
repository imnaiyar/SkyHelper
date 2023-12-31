const { EmbedBuilder, WebhookClient } = require('discord.js');
const pino = require('pino');

const webhookLogger = process.env.ERROR_LOGS
  ? new WebhookClient({ url: process.env.ERROR_LOGS })
  : undefined;

const pinoLogger = pino.default(
  {
    level: 'debug',
  },
  pino.multistream([
    {
      level: 'info',
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:mm:ss',
          ignore: 'pid,hostname',
          singleLine: false,
          hideObject: false,
          customColors: 'info:green,warn:yellow,error:red,message:white,',
        },
      }),
    },
    {
      level: 'debug',
      stream: pino.destination({
        dest: `${process.cwd()}/logs/combined-${new Date().getFullYear()}.${
          new Date().getMonth() + 1
        }.${new Date().getDate()}.log`,
        sync: true,
      }),
    },
  ]),
);

function sendWebhook(content, err) {
  if (!content && !err) return;
  const errString = err?.stack || err;

  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setAuthor({ name: err?.name || 'Error' });

  if (errString)
    embed.setDescription(
      '```js\n' +
        (errString.length > 4096
          ? `${errString.substr(0, 4000)}...`
          : errString) +
        '\n```',
    );

  if (
    errString ===
    `DiscordAPIError[50001]: Missing Access
  at SequentialHandler.runRequest (/home/container/node_modules/@discordjs/rest/dist/index.js:933:15)
  at processTicksAndRejections (node:internal/process/task_queues:96:5)
  at async SequentialHandler.queueRequest (/home/container/node_modules/@discordjs/rest/dist/index.js:712:14)
  at async REST.request (/home/container/node_modules/@discordjs/rest/dist/index.js:1321:22)
  at async TextChannel.send (/home/container/node_modules/discord.js/src/structures/interfaces/TextBasedChannel.js:176:15)`
  )
    console.log('Missing Access');

  embed.addFields({
    name: 'Description',
    value: `${content || err?.message || 'NA'}`,
  });
  webhookLogger.send({ username: 'Logs', embeds: [embed] }).catch((ex) => {});
}

module.exports = class Logger {
  /**
   * @param {string} content
   */
  static success(content) {
    pinoLogger.info(content);
  }

  /**
   * @param {string} content
   */
  static log(content) {
    pinoLogger.info(content);
  }

  /**
   * @param {string} content
   */
  static warn(content) {
    pinoLogger.warn(content);
  }

  /**
   * @param {string} content
   * @param {object} ex
   */
  static error(content, ex) {
    if (ex) {
      pinoLogger.error(ex, `${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content);
    }
    if (webhookLogger) sendWebhook(content, ex);
  }

  /**
   * @param {string} content
   */
  static debug(content) {
    pinoLogger.debug(content);
  }
};
