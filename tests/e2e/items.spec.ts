import { test, expect } from "@playwright/test";
import { registerAndSignIn, createTextItem, escapeRegExp } from "./helpers";

test("create a snippet, open its drawer, favorite it, and see it persist", async ({ page }) => {
  await registerAndSignIn(page);

  const title = `E2E snippet ${Date.now()}`;
  await createTextItem(page, { title, typeSlug: "snippets" });

  const titleRe = new RegExp(escapeRegExp(title));

  // Open the drawer from the card.
  await page.getByRole("button", { name: titleRe }).click();
  const drawer = page.getByRole("dialog", { name: titleRe });
  const favorite = drawer.getByRole("button", { name: "Favorite" });
  await expect(favorite).toBeVisible();

  await favorite.click();
  await expect(drawer.getByRole("button", { name: "Unfavorite" })).toBeVisible();

  // Reload, reopen the drawer — favorite state came from the server, so it survives.
  await page.reload();
  await page.getByRole("button", { name: titleRe }).click();
  await expect(
    page.getByRole("dialog", { name: titleRe }).getByRole("button", { name: "Unfavorite" }),
  ).toBeVisible();
});
