<h1 align="center">
  <br>
  <a href="https://github.com/imnaiyar/SkyHelper"><img src="https://skyhelper.xyz/assets/img/boticon.png" height="200" alt="SkyHelper"></a>
  <br>
  SkyHelper
  <br>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/imnaiyar/SkyHelper" alt="Stars"/>
  <img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/imnaiyar/SkyHelper">
  <img alt="GitHub License" src="https://img.shields.io/github/license/imnaiyar/SkyHelper">
  <a href="https://github.com/imnaiyar/skyhelper/actions"><img src="https://github.com/imnaiyar/skyhelper/actions/workflows/test.yml/badge.svg" alt="Tests status" /></a>
  <a href="https://crowdin.com/project/skyhelper"><img src="https://badges.crowdin.net/skyhelper/localized.svg" alt="Localisation" /></a>
</p>

<p align="center">
  <a href="https://skyhelper.xyz">Website</a>
  •
  <a href="https://dash.skyhelper.xyz">Dashboard</a>
  •
  <a href="https://skyhelper.xyz/invite">Invite Bot</a>
  •
  <a href="https://skyhelper.xyz/vote">Vote</a>
  •
  <a href="https://docs.skyhelper.xyz">Documentation</a>
  •
  <a href="https://discord.com/invite/2rjCRKZsBb">Support Server</a>
</p>

---

## About SkyHelper

SkyHelper is a comprehensive Discord bot designed specifically for the Sky: Children of the Light community. It provides essential tools and information to enhance your Sky experience, from tracking daily events to managing spirit guides and seasonal content.

### Key Features

- **Event Tracking**: Stay updated with daily quests, seasonal events, and special occasions
- **Spirit Information**: Comprehensive database of all spirits, their locations, and cosmetics
- **Shards Calendar**: Never miss a shard event with automated reminders
- **Multi-language Support**: Available in multiple languages thanks to our amazing community
- **Real-time Updates**: Get instant notifications for game events and updates
- **Interactive Commands**: Rich embeds and user-friendly slash commands
- **Planner**: Plan and track your sky progress.
- and much more...

## Project Structure

This monorepo contains all components of the SkyHelper ecosystem:

```
skyhelper/
├── packages/
│   ├── skyhelper/          # Main Discord bot application
│   ├── jobs/               # Scheduled tasks and reminders
│   ├── utils/              # Shared utility functions
│   └── constants/          # Game data, localizations, and constants
├── apps/
│   └──  docs/              # Documentation website
|   └──  website/           # Website and dashboard for the skyhelper bot
├──  docker-compose.yml     # Production deployment
└── Configuration files
```

### Package Details

- **[skyhelper](packages/skyhelper/)**
- **[jobs](packages/jobs/)**
- **[utils](packages/utils/)**
- **[constants](packages/constants/)**
- **[docs](apps/docs/)**
- **[website](apps/website/)**

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 9.4.0+
- **MongoDB** database (local or cloud)
- **Discord Bot Token** ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/imnaiyar/SkyHelper.git
   cd SkyHelper
   ```

2. **Install dependencies**

   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Build all packages**

   ```bash
   pnpm build
   ```

4. **Configure environment**

   ```bash
   cp packages/skyhelper/.env.example packages/skyhelper/.env
   # Edit .env with your Discord token, MongoDB URI, etc.
   ```

5. **Run the bot**

   ```bash
   # Development mode
   pnpm bot:dev

   # Production mode
   pnpm bot
   ```

### Docker Deployment (Recommended)

For production deployment, use Docker Compose:

```bash
# Deploy both bot and jobs
docker compose up -d --build

# Deploy only the bot
docker compose up -d --build skyhelper

# Deploy only scheduled jobs
docker compose up -d --build jobs
```

## Development

### Development Workflow

```bash
# Install dependencies (required first time)
pnpm install --frozen-lockfile

# Start development servers
pnpm dev                    # All services
pnpm bot:dev               # Bot only
pnpm jobs:dev              # Jobs only

# Building and testing
pnpm build                 # Build all packages
pnpm test                  # Run test suite
pnpm lint                  # Code linting
```

### Code Quality

This project maintains high code quality through:

- **TypeScript** for type safety
- **ESLint** for code consistency
- **Prettier** for formatting
- **Jest** for testing
- **Husky** for git hooks
- **Conventional Commits** for clear commit messages

## Contributing

We welcome contributions from the Sky community! Here's how to get started:

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Install** dependencies: `pnpm install --frozen-lockfile`
4. **Build** the project: `pnpm build`
5. **Make** your changes
6. **Test** your changes: `pnpm test`
7. **Lint** your code: `pnpm lint`
8. **Commit** using conventional commits: `git commit -m "feat: add amazing feature"`
9. **Push** to your branch: `git push origin feat/amazing-feature`
10. **Create** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new spirit information command
fix: resolve memory leak in event handlers
docs: update installation instructions
refactor: optimize database queries
```

## License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

# Planner

Planner uses data from [Sky Planner](https://sky-planner.com) by Silverfeelin and is inspired by it.

## Shard Predictions

Special thanks to the dedicated community members who help provide accurate shard predictions:

- **Zhii** (zhiiran4275)
- **Christian** (christiankingfu)
- **Hucker** (hucker\_)
- **Plutoy** (plutoy)
- **Kion** (kion_anzu)
- **LN** (ln.cookie)
- **Gale** (galerowfylery)
- **Stoat** (.stoat.)

## Seasonal and Other Guides

Thanks to the content creators and guide makers who provide valuable resources:

- **Clement** (clement8978)
- **Mimi** (mimi4117)
- **Sam** (sam6917)
- **Zed** (zedlocked\_)
- **Art** (lovecry)
- **io** - Daily quest guides
- **And all others who do the awesome job of creating guides**

  Many of SkyHelper's guide features are powered by the incredible infographics and guides created by these community
  contributors.

---

<p align="center">
  Made with ❤️ for the Sky: Children of the Light community
</p>
