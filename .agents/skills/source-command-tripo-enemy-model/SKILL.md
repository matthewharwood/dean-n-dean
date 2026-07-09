---
name: "source-command-tripo-enemy-model"
description: "Convert gathering-enemy image(s) into low-poly textured GLB models via the Tripo3D P-Series pipeline, then wire them into the monster card."
---

# source-command-tripo-enemy-model

Use this skill when the user asks to run the migrated source command `tripo-enemy-model`.

## Command Template

# /tripo-enemy-model — enemy image → low-poly 3D model

Turn `apps/web/public/enemies/<id>.webp` into a low-poly **textured GLB** at
`apps/web/public/enemy-models/<id>.glb` using Tripo3D's **P-Series** image-to-model
flow, then have the monster card render it in place of the 2D portrait.

**Arguments:** one or more enemy ids (e.g. `hadal-glow-polyp-echo`). With none,
list the unconverted enemies from `packages/schemas/src/data/gathering-enemies.ts`
and ask which to do. **Do one enemy, screenshot it in-game, and stop for review
before batch-converting the rest** — generation costs credits.

## Prerequisites (check first)

1. `TRIPO3D_API_KEY` is in the gitignored `.env.local` (see AGENTS.md "API keys & local secrets"). Bun auto-loads it.
2. The account has credits: `curl -s -H "Authorization: Bearer $TRIPO3D_API_KEY" https://openapi.tripo3d.ai/v3/account/balance` → `data.balance` must be > 0. **Generation fails with `code 2010` when balance is 0** — if so, tell the user to add credits at https://platform.tripo3d.ai and stop; everything else is already wired.

## Run it

```bash
bun run tripo:enemy-model <enemy-id> [--face-limit 4000] [--texture-quality detailed]
```

`scripts/tripo-enemy-model.ts` runs the whole pipeline (each step validated against the live v3 API, base `https://openapi.tripo3d.ai/v3`, `Authorization: Bearer <key>`):

1. **Upload** — `POST /files` (multipart `file`) → `{data:{file_token}}`. Localhost images aren't publicly reachable, so the image must be uploaded for a `file_token` (don't pass a localhost URL).
2. **Image-to-model (P-Series, low-poly)** — `POST /generation/image-to-model` with `{input: "<file_token>", model: "P1-20260311", face_limit, texture: true, pbr: true}` → `{data:{task_id}}`. `P1-20260311` is the low-poly model; `face_limit` 50–20000 (default 4000 — clean low-poly for a small card portrait).
3. **Texture (before export)** — `POST /models/texture` with `{input: "<task_id_from_step_2>", model: "v3.0-20250812", texture_quality, pbr: true}` → a new `task_id`. The script does this as a separate step (the guide's "add texturing to the workflow"); if Tripo rejects texturing a P-series source it falls back to the image-to-model texture, so you always get a textured GLB.
4. **Poll** — `GET /tasks/{task_id}` → `{data:{status, progress, output:{model_url|pbr_model}}}`; `status` goes `queued`/`running`/`success`/`failed`. Each step takes ~1–2 min.
5. **Download** — fetch `output.pbr_model ?? output.model_url` → `apps/web/public/enemy-models/<id>.glb`.

## Wire it into the game

The monster card already swaps the 2D image for a 3D viewer when the enemy id is registered. After generating a model for a NEW enemy, add it to the registry:

```ts
// apps/web/app/components/alchemist-guild-board/gathering-enemy-models.ts
const ENEMY_MODEL_PATHS: Record<string, string> = {
  "hadal-glow-polyp-echo": "enemy-models/hadal-glow-polyp-echo.glb",
  // add the new <id>: "enemy-models/<id>.glb",
};
```

The viewer is `GlbMonsterViewer` (Three.js, WebGPU-preferred with WebGL2 fallback,
moody bioluminescent lighting) in `apps/web/app/canvas/use-glb-monster-viewer.ts`.

## Verify

- Storybook story `Components/AlchemistGuildBoard/GlbMonsterViewer` renders the GLB in isolation.
- In-game: seed `gathering.monster.id = "monster:<id>"` and confirm the card shows the lit 3D model.
- Run `bun run check:runtime` (loads the running app, fails on a "Something broke" boundary or runtime ZodError) and `bun run check:fast`.
