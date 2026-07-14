#!/usr/bin/env bun
// Generates the REAL phonics audio from ElevenLabs text-to-speech, replacing the
// placeholder clips that `scaffold-phonics-audio.ts` drops in.
//
//   bun run scripts/fetch-phonics-audio.ts            # all 118 clips
//   bun run scripts/fetch-phonics-audio.ts --missing  # only clips not yet real
//   bun run scripts/fetch-phonics-audio.ts --words    # only the 100 word clips
//   bun run scripts/fetch-phonics-audio.ts --vowels   # only the 18 vowel-sound clips
//
// Reads `ELEVENLABS_API_KEY` from the environment — Bun auto-loads it from the
// gitignored `.env.local` (see AGENTS.md "API keys & local secrets"). Voice/model
// are overridable via `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL_ID`.
//
// Voice default: Matilda (American, informative/educational) — US accent matters
// for phonics (e.g. short-o), so a British voice would teach the wrong vowels.

import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { buildPhonicsAudioManifest } from "../packages/schemas/src/data/phonics";

const REPO_ROOT = resolve(import.meta.dir, "..");
const PUBLIC_DIR = join(REPO_ROOT, "apps/web/public");

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  throw new Error(
    "ELEVENLABS_API_KEY is not set. Put it in .env.local (see AGENTS.md 'API keys & local secrets').",
  );
}

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "XrExE9yKIg1WjnnlVkGX"; // Matilda
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const CONCURRENCY = 4;
// A placeholder clip is the ~8.8 KB sfx blip; real speech is larger. `--missing`
// uses this to tell "already fetched" from "still placeholder".
const PLACEHOLDER_MAX_BYTES = 12_000;

const args = new Set(process.argv.slice(2));
const onlyMissing = args.has("--missing");
const wordsOnly = args.has("--words");
const vowelsOnly = args.has("--vowels");

const manifest = buildPhonicsAudioManifest().filter((entry) => {
  if (wordsOnly) return entry.kind === "word";
  if (vowelsOnly) return entry.kind === "vowel" || entry.kind === "vowel-hint";
  return true;
});

function isAlreadyReal(absPath: string): boolean {
  try {
    return statSync(absPath).size > PLACEHOLDER_MAX_BYTES;
  } catch {
    return false;
  }
}

async function synthesize(text: string): Promise<ArrayBuffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  const body = JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
  });

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": API_KEY ?? "", "content-type": "application/json" },
      body,
    });
    if (response.ok) return await response.arrayBuffer();
    // Back off on rate limits / transient server errors; fail fast on 4xx auth/format.
    if (response.status === 429 || response.status >= 500) {
      await Bun.sleep(500 * attempt);
      continue;
    }
    throw new Error(`TTS ${response.status} for "${text}": ${await response.text()}`);
  }
  throw new Error(`TTS exhausted retries for "${text}"`);
}

let done = 0;
let skipped = 0;
let failed = 0;
const queue = [...manifest];

async function worker(): Promise<void> {
  for (;;) {
    const entry = queue.shift();
    if (!entry) return;
    const target = join(PUBLIC_DIR, entry.path);
    if (onlyMissing && isAlreadyReal(target)) {
      skipped += 1;
      continue;
    }
    try {
      const audio = await synthesize(entry.text);
      mkdirSync(dirname(target), { recursive: true });
      await Bun.write(target, audio);
      done += 1;
      await Bun.write(
        Bun.stdout,
        `  ✓ ${entry.path}  (${Math.round(audio.byteLength / 1024)} KB)\n`,
      );
    } catch (error) {
      failed += 1;
      await Bun.write(Bun.stdout, `  ✗ ${entry.path}  ${(error as Error).message}\n`);
    }
  }
}

await Bun.write(
  Bun.stdout,
  `Synthesizing ${manifest.length} phonics clip(s) — voice ${VOICE_ID}, model ${MODEL_ID}\n`,
);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
await Bun.write(
  Bun.stdout,
  `Done: ${done} written, ${skipped} skipped (already real), ${failed} failed.\n`,
);
if (failed > 0) process.exitCode = 1;
