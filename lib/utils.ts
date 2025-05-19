import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function currencyToNumber(value: string): number {
  // Remove todos os caracteres não numéricos, exceto o ponto decimal
  const numericValue = value.replace(/[^\d,]/g, "").replace(",", ".");

  // Converte para número e multiplica por 100 para armazenar em centavos
  return Math.round(Number.parseFloat(numericValue || "0") * 100);
}

export function formatInputCurrency(value: string): string {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  // Converte para número
  const number = Number.parseInt(numericValue || "0", 10);

  // Formata como moeda (R$ 0,00)
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(number / 100);
}

export function normalizeDate(date: Date | string): Date {
  const d = new Date(date);
  // Ajusta para UTC-3 (Brasil) e zera horas, minutos e segundos
  d.setHours(0, 0, 0, 0);
  return d;
}
