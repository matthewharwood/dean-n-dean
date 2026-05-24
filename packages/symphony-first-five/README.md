# Symphony First Five

This package captures the work needed to make the first five minutes of
Elemental Guild playable end to end.

It is built around OpenAI Symphony's model of tracker-backed autonomous work:
issues are the unit of execution, the repo owns the workflow contract, and
agents provide proof through local checks and reviewable artifacts. This package
does not run Symphony or create Linear tickets by itself. It provides typed issue
specs and Markdown bodies that can be used to populate Linear before running a
Symphony orchestrator.

The repo-level runner lives in `scripts/run-symphony.ts`; generated apps inherit
the `symphony` workspace script from `turbo/generators/templates/app/package.json`.
That means a fresh app from `bun gen:app` can run with the same workflow:

```bash
DEAN_APP=<app-name> bun run symphony
DEAN_APP=<app-name> bun run dev:symphony
```

## Files

- `src/index.ts` - Zod schemas, issue data, validation, and Markdown rendering.
- `src/index.test.ts` - coverage for issue graph validity and data anchors.
- `WORKFLOW.md` - a Symphony-compatible workflow prompt for these issues.

## Local Checks

```bash
bun test packages/symphony-first-five/src
bun run build --filter=@dean-stack/symphony-first-five
```

## Usage

Import `FIRST_FIVE_MINUTE_LINEAR_DRAFTS` to create one tracker issue per work
item. Each issue includes dependencies, source anchors, acceptance criteria,
Calvin design notes, Storybook proof, and verification expectations.

## Runner Setup

Install the OpenAI Symphony reference runner locally under ignored `tmp/`:

```bash
git clone https://github.com/openai/symphony tmp/symphony
cd tmp/symphony/elixir
mise trust
mise install
mise exec -- mix setup
mise exec -- mix build
```

Keep local Linear credentials in ignored `.symphony/secrets.env`:

```bash
mkdir -p .symphony
printf 'LINEAR_API_KEY=...\nLINEAR_PROJECT_SLUG=DEA\n' > .symphony/secrets.env
```

Do not put tracker secrets in committed `.env` files.
