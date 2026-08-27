import { test, expect } from "@playwright/test";
import { registerAndSignIn, createTextItem, escapeRegExp } from "./helpers";

test("Cmd/Ctrl+K opens the palette, a query finds an item, selecting it opens the drawer", async ({
  page,
}) => {
  await registerAndSignIn(page);

  const title = `E2E searchable ${Date.now()}`;
  await createTextItem(page, { title, typeSlug: "notes" });

  await page.goto("/dashboard");

  const modifier = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+KeyK`);

  const palette = page.getByRole("dialog", { name: "Search" });
  await expect(palette).toBeVisible();

  await palette.getByPlaceholder(/search/i).fill("E2E searchable");

  const result = palette.getByRole("option", { name: new RegExp(escapeRegExp(title)) });
  await expect(result).toBeVisible();
  await result.click();

  // Selecting an item closes the palette and opens that item's drawer.
  await expect(palette).toBeHidden();
  await expect(page.getByRole("dialog", { name: new RegExp(escapeRegExp(title)) })).toBeVisible();
});
