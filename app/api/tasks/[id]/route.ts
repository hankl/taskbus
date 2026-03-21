import { NextResponse } from "next/server";

import { getTaskById } from "@/lib/task-service";
import { jsonError, parseIdParam } from "@/lib/http";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseIdParam(params.id);

  if (!id) {
    return jsonError(400, "Invalid task id");
  }

  const task = await getTaskById(id);

  if (!task) {
    return jsonError(404, "Task not found");
  }

  return NextResponse.json(task);
}

