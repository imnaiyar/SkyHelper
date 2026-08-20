# SkyHelper Jobs

This is an add-on plugin that goes along with [SkyHelper](../skyhelper/) bot, that schedules and executes cron jobs related to the bot's functionalities, such as reminders and live updates. This plugin ensures the bot can handle scheduled tasks seamlessly and on different process than bot's so it doesn't interfere with it's performance.

## Why this?

Running cron jobs is not resources exhaustive itself, but sending reminders/live updates for multiple servers, that too with intervals as little as 2 minutes, with multiple api calls, and stuff can get the process clogged up. This was getting in the way of main functionalities of the bot. My solution was to separate jobs into a different process, hence this repository. There are other advantages to this, like, any downtimes or updates to the bot would not affect the reminders and will run as usual.

> [!NOTE]  
> If your instance of the bot does not have any live updates/reminders set up, then you do not need to concern yourself with running this project

## Running the project

### Requirements

- Bun

### Running

- Clone the repo and move to this directory

```bash
git clone https://github.com/imnaiyar/skyhelper
cd packages/jobs
```

- Copy `.env.example` to `.env` and fill the required values.

> [!IMPORTANT]  
> Make sure the bot token and Mongo connection URL match the values used by the main bot.

- Start the jobs process in development with `pnpm dev`.
- Start the jobs process in production with `pnpm start`.

## When to run this

Run this package alongside [@skyhelperbot/skyhelper](../skyhelper/) whenever you want reminders, live updates, or other scheduled tasks to continue independently from the bot process.

## Docker

If you prefer Docker, use the root `docker compose` workflow instead of running this package directly. The compose service is named `jobs`.

> [!WARNING]  
> TODO: Lot's of the codes are cloned/duplicated from the main bot, find a way to effectively reuse it and reduce duplications

License: MIT
