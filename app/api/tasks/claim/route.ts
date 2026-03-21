import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { claimTask } from "@/lib/task-service";
import { claimTaskSchema } from "@/lib/task-schema";
import { zodErrorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = claimTaskSchema.parse(body);
    const task = await claimTask(input);

    if (!task) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    throw error;
  }
}

