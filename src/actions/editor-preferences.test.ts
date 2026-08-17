import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateEditorPreferences } from "./editor-preferences";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/users", () => ({
  updateEditorPreferences: vi.fn(),
}));

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/users";

const validPayload = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark" as const,
};

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid theme before touching auth or the database", async () => {
    const result = await updateEditorPreferences({
      ...validPayload,
      theme: "dracula" as never,
    });

    expect(result.success).toBe(false);
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejects a non-positive font size", async () => {
    const result = await updateEditorPreferences({ ...validPayload, fontSize: 0 });

    expect(result.success).toBe(false);
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await updateEditorPreferences(validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(updateEditorPreferencesQuery).not.toHaveBeenCalled();
  });

  it("saves the preferences when validation and auth both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(updateEditorPreferencesQuery).mockResolvedValue(validPayload);

    const result = await updateEditorPreferences(validPayload);

    expect(updateEditorPreferencesQuery).toHaveBeenCalledWith("user-1", validPayload);
    expect(result).toEqual({ success: true, data: validPayload });
  });
});
