import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

import { deleteLocalUserByEmail } from "./helpers/local-supabase";

const password = "LocalFinanceE2E!42";

function createEmail(projectName: string): string {
  return `finance-e2e-${projectName}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

async function registerThroughLoginPage(
  email: string,
  page: import("@playwright/test").Page
): Promise<void> {
  await page.goto("/login");
  await expect(page.getByTestId("e2e-recaptcha-ready")).toBeVisible();
  await page.getByRole("button", { name: /não tem uma conta/i }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await page.waitForURL(/\/dashboard(?:\?|$)/u);
}

test.describe("local core finance", () => {
  test("registers, manages core financial data, and closes the session", async ({
    page,
  }, testInfo) => {
    const email = createEmail(testInfo.project.name);

    try {
      // GIVEN: A fresh local browser session with the E2E reCAPTCHA adapter enabled.
      // WHEN: The user completes registration through the public login UI.
      await registerThroughLoginPage(email, page);

      // THEN: The same-origin session contains the expected cookie boundary.
      const cookies = await page.context().cookies();
      expect(cookies.find((cookie) => cookie.name === "ft_access")?.httpOnly).toBe(true);
      expect(cookies.find((cookie) => cookie.name === "ft_refresh")?.httpOnly).toBe(true);
      expect(cookies.find((cookie) => cookie.name === "ft_csrf")?.httpOnly).toBe(false);
      await expect(page.getByRole("button", { name: email.slice(0, 2).toUpperCase() })).toBeVisible(
        { timeout: 30_000 }
      );

      // GIVEN: An authenticated user on the accounts screen.
      // WHEN: It creates and updates two accounts through TanStack-powered UI.
      await page.goto("/dashboard/contas");
      const accountsRetry = page.getByRole("button", { name: "Tentar novamente" });
      if (await accountsRetry.isVisible().catch(() => false)) {
        await accountsRetry.click();
      }
      await expect(page.getByRole("button", { name: "Nova conta", exact: true })).toBeVisible({
        timeout: 30_000,
      });
      await page.getByRole("button", { name: "Nova conta", exact: true }).click();
      const accountDialog = page.getByRole("dialog");
      await accountDialog.getByLabel("Nome").fill("Conta principal E2E");
      await accountDialog.getByLabel("Saldo inicial").fill("0");
      await accountDialog.getByRole("button", { name: "Salvar conta" }).click();
      await expect(page.getByText("Conta principal E2E")).toBeVisible();
      await page.getByRole("button", { name: "Nova conta" }).click();
      await accountDialog.getByLabel("Nome").fill("Conta destino E2E");
      await accountDialog.getByRole("button", { name: "Salvar conta" }).click();
      await expect(page.getByText("Conta destino E2E")).toBeVisible();

      // GIVEN: The same authenticated user on categories.
      // WHEN: It creates a category through the Nest-backed mutation.
      await page.goto("/dashboard/categories");
      await page.getByRole("button", { name: /^adicionar$/i }).click();
      const categoryDialog = page.getByRole("dialog");
      await categoryDialog.getByLabel("Nome").fill("Categoria E2E");
      const categoryResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/backend/categories/create") &&
          response.request().method() === "POST"
      );
      await categoryDialog.getByRole("button", { name: "Adicionar", exact: true }).click();
      const categoryResponse = await categoryResponsePromise;
      expect(await categoryResponse.json()).toMatchObject({ success: true });
      await expect(page.getByText("Categoria E2E")).toBeVisible();

      // GIVEN: Two accounts and one expense category.
      // WHEN: The user creates a transaction, then edits its account and amount.
      await page.goto("/dashboard/transactions");
      await page.getByRole("button", { name: "Adicionar Transação" }).click();
      const transactionDialog = page.getByRole("dialog");
      await transactionDialog.getByLabel("Descrição").fill("Transação E2E");
      await transactionDialog.getByLabel("Valor").fill("100");
      await transactionDialog.locator("#category").click();
      await page.getByRole("option", { name: "Categoria E2E" }).click();
      await transactionDialog.locator("#account").click();
      await page.getByRole("option", { name: "Conta principal E2E" }).click();
      const transactionResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/backend/transactions/create") &&
          response.request().method() === "POST"
      );
      await transactionDialog.getByRole("button", { name: /Adicionar/ }).click();
      const transactionResponse = await transactionResponsePromise;
      expect(await transactionResponse.json()).toMatchObject({ success: true });
      await expect(page.getByRole("cell").filter({ hasText: "E2E" })).toBeVisible({
        timeout: 30_000,
      });
      // WHEN: The dashboard and reports queries are hydrated through the proxy.
      const dashboardResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/backend/dashboard/data") && response.ok()
      );
      const breakdownResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/backend/dashboard/expense-breakdown") && response.ok()
      );
      await page.goto("/dashboard");
      const dashboardPayload = await (await dashboardResponsePromise).json();
      const breakdownPayload = await (await breakdownResponsePromise).json();
      expect(dashboardPayload).toMatchObject({
        success: true,
        data: { monthlyExpenses: 100, expenseCount: 1, maxExpense: 100 },
      });
      expect(breakdownPayload).toMatchObject({
        success: true,
        data: [{ name: "Categoria E2E", value: 100 }],
      });
      await expect(page.getByText("Saldo Total")).toBeVisible();
      await expect(page.getByText("Despesas por Categoria")).toBeVisible();

      const reportsResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/backend/reports/overview") && response.ok()
      );
      await page.goto("/dashboard/reports");
      const reportsPayload = await (await reportsResponsePromise).json();
      expect(reportsPayload).toMatchObject({
        success: true,
        data: {
          monthlyData: expect.any(Array),
          expenseData: [{ name: "Categoria E2E", value: 100 }],
        },
      });
      await expect(page.getByText("Receitas vs Despesas")).toBeVisible();
      await expect(page.getByText("Despesa por Categoria")).toBeVisible();

      await page.goto("/dashboard/exports");
      await page.getByRole("button", { name: "Exportar" }).first().click();
      const csvResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/backend/export/file") && response.ok()
      );
      const csvDownloadPromise = page.waitForEvent("download");
      await page.getByRole("dialog").getByRole("button", { name: "Exportar", exact: true }).click();
      const [csvResponse, csvDownload] = await Promise.all([
        csvResponsePromise,
        csvDownloadPromise,
      ]);
      expect(csvResponse.headers()["content-type"]).toMatch(/text\/csv/u);
      expect(csvResponse.headers()["content-disposition"]).toMatch(/\.csv/u);
      expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/u);
      const csvPath = await csvDownload.path();
      if (!csvPath) throw new Error("CSV download path was not created");
      expect(await readFile(csvPath, "utf8")).toContain("E2E");

      await page.getByRole("button", { name: "Exportar" }).first().click();
      await page.getByLabel("PDF").check();
      const pdfResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/backend/export/file") && response.ok()
      );
      const pdfDownloadPromise = page.waitForEvent("download");
      await page.getByRole("dialog").getByRole("button", { name: "Exportar", exact: true }).click();
      const [pdfResponse, pdfDownload] = await Promise.all([
        pdfResponsePromise,
        pdfDownloadPromise,
      ]);
      expect(pdfResponse.headers()["content-type"]).toMatch(/application\/pdf/u);
      expect(pdfResponse.headers()["content-disposition"]).toMatch(/\.pdf/u);
      expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/u);
      const pdfPath = await pdfDownload.path();
      if (!pdfPath) throw new Error("PDF download path was not created");
      expect((await readFile(pdfPath)).subarray(0, 5).toString()).toBe("%PDF-");
      await page.goto("/dashboard/transactions");
      await expect(page.getByRole("cell").filter({ hasText: "E2E" })).toBeVisible({
        timeout: 30_000,
      });
      const transactionRow = page.getByRole("row").filter({ hasText: "Transação E2E" });
      await transactionRow.getByRole("button", { name: "Abrir menu" }).click();
      await page.getByRole("menuitem", { name: "Editar" }).click();
      const editDialog = page.getByRole("dialog");
      await editDialog.getByLabel("Valor").fill("50");
      await editDialog.locator("#account").click();
      await page.getByRole("option", { name: "Conta destino E2E" }).click();
      await editDialog.getByRole("button", { name: "Atualizar Transação" }).click();
      await expect(page.getByRole("cell").filter({ hasText: "E2E" })).toBeVisible();

      // GIVEN: A completed core financial flow.
      // WHEN: The user signs out through the navigation UI.
      await page.getByRole("button", { name: email.slice(0, 2).toUpperCase() }).click();
      await page.getByRole("menuitem", { name: "Sair" }).dispatchEvent("click");

      // THEN: The application returns to login without retaining the authenticated session.
      await page.waitForURL(/\/login(?:\?|$)/u);
      await expect(page.getByRole("button", { name: /entrar com email/i })).toBeVisible();
    } finally {
      await deleteLocalUserByEmail(email);
    }
  });
});
