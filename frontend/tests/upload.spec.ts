import { expect, test } from "@playwright/test"


test("Upload page renders", async ({ page }: any) => {
  await page.goto("/upload")
  await expect(page.getByText("Import data from csv")).toBeVisible()
  await expect(page.locator("#file")).toBeVisible()
  await expect(page.getByText("Upload data")).toBeVisible()
})
