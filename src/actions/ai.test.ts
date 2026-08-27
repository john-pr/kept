import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from "./ai";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: vi.fn(() => "Too many AI requests. Try again later."),
}));

const responsesCreate = vi.fn();
vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(() => ({ responses: { create: responsesCreate } })),
  AI_MODEL: "gpt-5-nano",
}));

import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const validPayload = { title: "Debounce hook", content: "some code" };

describe("generateAutoTags", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, reset: Date.now() });
  });

  it("rejects an empty title before touching auth", async () => {
    const result = await generateAutoTags({ title: "  ", content: null });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("blocks non-Pro users when plan gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("allows non-Pro users when plan gating is disabled", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    responsesCreate.mockResolvedValue({ output_text: '{"tags": ["react"]}' });

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({ success: true, data: ["react"] });
  });

  it("returns an error when the rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({ success: false, error: "Too many AI requests. Try again later." });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("returns suggested tags on the happy path", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: '{"tags": ["react", "hooks"]}' });

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({ success: true, data: ["react", "hooks"] });
    expect(responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-nano",
        text: { format: { type: "json_object" } },
      })
    );
  });

  it("returns an error when the model produces no usable tags", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "{}" });

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate tag suggestions. Please try again.",
    });
  });

  it("returns a generic error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockRejectedValue(new Error("network error"));

    const result = await generateAutoTags(validPayload);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong generating suggestions.",
    });
  });
});

const validDescriptionPayload = {
  title: "Debounce hook",
  content: "some code",
  url: null,
  language: null,
  fileName: null,
};

describe("generateDescription", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, reset: Date.now() });
  });

  it("rejects an empty title before touching auth", async () => {
    const result = await generateDescription({ ...validDescriptionPayload, title: "  " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("blocks non-Pro users when plan gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("allows non-Pro users when plan gating is disabled", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    responsesCreate.mockResolvedValue({ output_text: "A debounce hook for React inputs." });

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({ success: true, data: "A debounce hook for React inputs." });
  });

  it("returns an error when the rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({ success: false, error: "Too many AI requests. Try again later." });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("returns the generated description on the happy path", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "A debounce hook for React inputs." });

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({ success: true, data: "A debounce hook for React inputs." });
    expect(responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-5-nano" })
    );
  });

  it("returns an error when the model produces an empty description", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "   " });

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate a description. Please try again.",
    });
  });

  it("returns a generic error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockRejectedValue(new Error("network error"));

    const result = await generateDescription(validDescriptionPayload);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong generating a description.",
    });
  });
});

const validExplainPayload = {
  title: "Debounce hook",
  content: "function debounce() {}",
  language: "typescript",
};

describe("explainCode", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, reset: Date.now() });
  });

  it("rejects an empty title before touching auth", async () => {
    const result = await explainCode({ ...validExplainPayload, title: "  " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejects empty content before touching auth", async () => {
    const result = await explainCode({ ...validExplainPayload, content: "  " });

    expect(result).toEqual({ success: false, error: "Content is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("blocks non-Pro users when plan gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("allows non-Pro users when plan gating is disabled", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    responsesCreate.mockResolvedValue({ output_text: "This debounces input changes." });

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({ success: true, data: "This debounces input changes." });
  });

  it("returns an error when the rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({ success: false, error: "Too many AI requests. Try again later." });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("returns the explanation on the happy path", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "## What it does\n\nDebounces input." });

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({ success: true, data: "## What it does\n\nDebounces input." });
    expect(responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-5-nano" })
    );
  });

  it("returns an error when the model produces an empty explanation", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "   " });

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate an explanation. Please try again.",
    });
  });

  it("returns a generic error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockRejectedValue(new Error("network error"));

    const result = await explainCode(validExplainPayload);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong generating an explanation.",
    });
  });
});

const validOptimizePromptPayload = {
  title: "Code Reviewer",
  content: "Review my code.",
};

describe("optimizePrompt", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 19, reset: Date.now() });
  });

  it("rejects an empty title before touching auth", async () => {
    const result = await optimizePrompt({ ...validOptimizePromptPayload, title: "  " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejects empty content before touching auth", async () => {
    const result = await optimizePrompt({ ...validOptimizePromptPayload, content: "  " });

    expect(result).toEqual({ success: false, error: "Content is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("blocks non-Pro users when plan gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan" });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("allows non-Pro users when plan gating is disabled", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    responsesCreate.mockResolvedValue({ output_text: "Review the following code for bugs and style." });

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({ success: true, data: "Review the following code for bugs and style." });
  });

  it("returns an error when the rate limit is exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({ success: false, error: "Too many AI requests. Try again later." });
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("returns the optimized prompt on the happy path", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "Review the following code for bugs and style." });

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({ success: true, data: "Review the following code for bugs and style." });
    expect(responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-5-nano" })
    );
  });

  it("returns an error when the model produces an empty result", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockResolvedValue({ output_text: "   " });

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({
      success: false,
      error: "Couldn't optimize the prompt. Please try again.",
    });
  });

  it("returns a generic error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    responsesCreate.mockRejectedValue(new Error("network error"));

    const result = await optimizePrompt(validOptimizePromptPayload);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong optimizing the prompt.",
    });
  });
});
