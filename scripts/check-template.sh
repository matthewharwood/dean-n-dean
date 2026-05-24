#!/usr/bin/env bash
# Render the `bun gen:app` template into apps/test-project (gitignored) and
# run the per-app lint gates over it (Biome + sonarjs/eslint). Without this,
# `biome.json` excludes `turbo/generators/templates/**`, so a template-only
# violation (empty arrow body, formatting drift, sonarjs finding) ships to
# every scaffolded app and only surfaces after the first real `bun gen:app
# <name>`. Running biome + eslint over the rendered tree makes a template
# regression fail the gate the same as any other code in the repo.
#
# apps/test-project/ is gitignored — see .gitignore. We render directly into
# the repo (rather than /tmp) because eslint flat-config resolves plugins
# from the config file's directory walking up to a node_modules; only
# locations under the repo find @dean-stack-style plugins.
#
# Removes the rendered directory on success so later turbo steps don't
# emit "Workspace 'apps/test-project' not found in lockfile" warnings.
# On failure the directory is left on disk for inspection (use `rm -rf
# apps/test-project` to clear it). check-lockfile.sh enforces that `bun
# install` is never run with apps/test-project present — the workspace
# pattern apps/* would otherwise leak it into bun.lock (commit 10c6298).
set -euo pipefail

TEMPLATE_SRC="turbo/generators/templates/app"
DEST="apps/test-project"

rm -rf "$DEST"
cp -R "$TEMPLATE_SRC" "$DEST"

# Substitute the same tokens Plop would. `{{name}}` becomes a valid kebab-
# case identifier; the `{{{{raw}}}}` blocks are Handlebars escapes that
# wrap JSX inline-style braces so Plop doesn't mis-parse them as
# expressions — strip them post-render to recover the real JSX.
find "$DEST" -type f \( \
  -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' \
  -o -name '*.json' -o -name '*.jsonc' \
  -o -name '*.html' -o -name '*.svg' -o -name '*.txt' \
  -o -name '.env' -o -name '.env.example' \
\) -print0 | while IFS= read -r -d '' f; do
  bun -e '
    const fs = require("fs");
    const p = process.argv[1];
    let s = fs.readFileSync(p, "utf8");
    s = s.replaceAll("{{name}}", "test-project")
         .replaceAll("{{{{raw}}}}", "")
         .replaceAll("{{{{/raw}}}}", "");
    fs.writeFileSync(p, s);
  ' "$f"
done

# `apps/test-project/` is in .gitignore (so `check-lockfile.sh` can keep
# bun.lock honest), and biome.json sets `vcs.useIgnoreFile: true` — so a
# bare `biome ci apps/test-project` would silently skip every file.
# Disable the VCS ignore for this invocation only.
bun x biome ci --vcs-use-ignore-file=false "$DEST"

# Eslint with flat config imports plugins from the config file's tree.
# Bun's workspace layout puts eslint-plugin-sonarjs (and typescript-eslint)
# under `apps/web/node_modules/`, not the repo root. Without a `bun install`
# for `apps/test-project` (intentionally avoided — see check-lockfile.sh),
# Node's resolution walking up from apps/test-project finds no node_modules
# with sonarjs. Borrow the install by symlinking apps/web/node_modules into
# place for the duration of the eslint run, then drop it.
NODE_MODULES_SOURCE=""
for candidate in apps/web/node_modules apps/*/node_modules; do
  if [ -d "$candidate" ]; then
    NODE_MODULES_SOURCE="$(pwd)/$candidate"
    break
  fi
done

if [ -z "$NODE_MODULES_SOURCE" ]; then
  echo "No app node_modules directory found; run bun install before checking the generator template." >&2
  exit 1
fi

ln -sf "$NODE_MODULES_SOURCE" "$DEST/node_modules"
(cd "$DEST" && bun x eslint --config eslint.sonar.config.mjs --no-warn-ignored --max-warnings 0 "app/**/*.{ts,tsx}" "tests/**/*.ts" "scripts/**/*.ts")

# Reached only on success (set -e). Drop the rendered workspace so the
# rest of the gate (turbo filters, fallow, etc.) doesn't see it.
rm -rf "$DEST"
