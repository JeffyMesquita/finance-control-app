import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency as utilFormatCurrency, formatDate } from "@/lib/utils"

// Helper function to convert data to CSV format
export function convertToCSV(data: any[], headers: string[], fields: string[]) {
  // Create header row
  let csvContent = headers.join(",") + "\n"

  // Add data rows
  data.forEach((item) => {
    const row = fields.map((field) => {
      // Handle nested fields (e.g., "account.name")
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ""), item)
        : item[field]

      // Format the value and escape commas
      let formattedValue = value

      // Format dates
      if (field === "date" || field.endsWith("_date")) {
        formattedValue = formatDate(value)
      }

      // Format currency values
      if (field === "amount" || field === "balance" || field.includes("_amount")) {
        formattedValue = utilFormatCurrency(value, undefined, false)
      }

      // Convert to string and escape quotes
      return typeof formattedValue === "string" ? `"${formattedValue.replace(/"/g, '""')}"` : formattedValue
    })
    csvContent += row.join(",") + "\n"
  })

  return csvContent
}

// Helper function to download CSV
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Helper function to generate PDF
export function generatePDF(
  data: any[],
  headers: string[],
  fields: string[],
  title: string,
  filename: string,
  orientation: "portrait" | "landscape" = "portrait",
) {
  // Create new PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 14, 30)

  // Prepare table data
  const tableData = data.map((item) => {
    return fields.map((field) => {
      // Handle nested fields (e.g., "account.name")
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ""), item)
        : item[field]

      // Format dates
      if (field === "date" || field.endsWith("_date")) {
        return formatDate(value)
      }

      // Format currency values
      if (field === "amount" || field === "balance" || field.includes("_amount")) {
        return utilFormatCurrency(value, undefined, false)
      }

      return value
    })
  })

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  })

  // Save PDF
  doc.save(filename)
}

// Função para exportar dados para CSV
export function exportToCSV(data: any[], headers: string[], fields: string[], filename: string) {
  const csvContent = convertToCSV(data, headers, fields)
  downloadCSV(csvContent, filename)
}

// Função para exportar dados para PDF
export function exportToPDF(
  data: any[],
  headers: string[],
  fields: string[],
  title: string,
  filename: string,
  orientation: "portrait" | "landscape" = "portrait",
) {
  generatePDF(data, headers, fields, title, filename, orientation)
}
