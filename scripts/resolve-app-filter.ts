// fallow-ignore-file unused-file
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const appsDir = resolve(repoRoot, "apps");

const explicitFilter = firstPresentEnv(["DEAN_APP_FILTER", "TURBO_APP_FILTER"]);
if (explicitFilter) {
  printFilter(explicitFilter);
}

const explicitApp = firstPresentEnv(["DEAN_APP", "APP_NAME"]);
if (explicitApp) {
  printFilter(toWorkspaceName(explicitApp));
}

const appPackages = findAppPackages();
const webApp = appPackages.find((appPackage) => appPackage.dirName === "web");
if (webApp) {
  printFilter(webApp.packageName);
}

if (appPackages.length === 1) {
  const [onlyApp] = appPackages;
  if (onlyApp) {
    printFilter(onlyApp.packageName);
  }
}

const choices = appPackages.map((appPackage) => appPackage.dirName).join(", ");
process.stderr.write(
  [
    "Could not resolve a dean-stack app workspace.",
    choices
      ? `Found multiple apps (${choices}); set DEAN_APP=<app-dir-name> or DEAN_APP_FILTER=@scope/name.`
      : "No apps were found under apps/. Run bun gen:app first.",
  ].join("\n"),
);
process.exit(1);

function findAppPackages(): Array<{ dirName: string; packageName: string }> {
  if (!existsSync(appsDir)) return [];

  return readdirSync(appsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const packagePath = resolve(appsDir, entry.name, "package.json");
      return {
        dirName: entry.name,
        packageName: readPackageName(packagePath) ?? toWorkspaceName(entry.name),
      };
    })
    .filter((appPackage) => existsSync(resolve(appsDir, appPackage.dirName, "package.json")));
}

function readPackageName(packagePath: string): string | null {
  if (!existsSync(packagePath)) return null;

  const parsed: unknown = JSON.parse(readFileSync(packagePath, "utf8"));
  if (!isRecord(parsed)) return null;

  const { name } = parsed;
  return typeof name === "string" && name.trim() ? name : null;
}

function firstPresentEnv(names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return null;
}

function toWorkspaceName(value: string): string {
  if (value.startsWith("@")) return value;
  return `@dean-stack/${basename(value)}`;
}

function printFilter(filter: string): never {
  process.stdout.write(filter);
  process.exit(0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
