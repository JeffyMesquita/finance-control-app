import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountsManager } from "./accounts-manager";

const refetch = vi.fn();

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/useCases/accounts/useAccountsQuery", () => ({
  useAccountsQuery: () => ({
    data: { data: [] },
    isError: false,
    isLoading: false,
    refetch,
  }),
}));

vi.mock("@/useCases/accounts/useCreateAccountMutation", () => ({
  useCreateAccountMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/useCases/accounts/useUpdateAccountMutation", () => ({
  useUpdateAccountMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/useCases/accounts/useDeleteAccountMutation", () => ({
  useDeleteAccountMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe("AccountsManager", () => {
  it("opens the account form from the empty state", () => {
    // GIVEN: An authenticated user with no accounts.
    render(<AccountsManager />);

    // WHEN: The user starts the first account creation.
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    // THEN: The UI exposes the typed financial account form.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeRequired();
    expect(screen.getByLabelText("Saldo inicial")).toHaveValue(0);
    expect(screen.getByRole("button", { name: "Salvar conta" })).toBeEnabled();
  });
});
