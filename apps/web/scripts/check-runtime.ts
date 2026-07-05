#!/usr/bin/env bun
// Runtime smoke check: if a local server is up, load the app in a headless browser
// and fail if it rendered the "Something broke" error boundary or logged a Zod
// error. If no server is running, it SKIPS (exit 0) — it never starts one.
//
//   bun run scripts/check-runtime.ts
//   RUNTIME_CHECK_PORTS=5173,3010 bun run scripts/check-runtime.ts
//
// This catches client-only runtime failures (a curl of the SPA shell can't — those
// surface only after hydration runs the client JS + reads IndexedDB): a render
// crash, a broken import, or a ZodError when a persisted record re-parses against a
// changed schema (Pillar 3). Migration-specific cases also need a unit test that
// re-parses an OLD record shape; this is the broad "did I break the running app".

import { chromium } from "@playwright/test";

const PORTS = (process.env.RUNTIME_CHECK_PORTS ?? "5173,3010").split(",").map((p) => p.trim());
const BROKE_HEADING = /something broke/i;
const ZOD_ERROR = /ZodError|invalid_type|Invalid input/i;

async function findRunningBase(): Promise<string | null> {
  for (const port of PORTS) {
    const reachable = await fetch(`http://localhost:${port}/`, {
      signal: AbortSignal.timeout(2000),
    })
      .then((response) => response.ok || response.status < 500)
      .catch(() => false);
    if (reachable) return `http://localhost:${port}`;
  }
  return null;
}

async function main(): Promise<number> {
  const base = await findRunningBase();
  if (!base) {
    await Bun.write(
      Bun.stdout,
      `runtime check: no local server on port(s) ${PORTS.join(", ")} — skipping.\n`,
    );
    return 0;
  }

  const errors: string[] = [];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

    await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30_000 });
    // Let the root <Suspense> hydrate from IndexedDB before judging the result.
    await page.waitForTimeout(1500);

    const brokePage = await page.getByRole("heading", { name: BROKE_HEADING }).count();
    const zodErrors = errors.filter((entry) => ZOD_ERROR.test(entry));

    if (brokePage > 0 || zodErrors.length > 0) {
      await Bun.write(Bun.stdout, `runtime check FAILED at ${base}:\n`);
      if (brokePage > 0) await Bun.write(Bun.stdout, `  • rendered the "Something broke" page\n`);
      for (const entry of errors) await Bun.write(Bun.stdout, `  • ${entry}\n`);
      return 1;
    }

    await Bun.write(
      Bun.stdout,
      `runtime check OK: ${base} loaded — no "Something broke" page, no Zod errors.\n`,
    );
    return 0;
  } finally {
    await browser.close();
  }
}

process.exitCode = await main();
