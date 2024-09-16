import { expect, test } from "@playwright/test"


test("Dashboard renders", async ({ page }: any) => {
  await page.goto("/dashboard")
  await page.getByLabel("Period").selectOption("All time");
  await expect(page.getByText("Equipment ID")).toBeVisible()
  await expect(page.getByText("Average")).toBeVisible()
  await expect(page.locator(".recharts-responsive-container")).toBeVisible()
})

test("Dashboard displays empty data", async ({ page }: any) => {
  await page.goto("/dashboard")
  await page.getByLabel('Period').selectOption('Custom');
  await expect(page.locator("#begin_custom_date")).toBeVisible()
  await expect(page.locator("#end_custom_date")).toBeVisible()
  await page.locator("#begin_custom_date").fill("0001-01-01T00:00")
  await page.locator("#end_custom_date").fill("0001-01-01T00:00")
  await expect(page.getByText('There were no entries for the data period selected.')).toBeVisible();
})
