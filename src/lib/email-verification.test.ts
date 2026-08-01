import { afterEach, describe, expect, it } from "vitest";
import { isEmailVerificationEnabled } from "./email-verification";

describe("isEmailVerificationEnabled", () => {
  const originalValue = process.env.EMAIL_VERIFICATION_ENABLED;

  afterEach(() => {
    process.env.EMAIL_VERIFICATION_ENABLED = originalValue;
  });

  it("defaults to enabled when the env var is unset", () => {
    delete process.env.EMAIL_VERIFICATION_ENABLED;
    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it("is disabled only when explicitly set to 'false'", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = "false";
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it("stays enabled for any other value", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = "true";
    expect(isEmailVerificationEnabled()).toBe(true);
  });
});