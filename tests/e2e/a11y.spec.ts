import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { registerAndSignIn } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function analyze(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  if (results.violations.length > 0) {
    console.log(
      JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          help: v.help,
        })),
        null,
        2,
      ),
    );
  }
  // Quality gate: no serious or critical WCAG A/AA violations.
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(blocking, JSON.stringify(blocking.map((v) => v.id))).toEqual([]);
}

test("a11y: marketing homepage", async ({ page }) => {
  await page.goto("/");
  await analyze(page);
});

test("a11y: dashboard", async ({ page }) => {
  await registerAndSignIn(page);
  await page.goto("/dashboard");
  await analyze(page);
});

test("a11y: items list (snippets)", async ({ page }) => {
  await registerAndSignIn(page);
  await page.goto("/items/snippets");
  await analyze(page);
});
