import type { FAQPage, Organization, WebPage, WebSite } from "schema-dts";
import { brand } from "@/lib/brand";

export const organizationData: Organization = {
  "@type": "Organization",
  name: brand.name,
  url: brand.url,
  logo: `${brand.url}/brand/ajeitagrana-512.png`,
  email: brand.contacts.general,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: brand.contacts.general,
    availableLanguage: "pt-BR",
  },
};

export const websiteData: WebSite = {
  "@type": "WebSite",
  name: brand.name,
  url: brand.url,
  description: brand.description,
  inLanguage: "pt-BR",
};

export const faqData: FAQPage = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é o AjeitaGrana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O AjeitaGrana é uma ferramenta de organização financeira pessoal para registrar contas, gastos, metas, cofrinhos e investimentos em um só lugar.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso conectar minha conta bancária?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. O AjeitaGrana funciona com os dados que você escolhe registrar. Não é necessário compartilhar credenciais bancárias para começar.",
      },
    },
    {
      "@type": "Question",
      name: "Como meus dados são tratados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O acesso é protegido por autenticação e as informações ficam disponíveis para a sua conta. Você pode consultar a política de privacidade para conhecer os detalhes.",
      },
    },
    {
      "@type": "Question",
      name: "Posso começar sem uma planilha pronta?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. Você pode começar com uma conta e poucos movimentos, depois adicionar categorias, metas e investimentos conforme a sua necessidade.",
      },
    },
  ],
};

export const createWebPageData = (
  title: string,
  description: string,
  path: string,
  breadcrumbs: Array<{ name: string; path: string }>
): WebPage => ({
  "@type": "WebPage",
  name: title,
  description,
  url: brand.url + path,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: brand.name, item: brand.url },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: crumb.name,
        item: brand.url + crumb.path,
      })),
    ],
  },
});
