import { expect, type Page, test } from "@playwright/test";
import { deleteLocalUserByEmail } from "./helpers/local-supabase";

const password = "LocalFinanceE2E!42";

function createEmail(projectName: string): string {
  return `investments-${projectName}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

async function registerThroughLoginPage(email: string, page: Page): Promise<void> {
  await page.goto("/login");
  await expect(page.getByTestId("e2e-recaptcha-ready")).toBeVisible();
  await page.getByRole("button", { name: /n.*tem uma conta/i }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await page.waitForURL(/\/dashboard(?:\?|$)/u);
}

async function expectMutation(
  page: Page,
  path: string,
  action: () => Promise<void>
): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(path) && response.request().method() !== "GET"
  );
  await action();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ success: true });
}

test.describe("local investments", () => {
  test("creates, moves, reads history, and deletes an investment through Nest", async ({
    page,
  }, testInfo) => {
    const email = createEmail(testInfo.project.name);

    try {
      await registerThroughLoginPage(email, page);
      await page.goto("/dashboard/investimentos");

      await page
        .getByRole("button", {
          name: /Criar Primeiro Investimento|Novo Investimento|Criar Investimento/,
        })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Nome").fill("Investimento E2E");
      await dialog.getByText("Selecione uma categoria").click();
      await page.getByRole("option", { name: /Renda Fixa/i }).click();
      await dialog.getByPlaceholder("R$ 0,00").first().fill("10000");
      await expectMutation(page, "/api/backend/investments/create", () =>
        dialog.getByRole("button", { name: "Salvar" }).click()
      );
      await expect(page.getByText("Investimento E2E", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: /Registrar movimenta/ }).click();
      const movementDialog = page.getByRole("dialog");
      await movementDialog.getByPlaceholder("R$ 0,00").fill("2500");
      await expectMutation(page, "/api/backend/investment-transactions", () =>
        movementDialog.getByRole("button", { name: "Registrar" }).click()
      );

      await page.getByRole("button", { name: /Ver hist/ }).click();
      await expect(page.getByRole("dialog").getByText(/R\$\s*25,00/u)).toBeVisible();
      await page.keyboard.press("Escape");

      page.once("dialog", (browserDialog) => browserDialog.accept());
      await expectMutation(page, "/api/backend/investments/delete", () =>
        page.getByRole("button", { name: "Excluir investimento" }).click()
      );
      await expect(page.getByText("Investimento E2E", { exact: true })).not.toBeVisible();
    } finally {
      await deleteLocalUserByEmail(email);
    }
  });
});
