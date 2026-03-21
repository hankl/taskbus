#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const baseUrl = process.env.TASKBUS_BASE_URL || "http://localhost:3000";
const apiKey = process.env.TASKBUS_API_KEY || "";

function printUsage() {
  console.error(`Usage:
  taskbus create <jsonFile>
  taskbus get <id>
  taskbus claim --executor <name>
  taskbus done <id>`);
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  return headers;
}

async function readJsonFile(path) {
  const content = await readFile(path, "utf8");
  return JSON.parse(content);
}

async function requestJson(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function parseClaimExecutor(args) {
  const index = args.indexOf("--executor");
  if (index === -1 || !args[index + 1]) {
    throw new Error("Missing --executor <name>");
  }
  return args[index + 1];
}

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    if (command === "create") {
      const jsonFile = args[0];
      if (!jsonFile) {
        throw new Error("Missing json file path");
      }

      const payload = await readJsonFile(jsonFile);
      const result = await requestJson("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === "get") {
      const id = args[0];
      if (!id) {
        throw new Error("Missing task id");
      }

      const result = await requestJson(`/api/tasks/${id}`);
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === "claim") {
      const executor = parseClaimExecutor(args);
      const result = await requestJson("/api/tasks/claim", {
        method: "POST",
        body: JSON.stringify({ executor })
      });

      if (!result) {
        console.log("null");
        return;
      }

      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === "done") {
      const id = args[0];
      if (!id) {
        throw new Error("Missing task id");
      }

      const result = await requestJson(`/api/tasks/${id}/done`, {
        method: "POST",
        body: JSON.stringify({})
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
