#!/usr/bin/env bash
# Render the `bun gen:app` template to a temp directory and run Biome over it.
# Without this, Biome's `!turbo/generators/templates` exclusion (biome.json)
# lets template-only violations ship to every scaffolded app — empty arrow
# bodies, unused imports, formatting drift, etc. Catching them at gate time
# means a fresh `bun gen:app <name>` always starts on a green baseline.
set -euo pipefail

TEMPLATE_SRC="turbo/generators/templates/app"
TMP_DIR="$(mktemp -d -t dean-stack-template-XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

cp -R "$TEMPLATE_SRC" "$TMP_DIR/rendered"

# Substitute the same tokens Plop would. `{{name}}` becomes a valid kebab-case
# identifier; the `{{{{raw}}}}` blocks are Handlebars escapes that wrap JSX
# inline-style braces so Plop doesn't mis-parse them as expressions.
find "$TMP_DIR/rendered" -type f \( \
  -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' \
  -o -name '*.json' -o -name '*.jsonc' \
  -o -name '*.html' -o -name '*.svg' -o -name '*.txt' \
  -o -name '.env' -o -name '.env.example' \
\) -print0 | while IFS= read -r -d '' f; do
  bun -e '
    const fs = require("fs");
    const p = process.argv[1];
    let s = fs.readFileSync(p, "utf8");
    s = s.replaceAll("{{name}}", "template-check")
         .replaceAll("{{{{raw}}}}", "")
         .replaceAll("{{{{/raw}}}}", "");
    fs.writeFileSync(p, s);
  ' "$f"
done

bun x biome ci "$TMP_DIR/rendered"
