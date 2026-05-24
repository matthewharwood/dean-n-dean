---
tracker:
  kind: linear
  api_key: "$LINEAR_API_KEY"
  project_slug: "$LINEAR_PROJECT_SLUG"
polling:
  interval_ms: 30000
  max_concurrent_agents: 1
workspace:
  root: ".symphony/workspaces/first-five-minutes"
hooks:
  timeout_ms: 60000
  before_run: "bun install --frozen-lockfile"
agent:
  command: "codex"
  args: []
codex:
  model: "gpt-5-codex"
---

# Elemental Guild First Five Minutes Workflow

You are implementing one Linear issue from the first-five-minute backlog defined
in `packages/symphony-first-five`.

Before editing code:

1. Read the assigned Linear issue.
2. Read `AGENTS.md`.
3. Read `.claude/agents/calvin-game-designer.md`.
4. Read the relevant issue spec in `packages/symphony-first-five/src/index.ts`.
5. Read the data anchors named by the issue, especially:
   - `packages/schemas/src/data/alchemy-quests.ts`
   - `packages/schemas/src/data/alchemy-recipes.ts`
   - `packages/schemas/src/data/element-cards.ts`
   - `apps/web/app/components/alchemist-guild-board/index.tsx`

Execution rules:

- Preserve the Four Pillars: Storybook-first, Zod-first, IDB-first, CLI-gate-first.
- Do not write or modify Playwright tests until the user has explicitly answered
  how that specific test should be structured.
- For UI work, create the component story before wiring it into the app route.
- For persisted gameplay state, add Zod schemas and IDB-backed atoms before UI
  consumes the state.
- Treat the first five minutes as a single child-facing loop:
  quest -> vault -> drag cards -> craft water -> wait -> collect -> deliver ->
  reward -> slot IV shop unlock -> Discovery Draft -> next board state.
- Keep the iPad interaction large, readable, and touch-safe.

Definition of done:

- The issue acceptance criteria are satisfied.
- New logic has Bun unit tests where it can be tested without a browser.
- UI components have stories.
- The relevant local check passes. Prefer `bun run check:fast` when the change
  touches app behavior, shared schemas, or multiple components.
- The final handoff includes changed files, checks run, and any residual risk.
