#!/usr/bin/env bun
// Convert a gathering-enemy image into a low-poly textured GLB via the Tripo3D
// P-Series pipeline, and save it to `apps/web/public/enemy-models/<id>.glb`.
//
//   bun run scripts/tripo-enemy-model.ts <enemy-id>
//   bun run scripts/tripo-enemy-model.ts hadal-glow-polyp-echo --face-limit 4000 --texture-quality detailed
//
// Pipeline (each step validated against the live v3 API):
//   1. POST /v3/files                       upload enemies/<id>.webp  -> file_token
//   2. POST /v3/generation/image-to-model   P1 low-poly geometry      -> task A
//   3. POST /v3/models/texture              regenerate texture (PBR)  -> task B  (falls back to A on error)
//   4. GET  /v3/tasks/{id}                   poll each task until success
//   5. download output.model_url            -> public/enemy-models/<id>.glb
//
// Reads `TRIPO3D_API_KEY` from the environment — Bun auto-loads it from the
// gitignored `.env.local` (see CLAUDE.md "API keys & local secrets").

import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const BASE = "https://openapi.tripo3d.ai/v3";
const REPO_ROOT = resolve(import.meta.dir, "..");
const ENEMIES_DIR = join(REPO_ROOT, "apps/web/public/enemies");
const MODELS_DIR = join(REPO_ROOT, "apps/web/public/enemy-models");

const API_KEY = process.env.TRIPO3D_API_KEY;
if (!API_KEY) {
  throw new Error(
    "TRIPO3D_API_KEY is not set. Put it in .env.local (see CLAUDE.md 'API keys & local secrets').",
  );
}

const args = process.argv.slice(2);
const enemyId = args.find((a) => !a.startsWith("--"));
if (!enemyId) {
  throw new Error("usage: bun run scripts/tripo-enemy-model.ts <enemy-id> [--face-limit N]");
}
const flag = (name: string, fallback: string): string => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const faceLimit = Number.parseInt(flag("face-limit", "4000"), 10);
const textureQuality = flag("texture-quality", "detailed");

const authHeader = { Authorization: `Bearer ${API_KEY}` };

async function log(message: string): Promise<void> {
  await Bun.write(Bun.stdout, `${message}\n`);
}

type TripoResponse<T> = { code: number; message?: string; data?: T };

async function tripo<T>(response: Response): Promise<T> {
  const body = (await response.json()) as TripoResponse<T>;
  if (body.code !== 0 || !body.data) {
    throw new Error(
      `Tripo ${response.status} code ${body.code}: ${body.message ?? "unknown error"}`,
    );
  }
  return body.data;
}

async function checkBalance(): Promise<number> {
  const data = await tripo<{ balance: number; frozen: number }>(
    await fetch(`${BASE}/account/balance`, { headers: authHeader }),
  );
  return data.balance;
}

async function uploadImage(imagePath: string): Promise<string> {
  const file = Bun.file(imagePath);
  if (!(await file.exists())) throw new Error(`enemy image not found: ${imagePath}`);
  const form = new FormData();
  form.append(
    "file",
    new Blob([await file.arrayBuffer()], { type: "image/webp" }),
    `${enemyId}.webp`,
  );
  const data = await tripo<{ file_token: string }>(
    await fetch(`${BASE}/files`, { method: "POST", headers: authHeader, body: form }),
  );
  return data.file_token;
}

async function createTask(path: string, payload: Record<string, unknown>): Promise<string> {
  const data = await tripo<{ task_id: string }>(
    await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
  return data.task_id;
}

type TaskResult = {
  status: string;
  progress: number;
  output?: { model_url?: string; pbr_model?: string; rendered_image_url?: string };
};

async function pollTask(taskId: string, label: string): Promise<TaskResult> {
  const deadline = Date.now() + 8 * 60 * 1000; // 8 min ceiling per step
  let lastProgress = -1;
  for (;;) {
    const data = await tripo<TaskResult>(
      await fetch(`${BASE}/tasks/${taskId}`, { headers: authHeader }),
    );
    if (data.progress !== lastProgress) {
      lastProgress = data.progress;
      await log(`  ${label}: ${data.status} ${data.progress}%`);
    }
    if (data.status === "success") return data;
    if (data.status === "failed" || data.status === "cancelled" || data.status === "error") {
      throw new Error(`${label} ${data.status}`);
    }
    if (Date.now() > deadline) throw new Error(`${label} timed out`);
    await Bun.sleep(3000);
  }
}

async function main(): Promise<void> {
  const balance = await checkBalance();
  await log(`Tripo3D balance: ${balance} credits.`);
  if (balance <= 0) {
    throw new Error(
      "Tripo3D balance is 0 — add credits at https://platform.tripo3d.ai, then re-run. " +
        "(Everything else is wired; this is the only blocker.)",
    );
  }

  const imagePath = join(ENEMIES_DIR, `${enemyId}.webp`);
  await log(`1/5 uploading ${enemyId}.webp …`);
  const fileToken = await uploadImage(imagePath);

  await log(`2/5 P1 low-poly image-to-model (face_limit ${faceLimit}) …`);
  const geometryTask = await createTask("/generation/image-to-model", {
    input: fileToken,
    model: "P1-20260311",
    face_limit: faceLimit,
    texture: true,
    pbr: true,
  });
  await pollTask(geometryTask, "geometry");

  await log(`3/5 texturing (${textureQuality}) …`);
  let finalTask = geometryTask;
  try {
    const textureTask = await createTask("/models/texture", {
      input: geometryTask,
      model: "v3.0-20250812",
      texture_quality: textureQuality,
      pbr: true,
    });
    await pollTask(textureTask, "texture");
    finalTask = textureTask;
  } catch (error) {
    await log(
      `  texture step failed (${(error as Error).message}); using the image-to-model texture.`,
    );
  }

  await log(`4/5 fetching result …`);
  const result = await pollTask(finalTask, "result");
  const modelUrl = result.output?.pbr_model ?? result.output?.model_url;
  if (!modelUrl) throw new Error("no model_url in task output");

  await log(`5/5 downloading GLB …`);
  const target = join(MODELS_DIR, `${enemyId}.glb`);
  mkdirSync(dirname(target), { recursive: true });
  const glb = await fetch(modelUrl);
  if (!glb.ok) throw new Error(`download failed: ${glb.status}`);
  await Bun.write(target, await glb.arrayBuffer());
  await log(`✓ wrote apps/web/public/enemy-models/${enemyId}.glb`);
}

await main();
