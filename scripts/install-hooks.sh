#!/usr/bin/env bash
# Install repo git hooks. Idempotent — safe to re-run on every `bun install`.
# Pillar 4: pre-push runs `bun run check:fast` (everything except the
# app/app-offline Playwright projects, which need a fresh build to be
# meaningful — those run in CI). Skip with `git push --no-verify` only
# when intentionally pushing a WIP branch.
set -euo pipefail

# Skip if not a git working tree (e.g. tarball install).
if [ ! -d .git ] && [ ! -f .git ]; then
  exit 0
fi

GIT_DIR=$(git rev-parse --git-dir 2>/dev/null || echo .git)
HOOKS_DIR="$GIT_DIR/hooks"
mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/pre-push" <<'HOOK'
#!/usr/bin/env bash
# Auto-managed by scripts/install-hooks.sh — re-run `bun install` to update.
exec bun run check:fast
HOOK
chmod +x "$HOOKS_DIR/pre-push"

echo "✓ pre-push hook installed → $HOOKS_DIR/pre-push"

# Playwright needs its browser binaries on disk before any e2e test can run —
# the pre-push hook above will otherwise hit `Executable doesn't exist at …
# /chrome-headless-shell` the first time it fires. `playwright install` is
# idempotent (it no-ops if the binary is already cached), so we call it
# unconditionally here. Scoped to chromium only because that's the single
# device Playwright launches (see apps/<name>/playwright.config.ts).
if [ -d apps/web/node_modules/@playwright/test ]; then
  (cd apps/web && bun x --bun playwright install chromium) || \
    echo "⚠ playwright browser install failed — run \`cd apps/web && bun x playwright install chromium\` manually before pushing"
fi
