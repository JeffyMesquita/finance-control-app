"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface CurrencyInputProps {
  id?: string
  name?: string
  value: number
  onValueChange: (value: number | null) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function CurrencyInput({
  id,
  name,
  value,
  onValueChange,
  placeholder = "R$ 0,00",
  required = false,
  disabled = false,
  className = "",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Formatar o valor inicial
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const formatted = formatCurrency(value)
      setDisplayValue(formatted)
    } else {
      setDisplayValue("")
    }
  }, [value])

  // Formatar o valor como moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Converter string formatada para número
  const parseCurrency = (value: string): number | null => {
    // Remover todos os caracteres não numéricos, exceto o ponto decimal
    const numericValue = value.replace(/[^0-9]/g, "")

    if (!numericValue) return null

    // Converter para centavos e depois para reais
    return Number.parseInt(numericValue, 10) / 100
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Remover formatação para processamento
    const numericValue = parseCurrency(inputValue)

    // Atualizar o valor no estado pai
    onValueChange(numericValue)

    // Atualizar o valor exibido
    if (numericValue !== null) {
      setDisplayValue(formatCurrency(numericValue))
    } else {
      setDisplayValue("")
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Selecionar todo o texto ao focar
    e.target.select()
  }

  return (
    <Input
      id={id}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      inputMode="numeric"
    />
  )
}
