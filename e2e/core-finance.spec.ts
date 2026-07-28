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

      // GIVEN: An authenticated user on the accounts screen.
      // WHEN: It creates and updates two accounts through TanStack-powered UI.
      await page.goto("/dashboard/contas");
      await page.getByRole("button", { name: /nova conta|criar conta/i }).click();
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
      await categoryDialog.getByRole("button", { name: "Adicionar", exact: true }).click();
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
      await transactionDialog.getByRole("button", { name: "Adicionar Transação" }).click();
      await expect(page.getByText("Transação E2E")).toBeVisible();

      const transactionRow = page.getByRole("row").filter({ hasText: "Transação E2E" });
      await transactionRow.getByRole("button", { name: "Editar" }).click();
      const editDialog = page.getByRole("dialog");
      await editDialog.getByLabel("Valor").fill("50");
      await editDialog.locator("#account").click();
      await page.getByRole("option", { name: "Conta destino E2E" }).click();
      await editDialog.getByRole("button", { name: "Atualizar Transação" }).click();
      await expect(page.getByText("Transação E2E")).toBeVisible();

      // GIVEN: A completed core financial flow.
      // WHEN: The user signs out through the navigation UI.
      await page.getByRole("button", { name: email.slice(0, 2).toUpperCase() }).click();
      await page.getByRole("menuitem", { name: "Sair" }).click();

      // THEN: The application returns to login without retaining the authenticated session.
      await page.waitForURL(/\/login(?:\?|$)/u);
      await expect(page.getByRole("button", { name: /entrar com email/i })).toBeVisible();
    } finally {
      await deleteLocalUserByEmail(email);
    }
  });
});
