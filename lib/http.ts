import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(status: number, message: string) {
  return NextResponse.json(
    {
      error: {
        message
      }
    },
    { status }
  );
}

export function parseIdParam(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export function zodErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: {
        message: "Invalid request",
        issues: error.issues
      }
    },
    { status: 400 }
  );
}

