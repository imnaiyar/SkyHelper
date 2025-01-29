<h1 align="center">
  <br>
  <a href="https://github.com/imnaiyar/SkyHelper"><img src="https://skyhelper.xyz/assets/img/boticon.png" height="200" alt="SkyHelper"></a>
  <br>
  SkyHelper
  <br>
</h1>

<p align="center">A Sky CotL Discord Bot</p>
<p align="center"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt=""/> <br />
 <img src="https://img.shields.io/github/stars/imnaiyar/SkyHelper" alt="Stars"/> <img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/imnaiyar/SkyHelper"> <img alt="GitHub License" src="https://img.shields.io/github/license/imnaiyar/SkyHelper">
 <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/imnaiyar/SkyHelper/discord.js?filename=packages/skyhelper/package.json">
 </p>
<br>

<p align="center">
  <a href="https://skyhelper.xyz">Website</a>
  •
  <a href="https://dash.skyhelper.xyz">Dashboard</a>
  •
  <a href="https://skyhelper.xyz/invite">Invite</a>
  •
  <a href="https://skyhelper.xyz/vote">Vote</a>
  •
  <a href="https://docs.skyhelper.xyz">Docs</a>
  •
  <a href="https://discord.com/invite/2rjCRKZsBb">Support Server</a>
</p>

<br>

### Features

- 🌋 Shards
- 🗓 Shards calendar
- 🧮 Seasonal currency calculator
- 🕑 In-game events times and countdowns
- ⏰️ Reminders (Geyser, Grandma, etc...)
- 🟢 Live Updates
- 🈯️ Supports mulitple language ([help us](https://docs.skyhelper.xyz/pages/translating) support more)
- [and much more...](https://docs.skyhelper.xyz/commands)

## Running the bot

### Requirements

- Docker
- Node.js >v23

### Running

- Clone this repository by running

```js
git clone https://github.com/imnaiyar/SkyHelper
```

- Move to this directory `cd packages/skyhelper`
- Rename `example.env` to `.env` and fill all the required fields. (We have CLI to streamline this process. Run `pnpm run setup` and it'll setup the .env file for you)
- Run `docker compose up -d --build`

> [!IMPORTANT]
> If you plan to use live updates/Reminders feature, you'll have to also host/run [@skyhelperbot/jobs](../jobs/) as cron jobs to send the reminders/updates are hosted on a different process to reduce the load on the main bot. Intructions to set it up is given on the repo's README

## Dashboard

Only backend is hosted with the bot, front-end is a closed-source, unless you can build your own front-end, it's better if you disable it before running the bot
`src > config.ts`

```js
DASHBOARD: {
  enabled: false,
  ...//
}
```

> [!NOTE]
> There are other benifits of having the api besides the dashboard, such as recieving updates when someone installs the bot to their user account. If you want such features, then you can keep the api running

### Endpoints

Endpoints available for the dashboards are:-

#### `GET /guilds/{guild}`

Get guild info (`dashboard > types.ts > GuildInfo`)  
Respond 404 or null if bot hasn't joined the guild

#### `GET /guilds/{guild}/features/{feature}`

Get Feature options (`dashboard > types.ts`)
Respond 404 if not enabled

#### `PATCH /guilds/{guild}/features/{feature}`

Update feature options
With custom body (defined in `dashboard > types.ts > Features[K]`)
Respond updated feature options

#### `POST /guilds/{guild}/features/{feature}`

Enable a feature

#### `DELETE /guilds/{guild}/features/{feature}`

Disable a feature

#### `GET /guilds/{guild}/roles`

Get Roles of the guild
Responds a list of Role Object (Same as discord documentation)

#### `GET /guilds/{guild}/channels`

Get Channels of the guild
Responds a list of Guild Channel (Same as discord documentation)

<h6 align="center">This bot is not affiliated with Sky: Children of the Light or thatgamecompany<h6>
