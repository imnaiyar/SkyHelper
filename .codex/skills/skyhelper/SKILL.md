---
name: skyhelper
description: "Work in the SkyHelper TypeScript monorepo for Sky: Children of the Light Discord bot tasks. Use when editing, reviewing, debugging, or explaining code from the repository root, especially bot commands, handlers, planner displays, localization JSON, constants data, jobs, shared utils, build/test/lint workflows, or Discord API component interactions."
---

# SkyHelper

Use this skill for repo-specific SkyHelper work. Start by reading the relevant files in the workspace, then follow the existing TypeScript, Discord Core, i18n, and component-builder patterns.

## Workflow

1. Work from the repository root, identified by `package.json`, `pnpm-lock.yaml`, and `turbo.json`.
2. Read `references/repo-guide.md` when you need repo layout, validation commands, command conventions, localization paths, planner patterns, or common gotchas.
3. Prefer `rg`/`rg --files` for navigation. Inspect neighboring handlers before adding new patterns.
4. Keep edits scoped to the requested package and preserve unrelated user changes.
5. Validate with the narrowest useful command first, then broader checks when the change affects shared behavior.

## Default Commands

- Install: `pnpm install --frozen-lockfile`
- Build all: `pnpm build`
- Test all: `pnpm test`
- Lint all except website: `pnpm lint`
- Bot dev: `pnpm bot:dev`
- Bot command registration in dev: `pnpm --filter skyhelper commands:dev`
- Bot format: `pnpm --filter skyhelper run format`

Set long enough timeouts: install can take about 45 seconds, tests about 30 seconds, and build about 15 seconds.

## Coding Rules

- Use pnpm workspace filters instead of `npm` or direct package-manager swaps.
- Use existing path aliases such as `@/` inside `packages/skyhelper/src`.
- Use `discord-api-types` / `@discordjs/core` types and the repo's component builders from `@skyhelperbot/utils`.
- Add or update locale keys in `packages/constants/locales/<lang>/...`; keep `en-US` as the source shape.
- For Discord custom IDs, prefer the existing store serialization helpers where state or user isolation matters.
- For command metadata, update the matching file under `packages/skyhelper/src/bot/modules/commands-data/` and the command implementation under `packages/skyhelper/src/bot/modules/inputCommands/`.

## Validation

For code-only bot changes, usually run:

```bash
pnpm --filter skyhelper build
pnpm --filter skyhelper test
```

For constants, utils, or cross-package changes, run:

```bash
pnpm build
pnpm test
```

For locale edits, also consider:

```bash
pnpm check-locales
```
