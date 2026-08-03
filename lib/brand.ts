export const brand = {
  name: "AjeitaGrana",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://ajeitagrana.jeffymesquita.dev",
  tagline: "Ajeite sua grana. Faça seus planos avançarem.",
  description:
    "Organize contas, gastos, metas, cofrinhos e investimentos em um só lugar, com clareza e sem planilha.",
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
