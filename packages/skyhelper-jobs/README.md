# SkyHelper Jobs

This is an add-on plugin that goes along with [SkyHelper](https://github.com/imnaiyar/SkyHelper) bot, that schedules and executes cron jobs related to the bot's functionalities, such as reminders and live updates. This plugin ensures the bot can handle scheduled tasks seamlessly and on different process than bot's so it doesn't interfere with it's performance.

## Why this?

Running cron jobs is not resources exhaustive itself, but sending reminders/live updates for multiple servers, that too with intervals as little as 2 minutes, with multiple api calls, and stuff can get the process clogged up. This was getting in the way of main functionalities of the bot. My solution was to separate jobs into a different process, hence this repository. There are other advantages to this, like, any downtimes or updates to the bot would not affect the reminders and will run as usual.

> [!NOTE]  
> If your instance of the bot does not have any live updates/reminders set up, then you do not need to concern yourself with running this project

## Runing the project

- Clone the repo and install dependencies

```bash
git clone https://github.com/imnaiyar/skyhelper-jobs
bun install # or npm or yarn  or pnpm
```

- Make sure to rename `.env.example` and fill the required values.

> [!IMPORTANT]  
> Make sure that bot token and Mongo connection url is the same as the one you used to run the main bot

- Start the project by running `bun run start:bun` (use `start` script if you are not using bun)

> [!WARNING]  
> TODO: Lot's of the codes are cloned/duplicated from the main bot, find a way to effectively reuse it and reduce duplications

License: MIT
