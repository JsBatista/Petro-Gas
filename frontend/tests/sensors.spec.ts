import { expect, test } from "@playwright/test"


test("Sensors table renders", async ({ page }: any) => {
  await page.goto("/sensors")
  await expect(page.getByText("Sensor Data Management")).toBeVisible()
  await expect(page.getByText("Equipment ID")).toBeVisible()
  await expect(page.getByText("Timestamp")).toBeVisible()
  await expect(page.getByText("Value")).toBeVisible()
  await expect(page.getByText("Actions")).toBeVisible()
})
