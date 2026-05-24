---
name: symphony
description: "OpenAI Symphony reference-runner integration for dean-stack — local ignored install under `tmp/symphony`, workflow/spec package `@dean-stack/symphony-first-five`, Linear env wiring, `bun run symphony`, and generated-app-safe `bun run dev:symphony`. Triggers on: symphony, OpenAI Symphony, Linear orchestrator, dev:symphony, WORKFLOW.md, first-five backlog."
license: MIT
---

Owns the repo-local Symphony orchestration layer. Symphony is not a UI library and not part of the deployed app; it is a local agent runner for executing Linear-backed implementation issues.

## When to invoke
- Wiring or debugging `bun run symphony` / `bun run dev:symphony`.
- Editing `packages/symphony-first-five/WORKFLOW.md` or issue specs.
- Changing `scripts/run-symphony.ts`, `.symphony/`, or `tmp/symphony` setup.
- Making generated apps inherit Symphony task-runner support.
- Diagnosing unreadable Symphony terminal output such as `\x{2500}` box-drawing escapes.

## Owns
Symphony local install instructions, the ignored runtime directories, the `@dean-stack/symphony-first-five` workflow package, Linear tracker env loading, and the generated-app-safe Turbo task wiring.

## Defers to
- `turborepo` — root task graph, `symphony` persistent task, and app filter resolution.
- `bun-runtime` — TypeScript scripts under `scripts/` and child process spawning.
- `bun-package-manager` — dependency install and lockfile behavior.
- `prompt` / `run-prompt` — prompt authoring and execution outside Symphony.

## Dean-stack rules
- Symphony runs locally only. Never add it to the GitHub Pages runtime or frontend bundle.
- Keep the reference runner clone under ignored `tmp/symphony/`; keep workspaces, logs, and secrets under ignored `.symphony/`.
- Do not commit `LINEAR_API_KEY` or other tracker credentials. Local secrets belong in `.symphony/secrets.env`.
- Generated apps must include a `symphony` workspace script so `DEAN_APP=<name> bun run dev:symphony` works after `bun gen:app`.
- The wrapper must set UTF-8 locale defaults for the child process. Turbo strict env mode may strip `LANG` / `LC_*`, and Erlang prints Unicode box drawing as `\x{2500}` without a UTF-8 locale.

## Patterns

### Install the reference runner
```bash
git clone https://github.com/openai/symphony tmp/symphony
cd tmp/symphony/elixir
mise trust
mise install
mise exec -- mix setup
mise exec -- mix build
```

### Store local Linear secrets
```bash
mkdir -p .symphony
cat > .symphony/secrets.env <<'EOF'
LINEAR_API_KEY=...
LINEAR_PROJECT_SLUG=DEA
EOF
```

`.symphony/` is ignored. Do not mirror this into `.env`, because repo env files are client-facing `VITE_*` config by convention.

### Run Symphony alone
```bash
bun run symphony
```

The root script resolves the target app in this order:
1. `DEAN_APP_FILTER=@scope/name`
2. `DEAN_APP=<app-dir-name>`
3. `apps/web` if it exists
4. the only app under `apps/`

### Run Symphony with the dev stack
```bash
bun run dev:symphony
DEAN_APP=my-new-game bun run dev:symphony
```

This co-runs Vite, Storybook, Biome watch, Stylelint watch, and Symphony for the target app.

### Override runner paths
```bash
SYMPHONY_BIN=/path/to/symphony \
SYMPHONY_WORKFLOW=/path/to/WORKFLOW.md \
bun run symphony
```

## Anti-patterns
- **Do not commit `tmp/symphony/` or `.symphony/`** — they are local runtime artifacts.
- **Do not hard-code `@dean-stack/web` in new root scripts** — use `scripts/resolve-app-filter.ts` so generated apps remain first-class.
- **Do not put Linear keys in committed env files** — `.symphony/secrets.env` is the local-only place.
- **Do not bypass `scripts/run-symphony.ts` from package scripts** — the wrapper loads local secrets, sets UTF-8 locale defaults, creates workspace/log directories, and passes Symphony's required guardrail flag.

## Triggers on
symphony, OpenAI Symphony, Linear orchestrator, dev:symphony, WORKFLOW.md, first-five backlog, Symphony runner, `.symphony`, `tmp/symphony`
