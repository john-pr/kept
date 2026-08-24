import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Standard 400 response for a failed `schema.safeParse(body)` in an API route handler. */
export function zodErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? "Invalid input" },
    { status: 400 }
  );
}
