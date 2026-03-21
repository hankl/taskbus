import { NextResponse } from "next/server";

import { jsonError, parseIdParam } from "@/lib/http";
import { markTaskDone } from "@/lib/task-service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseIdParam(params.id);

  if (!id) {
    return jsonError(400, "Invalid task id");
  }

  const result = await markTaskDone(id);

  if (result.type === "not_found") {
    return jsonError(404, "Task not found");
  }

  if (result.type === "invalid_status") {
    return jsonError(409, `Task cannot be marked done from status ${result.task.status}`);
  }

  return NextResponse.json(result.task);
}

