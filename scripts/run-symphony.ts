// fallow-ignore-file unused-file
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const ENV_LINE_SEPARATOR = /\r?\n/;

loadEnvFile(resolve(repoRoot, ".env"));
loadEnvFile(resolve(repoRoot, ".env.local"));
loadEnvFile(resolve(repoRoot, ".symphony/secrets.env"));

const workflowPath = resolve(
  repoRoot,
  process.env.SYMPHONY_WORKFLOW ?? "packages/symphony-first-five/WORKFLOW.md",
);
const defaultSymphonyBin = resolve(repoRoot, "tmp/symphony/elixir/bin/symphony");
const symphonyBin = resolve(repoRoot, process.env.SYMPHONY_BIN ?? defaultSymphonyBin);
const symphonyElixirRoot = resolve(repoRoot, "tmp/symphony/elixir");
const shouldUseMise =
  process.env.SYMPHONY_USE_MISE !== "0" && existsSync(resolve(symphonyElixirRoot, "mise.toml"));
const workspaceRoot = resolve(
  repoRoot,
  process.env.SYMPHONY_WORKSPACE_ROOT ?? ".symphony/workspaces/first-five-minutes",
);
const logsRoot = resolve(repoRoot, process.env.SYMPHONY_LOGS_ROOT ?? ".symphony/logs");

if (!existsSync(workflowPath)) {
  process.stderr.write(`Symphony workflow not found: ${workflowPath}\n`);
  process.exit(1);
}

if (!existsSync(symphonyBin)) {
  process.stderr.write(
    `${[
      `Symphony binary not found: ${symphonyBin}`,
      "",
      "Install the reference runner locally:",
      "  git clone https://github.com/openai/symphony tmp/symphony",
      "  cd tmp/symphony/elixir",
      "  mise trust",
      "  mise install",
      "  mise exec -- mix setup",
      "  mise exec -- mix build",
      "",
      "Then run:",
      "  LINEAR_API_KEY=... LINEAR_PROJECT_SLUG=... bun run dev:symphony",
      "",
      "Override paths if needed:",
      "  SYMPHONY_BIN=/path/to/symphony SYMPHONY_WORKFLOW=/path/to/WORKFLOW.md bun run symphony",
    ].join("\n")}\n`,
  );
  process.exit(1);
}

mkdirSync(workspaceRoot, { recursive: true });
mkdirSync(logsRoot, { recursive: true });

const command = shouldUseMise
  ? [
      Bun.which("mise") ?? "mise",
      "exec",
      "-C",
      symphonyElixirRoot,
      "--",
      symphonyBin,
      "--i-understand-that-this-will-be-running-without-the-usual-guardrails",
      workflowPath,
      "--logs-root",
      logsRoot,
    ]
  : [
      symphonyBin,
      "--i-understand-that-this-will-be-running-without-the-usual-guardrails",
      workflowPath,
      "--logs-root",
      logsRoot,
    ];
if (process.env.SYMPHONY_PORT) {
  command.push("--port", process.env.SYMPHONY_PORT);
}

process.stdout.write(`Starting Symphony with ${workflowPath}\n`);
process.stdout.write(`Workspace root: ${workspaceRoot}\n`);
if (process.env.SYMPHONY_PORT) {
  process.stdout.write(`Dashboard: http://localhost:${process.env.SYMPHONY_PORT}/\n`);
}

const child = Bun.spawn(command, {
  cwd: repoRoot,
  env: {
    ...process.env,
    LANG: process.env.LANG ?? "en_US.UTF-8",
    LC_ALL: process.env.LC_ALL ?? "en_US.UTF-8",
    LC_CTYPE: process.env.LC_CTYPE ?? "en_US.UTF-8",
    SYMPHONY_WORKSPACE_ROOT: workspaceRoot,
  },
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

process.exit(await child.exited);

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;

  const contents = readFileSync(path, "utf8");
  for (const line of contents.split(ENV_LINE_SEPARATOR)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = stripOptionalQuotes(value);
    }
  }
}

function stripOptionalQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
