import { test, expect } from "@playwright/test";

test("home page loads and navigates to listings", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find your perfect dorm" })).toBeVisible();
  await page.getByRole("link", { name: "Browse all listings" }).click();
  await expect(page.getByRole("heading", { name: "Room Listings" })).toBeVisible();
});

test("listings search returns results", async ({ page }) => {
  await page.goto("/listings?q=Olney");
  await expect(page.getByText(/rooms found/i)).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".dorm-card").first()).toBeVisible();
});

test("contact page loads", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
});

test("404 page for unknown routes", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
