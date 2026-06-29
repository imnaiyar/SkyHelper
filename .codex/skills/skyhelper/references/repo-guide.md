# SkyHelper Repo Guide

## Shape

- Root: the repository checkout root, identified by `package.json`, `pnpm-lock.yaml`, and `turbo.json`
- Package manager: `pnpm@10.15.1`
- Monorepo orchestration: Turbo
- Language: TypeScript ESM
- Main bot: `packages/skyhelper`
- Shared constants and locales: `packages/constants`
- Shared utilities and Discord component builders: `packages/utils`
- Jobs service: `packages/jobs`
- Docs and website: `apps/docs`, `apps/website`

## Key Commands

- `pnpm build`: Turbo build for all packages.
- `pnpm test`: Turbo tests with coverage.
- `pnpm lint`: Turbo lint, excluding `@skyhelperbot/website`.
- `pnpm --filter skyhelper build`: Type-check/build the bot package.
- `pnpm --filter skyhelper test`: Run bot Vitest suite.
- `pnpm --filter skyhelper commands:dev`: Register slash commands from source using `packages/skyhelper/.env`.
- `pnpm --filter skyhelper run format`: Prettier on `packages/skyhelper/src`.
- `pnpm check-locales`: Detect unused locale keys.
- `pnpm clean-locales`: Remove unused locale keys; only run when explicitly appropriate.

## Bot Architecture

- The bot uses low-level Discord Core packages, not the high-level `discord.js` client API.
- Client class: `packages/skyhelper/src/bot/structures/Client.ts`
- Command type definitions: `packages/skyhelper/src/bot/structures/Command.d.ts`
- Interaction dispatch: `packages/skyhelper/src/bot/events/INTERACTION_CREATE.ts`
- Message command dispatch: `packages/skyhelper/src/bot/events/MESSAGE_CREATE.ts`
- Command registration: `packages/skyhelper/src/bot/handlers/registerCommands.ts`

## Commands

Command metadata is split from implementations.

- Metadata lives in `packages/skyhelper/src/bot/modules/commands-data/`.
- Slash command implementations live in `packages/skyhelper/src/bot/modules/inputCommands/`.
- Metadata objects are typically typed as `Omit<Command, "interactionRun" | "messageRun">`.
- Implementations expose `interactionRun`, `messageRun`, or both according to `Command.d.ts`.
- When adding command options, update localization keys in `packages/constants/locales/en-US/commands.json` and mirror the shape to other locale files if needed.
- If deployment output changes, inspect `registerCommands.ts` and validate with `pnpm --filter skyhelper commands:dev` when an `.env` is available.

## Localization

- Locale JSON files live in `packages/constants/locales/<locale>/`.
- Common files include `commands.json`, `features.json`, `errors.json`, `common.json`, and `buttons.json`.
- Code calls translation keys like `helper.t("features:calculator.CANDLE")`.
- Command metadata commonly uses string references such as `commands:UTILS.options.TIMESTAMP.name`.
- Keep `en-US` complete and use it as the source shape.
- Avoid changing generated or translated copy broadly unless the task asks for localization work.

## Components and Interactions

- Prefer component builder helpers from `@skyhelperbot/utils`: `container`, `section`, `row`, `textDisplay`, `mediaGallery`, `separator`, and related utilities.
- For Components V2 responses, include `flags: MessageFlags.IsComponentsV2` when editing/sending component-only responses.
- Use `InteractionHelper` helpers for defer, edit, locale-aware translation, user/client access, and modal helpers.
- Use `fallbackResponse` for user-facing validation errors where the surrounding handler pattern already does.
- For modal and component custom IDs, use existing formats only when they are local and simple. Use `client.utils.store.serialize(...)` / `deserialize(...)` for stateful IDs, planner navigation, user isolation, pagination, or action routing.

## Planner Patterns

- Planner display handlers live in `packages/skyhelper/src/bot/handlers/planner/`.
- Shared base: `BasePlannerHandler`.
- Planner display classes usually extend `BasePlannerHandler` and return Discord components from `handle()`.
- Navigation state is serialized into custom IDs; preserve user isolation and back-navigation fields.
- Existing display examples include `home.ts`, `spirits.ts`, `seasons.ts`, `events.ts`, `items.ts`, `profile.ts`, and `friends.ts`.
- Before changing planner behavior, inspect `base.ts`, `constants.ts`, and helper modules under `handlers/planner/helpers/`.

## Data and Domain

- Game constants live in `packages/constants/src/`.
- Spirit and season data live under `packages/constants/src/spirits-datas/`.
- Runtime planner data may come from SkyGame Planner data utilities; inspect existing imports before adding new data sources.
- Time-sensitive Sky game calculations often use Luxon and the exported `zone` constant from `@skyhelperbot/constants`.

## Testing and Review

- Use targeted package checks while iterating.
- Run full `pnpm build` and `pnpm test` for shared packages, public APIs, type definitions, localization structure, or planner-wide changes.
- Lint may auto-fix; review the diff afterward.
- Existing instructions say lint warnings about unused variables can be acceptable, but do not introduce obvious unused imports or dead code.

## Common Gotchas

- This repo is ESM; avoid CommonJS patterns unless the surrounding file already uses them.
- Do not assume high-level `discord.js` classes or builders are available.
- Keep command metadata, implementation, and locale keys synchronized.
- Discord API component limits and custom ID length/state matter; reuse the existing store and paginator utilities.
- Some dev commands require `packages/skyhelper/.env`; if unavailable, say that validation could not be run instead of fabricating results.
