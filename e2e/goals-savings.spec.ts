import { expect, type Page, test } from "@playwright/test";

import { deleteLocalUserByEmail } from "./helpers/local-supabase";

const password = "LocalFinanceE2E!42";

function createEmail(projectName: string): string {
  return `goals-savings-${projectName}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
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
): Promise<Record<string, unknown>> {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(path) && response.request().method() !== "GET"
  );
  await action();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as Record<string, unknown>;
  expect(payload).toMatchObject({ success: true });
  return payload;
}

test.describe("local goals and savings boxes", () => {
  test("runs the owned atomic goals and savings journey", async ({ page }, testInfo) => {
    const email = createEmail(testInfo.project.name);

    try {
      await registerThroughLoginPage(email, page);

      await page.goto("/dashboard/contas");
      await expect(page.getByRole("button", { name: "Nova conta", exact: true })).toBeVisible({
        timeout: 30_000,
      });
      await page.getByRole("button", { name: "Nova conta", exact: true }).click();
      const accountDialog = page.getByRole("dialog");
      await accountDialog.getByLabel("Nome").fill("Conta metas E2E");
      // Account balances are persisted in cents by the legacy-compatible contract.
      await accountDialog.getByLabel("Saldo inicial").fill("100000");
      await accountDialog.getByRole("button", { name: "Salvar conta" }).click();
      await expect(page.getByText("Conta metas E2E", { exact: true }).first()).toBeVisible();

      await page.goto("/dashboard/cofrinhos");
      await page
        .getByRole("button", { name: /Criar Primeiro Cofrinho|Novo Cofrinho/ })
        .first()
        .click();
      let savingsDialog = page.getByRole("dialog");
      await savingsDialog.locator('input[name="name"]').fill("Cofrinho origem E2E");
      await savingsDialog.getByLabel("Meta (opcional)").fill("500");
      await expectMutation(page, "/api/backend/savings-boxes/create", () =>
        savingsDialog.getByRole("button", { name: "Criar Cofrinho" }).click()
      );
      await expect(
        page.getByRole("heading", { name: "Cofrinho origem E2E", exact: true })
      ).toBeVisible();

      await page.getByRole("button", { name: "Novo Cofrinho" }).click();
      savingsDialog = page.getByRole("dialog");
      await savingsDialog.locator('input[name="name"]').fill("Cofrinho destino E2E");
      await savingsDialog.getByLabel("Meta (opcional)").fill("500");
      await expectMutation(page, "/api/backend/savings-boxes/create", () =>
        savingsDialog.getByRole("button", { name: "Criar Cofrinho" }).click()
      );
      await expect(
        page.getByRole("heading", { name: "Cofrinho destino E2E", exact: true })
      ).toBeVisible();

      await page.goto("/dashboard/goals");
      await page
        .getByRole("button", { name: /Criar Primeira Meta|Criar Meta/ })
        .first()
        .click();
      const goalDialog = page.getByRole("dialog");
      await goalDialog.locator('input[name="name"]').fill("Meta emergência E2E");
      await goalDialog.locator('input[name="target_amount"]').fill("500");
      await goalDialog.locator("#account").click();
      await page.getByRole("option", { name: "Conta metas E2E" }).click();
      await expectMutation(page, "/api/backend/goals/create", () =>
        goalDialog.getByRole("button", { name: "Criar Meta" }).click()
      );
      await expect(
        page.getByRole("heading", { name: "Meta emergência E2E", exact: true })
      ).toBeVisible();

      await page.getByRole("button", { name: "Vincular Cofrinho" }).click();
      const linkDialog = page.getByRole("dialog");
      await linkDialog.locator("#savings_box").click();
      await page.getByRole("option", { name: "Cofrinho origem E2E" }).click();
      await expectMutation(page, "/api/backend/goals/link-savings-box", () =>
        linkDialog.getByRole("button", { name: "Vincular Meta" }).click()
      );

      await page.goto("/dashboard/cofrinhos");
      await expect(
        page.getByRole("heading", { name: "Cofrinho origem E2E", exact: true })
      ).toBeVisible();
      await page.getByRole("button", { name: "Depositar" }).first().click();
      let movementDialog = page.getByRole("dialog");
      await movementDialog.locator('input[name="amount"]').fill("100");
      await expectMutation(page, "/api/backend/savings-boxes/", () =>
        movementDialog.getByRole("button", { name: "Depositar", exact: true }).click()
      );

      await page.getByRole("button", { name: "Transferir" }).first().click();
      movementDialog = page.getByRole("dialog");
      await movementDialog.locator("#to_box_id").click();
      await page.getByRole("option", { name: "Cofrinho destino E2E" }).click();
      await movementDialog.locator('input[name="amount"]').fill("25");
      await expectMutation(page, "/api/backend/savings-boxes/", () =>
        movementDialog.getByRole("button", { name: "Confirmar Transferência" }).click()
      );

      await page.getByRole("button", { name: "Sacar" }).first().click();
      movementDialog = page.getByRole("dialog");
      await movementDialog.locator('input[name="amount"]').fill("10");
      await expectMutation(page, "/api/backend/savings-boxes/", () =>
        movementDialog.getByRole("button", { name: "Sacar", exact: true }).click()
      );

      await page.goto("/dashboard/goals");
      await page.getByRole("button", { name: "Contribuir" }).click();
      const contributionDialog = page.getByRole("dialog");
      await contributionDialog.locator('input[name="amount"]').fill("25");
      await expectMutation(page, "/api/backend/goals/", () =>
        contributionDialog.getByRole("button", { name: /Contribuir/ }).click()
      );

      const snapshot = await page.evaluate(async () => {
        const [boxesResponse, goalsResponse, movementsResponse] = await Promise.all([
          fetch("/api/backend/savings-boxes/list?limit=100", { credentials: "include" }),
          fetch("/api/backend/goals/list?limit=100", { credentials: "include" }),
          fetch("/api/backend/savings-transactions?limit=100", { credentials: "include" }),
        ]);
        return {
          boxes: await boxesResponse.json(),
          goals: await goalsResponse.json(),
          movements: await movementsResponse.json(),
        };
      });

      expect(snapshot.boxes).toMatchObject({ success: true, data: expect.any(Array) });
      expect(snapshot.goals).toMatchObject({ success: true, data: expect.any(Array) });
      expect(snapshot.movements).toMatchObject({ success: true, data: expect.any(Array) });
      expect(
        (snapshot.boxes as { data: Array<{ name: string; current_amount: number }> }).data
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Cofrinho origem E2E", current_amount: 9_000 }),
          expect.objectContaining({ name: "Cofrinho destino E2E", current_amount: 2_500 }),
        ])
      );
      expect(
        (snapshot.goals as { data: Array<{ name: string; savings_box_id: string | null }> }).data
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Meta emergência E2E",
            savings_box_id: expect.any(String),
          }),
        ])
      );
      expect((snapshot.movements as { data: Array<unknown> }).data).toHaveLength(4);

      await page.getByRole("button", { name: email.slice(0, 2).toUpperCase() }).click();
      await page.getByRole("menuitem", { name: "Sair" }).dispatchEvent("click");
      await page.waitForURL(/\/login(?:\?|$)/u);
    } finally {
      await deleteLocalUserByEmail(email);
    }
  });
});
