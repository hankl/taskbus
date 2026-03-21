import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const entryFile = resolve(projectRoot, "cli", "taskbus.mjs");
const distDir = resolve(projectRoot, "dist");
const bundleFile = resolve(distDir, "taskbus.bundle.js");

function parseArgs(argv) {
  const result = {
    target: "node18-win-x64",
    output: resolve(distDir, "taskbus.exe")
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target" && argv[index + 1]) {
      result.target = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--output" && argv[index + 1]) {
      result.output = resolve(projectRoot, argv[index + 1]);
      index += 1;
    }
  }

  return result;
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} exited with code ${code ?? "unknown"}`));
    });

    child.on("error", rejectPromise);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  await mkdir(distDir, { recursive: true });
  await mkdir(dirname(options.output), { recursive: true });

  await build({
    entryPoints: [entryFile],
    outfile: bundleFile,
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20"
  });

  await run("npx", ["pkg", bundleFile, "--targets", options.target, "--output", options.output]);

  console.log(`Standalone CLI generated: ${options.output}`);
}

await main();
