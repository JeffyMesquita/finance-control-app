import { expect, type Page, test } from "@playwright/test";

import {
  deleteLocalUserByEmail,
  getLocalUserIdByEmail,
  setLocalUserAdmin,
} from "./helpers/local-supabase";

const password = "LocalFinanceE2E!42";

function createEmail(projectName: string, role: string): string {
  return `remaining-${role}-${projectName}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

async function registerThroughLoginPage(page: Page, email: string, referralId?: string) {
  await page.goto(referralId ? `/login?ref=${encodeURIComponent(referralId)}` : "/login");
  await expect(page.getByTestId("e2e-recaptcha-ready")).toBeVisible();
  await page.getByRole("button", { name: /n.*tem uma conta/i }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/backend/auth/register") &&
      response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Criar conta" }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ success: true });
  await page.waitForURL(/\/dashboard(?:\?|$)/u);
}

async function logout(page: Page, email: string) {
  await page.getByRole("button", { name: email.slice(0, 2).toUpperCase() }).click();
  await page.getByRole("menuitem", { name: "Sair" }).dispatchEvent("click");
  await page.waitForURL(/\/login(?:\?|$)/u);
}

async function expectMutation(page: Page, path: string, action: () => Promise<void>) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(path) && response.request().method() !== "GET"
  );
  await action();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ success: true });
}

test.describe("local remaining domains", () => {
  test("processes referral, feedback, reminder, and admin moderation through Nest", async ({
    page,
  }, testInfo) => {
    const adminEmail = createEmail(testInfo.project.name, "admin");
    const userEmail = createEmail(testInfo.project.name, "user");
    const feedbackTitle = `Feedback E2E Nest ${Date.now()}`;

    try {
      await registerThroughLoginPage(page, adminEmail);
      const adminUserId = await getLocalUserIdByEmail(adminEmail);
      await logout(page, adminEmail);

      await registerThroughLoginPage(page, userEmail, adminUserId);

      const referralResponse = await page.evaluate(async () => {
        const response = await fetch("/api/backend/referrals/stats", { credentials: "include" });
        return { status: response.status, payload: await response.json() };
      });
      expect(referralResponse.status).toBe(200);
      expect(referralResponse.payload).toMatchObject({
        success: true,
        data: { total_referrals: 0 },
      });

      const referralProcess = await page.evaluate(async (referrerId) => {
        const csrfResponse = await fetch("/api/backend/auth/csrf", { credentials: "include" });
        const csrfPayload = await csrfResponse.json();
        const response = await fetch("/api/backend/referrals/process", {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
            "x-csrf-token": csrfPayload.data.token,
          },
          body: JSON.stringify({ referrer_id: referrerId }),
        });
        return { status: response.status, payload: await response.json() };
      }, adminUserId);
      expect(referralProcess.status).toBe(201);
      expect(referralProcess.payload).toMatchObject({
        success: true,
        data: { processed: true },
      });
      await page.getByRole("button", { name: userEmail.slice(0, 2).toUpperCase() }).click();
      await page.getByRole("menuitem", { name: "Novo Alerta" }).dispatchEvent("click");
      const reminderDialog = page.getByRole("dialog");
      await reminderDialog.getByLabel("T\u00edtulo").fill("Lembrete E2E");
      await reminderDialog.getByLabel("Valor").fill("25");
      await reminderDialog.getByLabel("Data de vencimento").fill("2030-01-15");
      await expectMutation(page, "/api/backend/payment-reminders", () =>
        reminderDialog.getByRole("button", { name: "Salvar" }).click()
      );

      await page.getByRole("button", { name: userEmail.slice(0, 2).toUpperCase() }).click();
      await page.getByRole("menuitem", { name: "Enviar Feedback" }).dispatchEvent("click");
      const feedbackDialog = page.getByRole("dialog");
      await feedbackDialog.getByLabel("T\u00edtulo").fill(feedbackTitle);
      await feedbackDialog
        .getByLabel("Descri\u00e7\u00e3o Detalhada")
        .fill("Feedback criado pela jornada E2E autenticada no backend Nest.");
      await expectMutation(page, "/api/backend/feedback", () =>
        feedbackDialog.getByRole("button", { name: "Enviar Feedback" }).click()
      );

      await page.goto("/dashboard/admin");
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/u);

      await logout(page, userEmail);
      await setLocalUserAdmin(adminEmail, true);
      await page.goto("/login");
      await page.getByTestId("e2e-recaptcha-ready").waitFor();
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Senha").fill(password);
      await page.getByRole("button", { name: "Entrar com Email" }).click();
      await page.waitForURL(/\/dashboard(?:\?|$)/u);

      await page.goto("/dashboard/admin");
      await expect(page.getByRole("heading", { name: "Dashboard Administrativo" })).toBeVisible();
      await page.goto("/dashboard/admin/feedbacks");
      await expect(page.getByText(feedbackTitle, { exact: true })).toBeVisible();
      const feedbackCard = page
        .getByText(feedbackTitle, { exact: true })
        .locator("xpath=ancestor::div[contains(@class, 'overflow-hidden')]");
      await feedbackCard.getByRole("button").first().click();
      const feedbackDetails = page.getByRole("dialog");
      await expect(feedbackDetails).toContainText(feedbackTitle);
      await expectMutation(page, "/api/backend/admin/feedbacks/update", () =>
        feedbackDetails.getByRole("button", { name: "Resolver" }).click()
      );

      await page.goto("/dashboard/admin/referrals");
      await expect(page.getByRole("heading", { name: /Sistema de Refer/ })).toBeVisible();
    } finally {
      await deleteLocalUserByEmail(adminEmail);
      await deleteLocalUserByEmail(userEmail);
    }
  });
});
