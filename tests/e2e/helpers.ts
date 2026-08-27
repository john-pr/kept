import { expect, type Page } from "@playwright/test";

/**
 * Throwaway users pile up in the shared Neon `development` branch. They all use this prefix
 * so they're easy to spot; `npm run db:cleanup` (scripts/delete-non-demo-users.ts) removes
 * every non-demo user.
 */
export const E2E_EMAIL_PREFIX = "e2e-smoke";

export function uniqueEmail(): string {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return `${E2E_EMAIL_PREFIX}-${stamp}@example.test`;
}

export const TEST_PASSWORD = "e2e-password-123";

/** Seeded demo account from prisma/seed.ts. */
export const DEMO_EMAIL = "demo@kept.app";
export const DEMO_PASSWORD = "12345678";

/**
 * Registers a fresh throwaway user and signs in. Ends on /dashboard.
 * EMAIL_VERIFICATION_ENABLED must be false (enforced by global-setup).
 */
export async function registerAndSignIn(page: Page): Promise<string> {
  const email = uniqueEmail();

  await page.goto("/register");
  await page.locator("#name").fill("E2E Smoke");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(TEST_PASSWORD);
  await page.locator("#confirmPassword").fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // With verification off, register redirects to /sign-in.
  await page.waitForURL("**/sign-in", { timeout: 15_000 });

  await signIn(page, email, TEST_PASSWORD);
  return email;
}

export async function signIn(page: Page, email: string, password: string): Promise<void> {
  if (!page.url().includes("/sign-in")) {
    await page.goto("/sign-in");
  }
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();

  // Surface a credentials / rate-limit error (the form's own Alert, not a stray toast)
  // instead of a bare navigation timeout.
  const formError = page.locator('[data-slot="alert"]');
  await Promise.race([
    page.waitForURL("**/dashboard", { timeout: 20_000 }),
    formError
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(async () => {
        throw new Error(`Sign in failed: ${(await formError.innerText()).trim()}`);
      }),
  ]);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/**
 * Creates a text item (snippet by default) through the New Item dialog on its type page.
 * Returns the title used. Content is left empty — it's optional for text types.
 */
export async function createTextItem(
  page: Page,
  { title, typeSlug = "snippets" }: { title: string; typeSlug?: string },
): Promise<void> {
  await page.goto(`/items/${typeSlug}`);
  await page.getByRole("button", { name: /^add (snippet|prompt|command|note)/i }).click();

  const dialog = page.getByRole("dialog", { name: /new item/i });
  await expect(dialog).toBeVisible();
  await dialog.locator("#new-item-title").fill(title);
  await dialog.getByRole("button", { name: /^create$/i }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: new RegExp(escapeRegExp(title)) })).toBeVisible();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
