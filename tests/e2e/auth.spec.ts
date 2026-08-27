import { test, expect } from "@playwright/test";
import { registerAndSignIn } from "./helpers";

test("register a throwaway user, sign in, land on the dashboard", async ({ page }) => {
  const email = await registerAndSignIn(page);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // A protected route stays reachable while signed in.
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings$/);

  expect(email).toMatch(/^e2e-smoke-/);
});

test("an unauthenticated visit to a protected route redirects to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in/);
});
