"use client"

import type React from "react"

import { useState, useEffect, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { formatInputCurrency, currencyToNumber } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number
  onChange: (value: number) => void
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({ value, onChange, ...props }, ref) => {
  const [displayValue, setDisplayValue] = useState("")

  useEffect(() => {
    // Quando o valor externo muda, atualiza o valor de exibição
    if (value !== undefined) {
      const numValue = typeof value === "string" ? Number.parseFloat(value) : value
      setDisplayValue(formatInputCurrency(String(numValue * 100)))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputCurrency(e.target.value)
    setDisplayValue(formatted)

    // Converte o valor formatado para número em centavos e chama o onChange
    const numericValue = currencyToNumber(formatted)
    onChange(numericValue)
  }

  return <Input ref={ref} type="text" value={displayValue} onChange={handleChange} {...props} />
})

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
