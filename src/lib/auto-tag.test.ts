import { describe, expect, it } from "vitest";
import { buildAutoTagInput, parseAutoTagResponse } from "./auto-tag";

describe("parseAutoTagResponse", () => {
  it("parses the requested {tags: [...]} object shape", () => {
    expect(parseAutoTagResponse('{"tags": ["react", "hooks"]}')).toEqual(["react", "hooks"]);
  });

  it("parses a bare array, since the model sometimes returns that instead", () => {
    expect(parseAutoTagResponse('["react", "hooks"]')).toEqual(["react", "hooks"]);
  });

  it("normalizes tags to lowercase and trims whitespace", () => {
    expect(parseAutoTagResponse('{"tags": [" React ", "HOOKS"]}')).toEqual(["react", "hooks"]);
  });

  it("dedupes tags that normalize to the same value", () => {
    expect(parseAutoTagResponse('{"tags": ["React", "react", " react "]}')).toEqual(["react"]);
  });

  it("drops empty and non-string entries", () => {
    expect(parseAutoTagResponse('{"tags": ["react", "", 42, null]}')).toEqual(["react"]);
  });

  it("returns an empty array for malformed JSON", () => {
    expect(parseAutoTagResponse("not json")).toEqual([]);
  });

  it("returns an empty array when neither shape matches", () => {
    expect(parseAutoTagResponse('{"foo": "bar"}')).toEqual([]);
  });
});

describe("buildAutoTagInput", () => {
  it("includes the title and content", () => {
    const input = buildAutoTagInput("My Title", "some content");
    expect(input).toContain("My Title");
    expect(input).toContain("some content");
  });

  it("includes the literal word 'json', required by the Responses API for json_object format", () => {
    const input = buildAutoTagInput("Title", "content");
    expect(input.toLowerCase()).toContain("json");
  });

  it("truncates content to 2000 chars", () => {
    const longContent = "a".repeat(3000);
    const input = buildAutoTagInput("Title", longContent);
    const contentPart = input.split("Content:\n")[1].split("\n\nRespond")[0];
    expect(contentPart.length).toBe(2000);
  });

  it("handles null content", () => {
    const input = buildAutoTagInput("Title", null);
    expect(input).toBe(
      'Title: Title\n\nContent:\n\n\nRespond only with a JSON object: {"tags": ["tag1", "tag2"]}.'
    );
  });
});
