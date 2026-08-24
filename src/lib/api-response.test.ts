import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodErrorResponse } from "./api-response";

describe("zodErrorResponse", () => {
  it("returns a 400 response with the first issue's message", async () => {
    const result = z.object({ email: z.string().email("Enter a valid email address") }).safeParse({
      email: "not-an-email",
    });
    if (result.success) throw new Error("expected parse to fail");

    const response = zodErrorResponse(result.error);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "Enter a valid email address" });
  });
});
