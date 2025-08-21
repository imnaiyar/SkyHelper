# SkyHelper Discord Bot - Developer Guide

**ALWAYS follow these instructions first.** Only fallback to additional search and context gathering if the information here is incomplete or found to be in error.

SkyHelper is a TypeScript-based Discord bot for Sky: Children of the Light, built as a monorepo using pnpm workspaces and Turbo for build orchestration. The repository includes the main bot, scheduled jobs, documentation, and shared utilities.

## Working Effectively

### Essential Setup Commands

Run these commands in order to set up a working development environment:

1. **Install pnpm globally** (if not already installed):

   ```bash
   npm install -g pnpm@9.4.0
   ```

2. **Install dependencies** - NEVER CANCEL, takes ~45 seconds:

   ```bash
   pnpm install --frozen-lockfile
   ```

   Set timeout to 120+ seconds. This command is critical and must complete successfully.

3. **Build all packages** - NEVER CANCEL, takes ~12 seconds:

   ```bash
   pnpm build
   ```

   Set timeout to 60+ seconds. Build excludes documentation by default.

4. **Run tests** - NEVER CANCEL, takes ~29 seconds:

   ```bash
   pnpm test
   ```

   Set timeout to 60+ seconds. Tests include coverage reporting.

5. **Run linting** - NEVER CANCEL, takes ~6 seconds:
   ```bash
   pnpm lint
   ```
   Set timeout to 30+ seconds. May show warnings about unused variables (acceptable).

### Development Servers

**Main Bot Development:**

```bash
cd packages/skyhelper && pnpm dev
```

**Jobs Service Development:**

```bash
cd packages/jobs && pnpm dev
```

## Validation Requirements

### Build Validation

ALWAYS run these commands after making changes:

1. `pnpm build` - Ensure TypeScript compilation succeeds
2. `pnpm test` - Verify tests pass (79 tests expected)
3. `pnpm lint` - Check code style (warnings about unused imports are acceptable)

### Code Quality Commands

Before committing changes, ALWAYS run:

```bash
pnpm --filter skyhelper run format
pnpm lint
```

### Manual Testing Scenarios

After making changes, perform these validation steps:

**For Bot Code Changes:**

1. Ensure build succeeds: `pnpm build`
2. Run tests: `pnpm test`
3. If making command changes, verify with: `cd packages/skyhelper && pnpm commands:dev`

**For Shared Utilities Changes:**

1. Run full test suite: `pnpm test`
2. Build all dependent packages: `pnpm build`

## Repository Structure

### Key Packages

- **packages/skyhelper/** - Main Discord bot application
- **packages/jobs/** - Cron job scheduler for reminders/updates
- **packages/constants/** - Shared data constants (spirits, realms, localizations)
- **packages/utils/** - Shared utility functions
- **apps/docs/** - Next.js documentation website

### Important Files

- **package.json** - Root workspace configuration
- **turbo.json** - Build pipeline configuration
- **docker-compose.yml** - Production deployment setup
- **packages/skyhelper/.env.example** - Environment variable template

### Common File Locations

- **Commands:** packages/skyhelper/src/bot/modules/inputCommands/
- **Event Handlers:** packages/skyhelper/src/bot/events/
- **API Controllers:** packages/skyhelper/src/api/controllers/
- **Database Schemas:** packages/skyhelper/src/bot/schemas/
- **Tests:** packages/skyhelper/**tests**/
- **Localization:** packages/constants/src/locales/

## Build System Details

### Timing Expectations (NEVER CANCEL)

- **First-time Dependency Installation:** ~45 seconds, set timeout to 120+ seconds
- **Subsequent Dependency Install:** ~1-2 seconds (when lockfile unchanged)
- **First Build:** ~12 seconds, set timeout to 60+ seconds
- **Cached Builds:** ~1-2 seconds (with Turbo cache)
- **Test Suite:** ~29 seconds first run, ~1-2 seconds cached, set timeout to 60+ seconds
- **Linting:** ~6 seconds first run, ~1-2 seconds cached, set timeout to 30+ seconds

### Turbo Commands

The repository uses Turbo for efficient builds:

- `pnpm build` - Builds all packages except docs
- `pnpm build:affected` - Builds only changed packages (requires proper git setup with origin/main)
- `pnpm test:affected` - Tests only affected packages (requires proper git setup)
- `pnpm lint:affected` - Lints only affected packages (requires proper git setup)

**Note:** Affected commands work in CI/CD but may fail in local environments without proper git remote setup.

### Docker Deployment

For production testing:

```bash
docker compose up -d --build skyhelper
```

Builds and runs the main bot in container.

## Common Issues and Solutions

### Build Failures

- **TypeScript errors:** Run `pnpm build` to see specific compilation errors
- **Missing dependencies:** Run `pnpm install --frozen-lockfile`
- **Workspace issues:** Verify you're in the correct package directory
- **Path resolution errors:** Ensure you're running commands from the package root, not the dist folder

### Environment Setup

- **Bot won't start:** Copy `.env.example` to `.env` in packages/skyhelper and fill required fields (manual setup required)
- **Database connection:** Requires valid MongoDB connection string (manual configuration)
- **Discord tokens:** Requires bot token and client ID from Discord Developer Portal (manual setup)
- **Development dependencies missing:** Run `pnpm install` if tsx or other dev tools are not found

### Testing Issues

- **Jest warnings:** VM modules warnings are expected and safe to ignore
- **Coverage reports:** Located in packages/skyhelper/coverage/
- **Worker process warnings:** Normal for Jest in this configuration
- **TypeScript version warnings:** ESLint warnings about TypeScript version are safe to ignore

### Development Server Issues

- **Bot fails to start:** Requires proper .env configuration with valid tokens (manual setup required)
- **Module resolution errors:** Ensure building from source, not running compiled JS directly
- **Missing environment variables:** Use the setup CLI: `cd packages/skyhelper && pnpm setup` (manual setup required)

## CI/CD Integration

### GitHub Workflows

- **.github/workflows/test.yml** - Runs linting and tests on PR
- **.github/workflows/check-build.yml** - Validates build process
- Both workflows use affected builds for efficiency

### Git Hooks and Commit Standards

This repository uses git hooks to enforce code quality and commit message standards:

**Commit Message Format:**
All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**PR Title Format:**
PR titles opened by copilot must also follow the same conventional commit format:

```
<type>(<scope>): <description>
```

**Note:** The scope is optional and should be included in parentheses when the change affects a specific area of the codebase.

**Allowed commit types** (defined in `.commitlintrc.json`):
- `feat` - New features
- `fix` - Bug fixes  
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build process or auxiliary tool changes
- `ci` - CI/CD changes
- `perf` - Performance improvements
- `revert` - Revert previous commits

**Git Hooks (configured via Husky):**

1. **Pre-commit hook** - Automatically runs before each commit:
   - Formats all files with Prettier (`prettier --ignore-unknown --write`)
   - Runs ESLint with auto-fix on JS/TS files in `src/` and `__tests__/` directories
   - Configured in `.lintstagedrc.json`

2. **Commit-msg hook** - Validates commit message format:
   - Runs `commitlint` to ensure messages follow conventional commit format
   - Rejects commits with invalid message format
   - Configured in `.commitlintrc.json`

**Example valid commit messages:**
```bash
feat: add new spirit calendar view
feat(api): add user authentication endpoint
fix: resolve memory leak in event handlers
fix(bot): resolve Discord API rate limiting
docs: update installation instructions
docs(readme): add development environment setup
refactor: simplify user authentication logic
refactor(utils): optimize image processing functions
```

**Example valid PR titles:**
```bash
feat: add comprehensive event scheduling system
feat(scheduler): add comprehensive event scheduling system
fix: resolve Discord API rate limiting issues
fix(api): resolve Discord API rate limiting issues
docs: add comprehensive Copilot instructions
docs(github): add comprehensive Copilot instructions
refactor: optimize database query performance
refactor(db): optimize database query performance
```

### Pre-commit Validation

The git hooks handle most validation automatically, but you can also run manually:

```bash
pnpm lint
pnpm test
```

## Development Tips

### Efficient Commands

- Use `pnpm --filter <package>` to run commands in specific packages
- Use `turbo` for affected builds when working on multiple packages
- Use `pnpm dev` from root to start development mode for multiple services

### Code Style

- Prettier configuration is already set up
- ESLint rules enforce consistent code style
- Unused import warnings in linting are acceptable (marked as TODO items)

### Environment Variables

Required for bot development (manual setup required):

- `TOKEN` - Discord bot token
- `MONGO_CONNECTION` - MongoDB connection string
- `CLIENT_ID` - Discord application client ID
- `PUBLIC_KEY` - Discord application public key
- `SENTRY_DSN` - Error tracking (optional for development)

Optional for full features (manual setup required):

- Various webhook URLs for logging
- Bot list tokens for publishing statistics

## Package-Specific Notes

### skyhelper (Main Bot)

- Uses NestJS for API server
- Discord.js Core for bot functionality
- Mongoose for MongoDB integration
- Sentry for error tracking

### jobs (Scheduler)

- Uses Bun runtime for execution
- Node-cron for scheduling
- Shared database with main bot

### docs (Documentation)

- Next.js with Nextra theme
- React components for interactive elements
- Builds independently from main packages

### constants (Data)

- TypeScript-only package
- Contains game data, localizations
- No runtime dependencies

### utils (Utilities)

- Shared functions across packages
- Canvas operations for image generation
- Discord API utilities
