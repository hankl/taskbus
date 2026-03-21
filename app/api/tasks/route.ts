import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createTask, listTasks } from "@/lib/task-service";
import { createTaskSchema, listTasksSchema } from "@/lib/task-schema";
import { zodErrorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = listTasksSchema.parse({
      executor: searchParams.get("executor") ?? undefined,
      creator: searchParams.get("creator") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined
    });

    const result = await listTasks(query);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);
    const task = await createTask(input);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    throw error;
  }
}

