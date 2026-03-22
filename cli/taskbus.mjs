#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };

const baseUrl = process.env.TASKBUS_BASE_URL || "http://localhost:3000";
const apiKey = process.env.TASKBUS_API_KEY || "";

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

function buildTaskListPath(options) {
  const searchParams = new URLSearchParams();

  if (options.executor) {
    searchParams.set("executor", options.executor);
  }

  if (options.creator) {
    searchParams.set("creator", options.creator);
  }

  if (options.status) {
    searchParams.set("status", options.status);
  }

  if (options.page) {
    searchParams.set("page", String(options.page));
  }

  if (options.pageSize) {
    searchParams.set("pageSize", String(options.pageSize));
  }

  const queryString = searchParams.toString();
  return queryString ? `/api/tasks?${queryString}` : "/api/tasks";
}

function printJson(result) {
  if (result === null) {
    console.log("null");
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

const program = new Command();

program
  .name("taskbus")
  .description("AI Agent 任务总线命令行工具")
  .version(packageJson.version, "-V, --version", "显示版本号")
  .helpOption("-h, --help", "显示帮助信息")
  .addHelpCommand("help [command]", "显示指定命令的帮助信息")
  .addHelpText("before", `版本: ${packageJson.version}\n\n`);

program
  .command("create")
  .description("创建任务，读取本地 JSON 文件并提交到 TaskBus")
  .argument("<jsonFile>", "本地 JSON 文件路径，内容需包含 name、fileUrl、executor、creator")
  .action(async (jsonFile) => {
    const payload = await readJsonFile(jsonFile);
    const result = await requestJson("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    printJson(result);
  });

program
  .command("get")
  .description("获取单个任务详情")
  .argument("<id>", "任务 ID")
  .action(async (id) => {
    const result = await requestJson(`/api/tasks/${id}`);
    printJson(result);
  });

program
  .command("list")
  .description("查询任务列表，支持按执行人、创建人、状态和分页筛选")
  .option("-e, --executor <name>", "按 executor 筛选")
  .option("-c, --creator <name>", "按 creator 筛选")
  .option("-s, --status <status>", "按状态筛选，可选值: pending, running, done")
  .option("-p, --page <number>", "页码，默认 1")
  .option("--page-size <number>", "每页条数，默认 20")
  .action(async (options) => {
    const result = await requestJson(
      buildTaskListPath({
        executor: options.executor,
        creator: options.creator,
        status: options.status,
        page: options.page,
        pageSize: options.pageSize
      })
    );
    printJson(result);
  });

program
  .command("claim")
  .description("领取指定 executor 的最旧 pending 任务")
  .requiredOption("-e, --executor <name>", "executor 名称，只会领取分配给该 executor 的最旧 pending 任务")
  .action(async (options) => {
    const result = await requestJson("/api/tasks/claim", {
      method: "POST",
      body: JSON.stringify({ executor: options.executor })
    });
    printJson(result);
  });

program
  .command("done")
  .description("将 running 状态的任务标记为 done")
  .argument("<id>", "任务 ID，只允许 running 状态")
  .action(async (id) => {
    const result = await requestJson(`/api/tasks/${id}/done`, {
      method: "POST",
      body: JSON.stringify({})
    });
    printJson(result);
  });

program.showHelpAfterError("(使用 --help 查看命令帮助)");

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

void main();
