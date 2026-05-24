#!/usr/bin/env bun
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

const AVATAR_FILE_STEMS = [
  "professor-atomwick",
  "sir-bubbleton",
  "baker-brindle",
  "mina-pickbright",
  "glassblower-luma",
  "tinker-volt",
  "gardener-nori",
  "archivist-mendelee",
  "ranger-rowan",
  "wizard-quillby",
  "bard-brio",
  "rogue-sable",
  "cleric-maribel",
  "apprentice",
] as const;

const DEFAULT_OUTPUT_DIR = "apps/web/public/alchemy-character-avatars";
const GENERATED_IMAGE_ROOT = join(homedir(), ".codex", "generated_images");

type Options = {
  deleteSource: boolean;
  outputDir: string;
  quality: number;
  sourceDir: string;
};

function parseOptions(argv: readonly string[]): Options {
  let deleteSource = false;
  let outputDir = DEFAULT_OUTPUT_DIR;
  let quality = 86;
  let sourceDir: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument) continue;

    if (argument === "--delete-source") {
      deleteSource = true;
      continue;
    }
    if (argument === "--source") {
      sourceDir = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith("--source=")) {
      sourceDir = argument.slice("--source=".length);
      continue;
    }
    if (argument === "--out") {
      outputDir = argv[index + 1] ?? outputDir;
      index += 1;
      continue;
    }
    if (argument.startsWith("--out=")) {
      outputDir = argument.slice("--out=".length);
      continue;
    }
    if (argument === "--quality") {
      quality = Number(argv[index + 1] ?? quality);
      index += 1;
      continue;
    }
    if (argument.startsWith("--quality=")) {
      quality = Number(argument.slice("--quality=".length));
      continue;
    }
    if (!argument.startsWith("-") && !sourceDir) {
      sourceDir = argument;
    }
  }

  if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
    throw new Error(`Expected --quality to be between 1 and 100, received ${quality}`);
  }

  return {
    deleteSource,
    outputDir: resolve(outputDir),
    quality,
    sourceDir: resolve(sourceDir ?? findLatestGeneratedImageDirectory()),
  };
}

function findLatestGeneratedImageDirectory(): string {
  const directories = readdirSync(GENERATED_IMAGE_ROOT)
    .map((entry) => join(GENERATED_IMAGE_ROOT, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory())
    .toSorted(
      (firstPath, secondPath) => statSync(secondPath).mtimeMs - statSync(firstPath).mtimeMs,
    );

  const latestDirectory = directories[0];
  if (!latestDirectory) {
    throw new Error(`No generated image directories found under ${GENERATED_IMAGE_ROOT}`);
  }
  return latestDirectory;
}

function getChronologicalPngPaths(sourceDir: string): string[] {
  return readdirSync(sourceDir)
    .filter((entry) => entry.endsWith(".png"))
    .map((entry) => join(sourceDir, entry))
    .toSorted((firstPath, secondPath) => {
      const mtimeDelta = statSync(firstPath).mtimeMs - statSync(secondPath).mtimeMs;
      return mtimeDelta === 0
        ? basename(firstPath).localeCompare(basename(secondPath))
        : mtimeDelta;
    });
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  if (!existsSync(options.sourceDir)) {
    throw new Error(`Source directory does not exist: ${options.sourceDir}`);
  }

  const pngPaths = getChronologicalPngPaths(options.sourceDir);
  if (pngPaths.length !== AVATAR_FILE_STEMS.length) {
    throw new Error(
      `Expected ${AVATAR_FILE_STEMS.length} generated PNGs, found ${pngPaths.length} in ${options.sourceDir}`,
    );
  }

  mkdirSync(options.outputDir, { recursive: true });

  for (const [index, pngPath] of pngPaths.entries()) {
    const fileStem = AVATAR_FILE_STEMS[index];
    if (!fileStem) {
      throw new Error(`Missing avatar file stem for ${pngPath}`);
    }

    const webpPath = join(options.outputDir, `${fileStem}.webp`);
    await Bun.$`cwebp -quiet -resize 256 256 -q ${options.quality} ${pngPath} -o ${webpPath}`;
    process.stdout.write(`${basename(pngPath)} -> ${webpPath}\n`);
  }

  if (options.deleteSource) {
    for (const pngPath of pngPaths) {
      rmSync(pngPath);
    }
    process.stdout.write(`Deleted ${pngPaths.length} source PNGs from ${options.sourceDir}\n`);
  }
}

await main();
