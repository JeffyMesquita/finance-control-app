import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  depositToSavingsBox: vi.fn(),
  withdrawFromSavingsBox: vi.fn(),
  transferBetweenBoxes: vi.fn(),
  getInvestmentTransactions: vi.fn(),
}));

vi.mock("@/app/actions/savings-transactions", () => ({
  depositToSavingsBox: mocks.depositToSavingsBox,
  withdrawFromSavingsBox: mocks.withdrawFromSavingsBox,
  transferBetweenBoxes: mocks.transferBetweenBoxes,
}));
vi.mock("@/app/actions/investments", () => ({
  getInvestmentTransactions: mocks.getInvestmentTransactions,
}));
vi.mock("@/lib/api/rollout", () => ({
  isNestDomainEnabled: () => false,
}));
vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
  apiPaginatedRequest: vi.fn(),
}));

import { getInvestmentTransactions } from "@/app/actions/investments";
import { fetchInvestmentTransactions } from "@/lib/api/investments";
import { mutateMovement } from "@/useCases/savings-boxes/useSavingsTransactionMutation";

describe("legacy migration fallbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the existing savings action when the Nest flag is disabled", async () => {
    const data = { id: "movement-1" } as never;
    mocks.depositToSavingsBox.mockResolvedValue({ success: true, data });

    await expect(
      mutateMovement("deposits", {
        boxId: "box-1",
        amount: 25,
        account_id: "account-1",
        description: "Reserva",
      })
    ).resolves.toBe(data);

    expect(mocks.depositToSavingsBox).toHaveBeenCalledWith("box-1", 25, "account-1", "Reserva");
  });

  it("rejects a transfer fallback without a destination box", async () => {
    await expect(mutateMovement("transfers", { boxId: "box-1", amount: 25 })).rejects.toThrow(
      "Cofrinho de destino"
    );
    expect(mocks.transferBetweenBoxes).not.toHaveBeenCalled();
  });

  it("uses the existing investment action for legacy transaction history", async () => {
    const data = [
      {
        id: "movement-1",
        investment_id: "investment-1",
        user_id: "user-1",
        type: "aporte",
        amount: 100,
        transaction_date: "2026-01-01",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    mocks.getInvestmentTransactions.mockResolvedValue({ success: true, data });

    await expect(fetchInvestmentTransactions({ investment_id: "investment-1" })).resolves.toEqual(
      data
    );
    expect(getInvestmentTransactions).toHaveBeenCalledWith("investment-1");
  });
});
