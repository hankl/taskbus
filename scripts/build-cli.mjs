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

const defaultTargets = ["node18-win-x64", "node18-linux-x64", "node18-macos-x64"];

function parseArgs(argv) {
  const result = {
    targets: [...defaultTargets],
    output: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target" && argv[index + 1]) {
      result.targets = argv[index + 1]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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

function getOutputFile(target, explicitOutput) {
  if (explicitOutput) {
    return explicitOutput;
  }

  const parts = target.split("-");
  const platform = parts[1];
  const arch = parts[2];
  const extension = platform === "win" ? ".exe" : "";

  return resolve(distDir, `taskbus-${platform}-${arch}${extension}`);
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

  await build({
    entryPoints: [entryFile],
    outfile: bundleFile,
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20"
  });

  for (const target of options.targets) {
    const outputFile = getOutputFile(target, options.output);
    await mkdir(dirname(outputFile), { recursive: true });
    await run("npx", ["pkg", bundleFile, "--targets", target, "--output", outputFile]);
    console.log(`Standalone CLI generated: ${outputFile}`);
  }
}

await main();
