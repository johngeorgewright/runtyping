# Project Guidelines

## Overview

runtyping generates runtime validation code from static TypeScript types and JSON Schema. It's a Yarn workspaces monorepo with a core `generator` package and multiple **type-writer** packages (zod, zod-mini, runtypes, io-ts, valibot, yup).

## Architecture

- **`@runtyping/generator`** — Core engine. `Generator` reads TS types via `ts-morph`, walks the AST, and delegates code emission to a `TypeWriters` subclass. `TypeWriter` is a generator function yielding `[Symbol, payload]` tuples (`Write`, `Import`, `DeclareAndUse`, `Static`, etc.).
- **Type-writer packages** (`packages/zod`, `packages/runtypes`, etc.) — Each extends `TypeWriters` (or a shared base like `ZodCoreTypeWriters`) and provides library-specific code emission. Each also re-exports a `Generator` and CLI entry point.
- **`@runtyping/zod-core`** — Shared logic between `@runtyping/zod` and `@runtyping/zod-mini`.
- **`@runtyping/test-type-writers`** — Shared test harness. The `testTypeWriters()` function runs snapshot-based fixture tests against any type-writer. Fixture sources live in `packages/test-type-writers/fixtures/`.
- **`scaffold/`** — Plop templates for bootstrapping new type-writer packages (`yarn scaffold`).

## Build and Test

```bash
yarn              # Install all dependencies
yarn build        # Build all packages (topological order)
yarn test         # Run all tests (vitest)

# Single package
cd packages/zod && yarn test
```

- **TypeScript 6**, **Vitest**, **ESM** (`"type": "module"` everywhere).
- Each package builds with `tsc` and tests with `vitest run`.
- CI tests on Node.js 20, 22, 24, and 25.

## Conventions

- **Conventional Commits** — `feat(zod):`, `fix(generator):`, etc. Enforced by commitlint + husky. See [CONTRIBUTING.md](../CONTRIBUTING.md#commit-guidelines).
- **Prettier** for formatting (runs via lint-staged on commit). No separate ESLint config.
- **Snapshot tests** — Type-writer tests compare generated output against snapshots. Update with `vitest run --update`.
- **Fixture-driven testing** — Each type-writer's `test/typewriters.test.ts` calls `testTypeWriters()` with library-specific validators. Fixture data files in `packages/test-type-writers/fixtures/data/` define expected shapes; source files in `fixtures/source/` define input types.
- **New packages** — Use `yarn scaffold` (Plop), never create manually.
- **Release** — Automated via release-please. Merging to `master` triggers versioning and npm publish.

## Adding a New Type Writer

1. Run `yarn scaffold` and follow prompts.
2. Implement a class extending `TypeWriters` (see existing packages for pattern).
3. Wire up `cli.ts`, `Generator.ts`, and re-export from `index.ts`.
4. Add a `test/typewriters.test.ts` using `testTypeWriters()`.
5. Add fixture files mirroring existing packages.
