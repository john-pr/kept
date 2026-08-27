import { test, expect } from "@playwright/test";

test.describe("marketing homepage", () => {
  test("renders the hero and nav", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/kept/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The nav CTA is a styled control with an implicit button role.
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("theme toggle flips the <html> class", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    const toggle = page.getByRole("switch", { name: /switch to (light|dark)/i });
    await toggle.click();
    await expect(html).toHaveClass(/light/);
    await expect(html).not.toHaveClass(/dark/);

    await toggle.click();
    await expect(html).toHaveClass(/dark/);
  });

  test("Features and Pricing nav anchors resolve", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#features")).toHaveCount(1);
    await expect(page.locator("#pricing")).toHaveCount(1);

    const nav = page.getByRole("navigation");
    await nav.getByRole("link", { name: "Features" }).click();
    await expect(page).toHaveURL(/#features$/);
    await expect(page.locator("#features")).toBeInViewport();

    await nav.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator("#pricing")).toBeInViewport();
  });
});
