export const brand = {
  name: "AjeitaGrana",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://ajeitagrana.jeffymesquita.dev",
  description:
    "Contas, gastos, metas, cofrinhos e investimentos em um só lugar — sem planilha e sem complicação.",
  contacts: {
    general: "je_2742@hotmail.com",
    privacy: "jefejefe274227@gmail.com",
  },
  colors: {
    charcoal: "#162019",
    offWhite: "#F7F8F4",
    emerald: "#047857",
  },
} as const;
