import { useState, useCallback } from "react";
import { useDebounceCallback } from "./use-debounce";

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface UseCepSearchReturn {
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  data: CepData | null;
  searchCep: (cep: string) => void;
  clearError: () => void;
  cancelSearch: () => void;
}

export function useCepSearch(delay: number = 800): UseCepSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CepData | null>(null);

  const searchCepApi = useCallback(async (cep: string) => {
    // Limpa estados anteriores
    setError(null);
    setIsLoading(true);

    try {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        throw new Error("CEP deve conter exatamente 8 dígitos");
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const cepData: CepData = await response.json();

      if (cepData.erro) {
        throw new Error("CEP não encontrado. Verifique se o CEP está correto.");
      }

      setData(cepData);
      return cepData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao buscar CEP";
      setError(errorMessage);
      setData(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    debouncedCallback: debouncedSearch,
    cancel,
    isPending,
  } = useDebounceCallback(searchCepApi, delay);

  const searchCep = useCallback(
    (cep: string) => {
      if (!cep || cep.trim() === "") {
        setData(null);
        setError(null);
        return;
      }

      // Remove caracteres não numéricos para validação
      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length < 8) {
        // Não faz busca se o CEP está incompleto
        setData(null);
        setError(null);
        return;
      }

      if (cleanCep.length > 8) {
        setError("CEP deve conter no máximo 8 dígitos");
        return;
      }

      // Limpa erro anterior e faz a busca
      setError(null);
      debouncedSearch(cep);
    },
    [debouncedSearch]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelSearch = useCallback(() => {
    cancel();
    setIsLoading(false);
    setError(null);
  }, [cancel]);

  return {
    isLoading,
    isSearching: isPending(),
    error,
    data,
    searchCep,
    clearError,
    cancelSearch,
  };
}
