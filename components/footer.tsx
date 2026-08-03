import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { Logo } from "./logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#dce5de] bg-[#f7f8f4] px-4 py-12 text-[#162019] md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <Link href="/" aria-label="AjeitaGrana — início">
            <Logo dark className="h-10" />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#526158]">
            Organização financeira pessoal para quem quer avançar com mais clareza e menos peso.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Produto</p>
          <div className="mt-4 grid gap-3 text-sm text-[#526158]">
            <Link className="transition-colors hover:text-[#047857]" href="/login">
              Entrar
            </Link>
            <Link className="transition-colors hover:text-[#047857]" href="/login?mode=register">
              Começar grátis
            </Link>
            <Link className="transition-colors hover:text-[#047857]" href="#como-funciona">
              Como funciona
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Transparência</p>
          <div className="mt-4 grid gap-3 text-sm text-[#526158]">
            <Link
              className="transition-colors hover:text-[#047857]"
              href="/politica-de-privacidade"
            >
              Política de privacidade
            </Link>
            <Link className="transition-colors hover:text-[#047857]" href="/termos-de-servico">
              Termos de serviço
            </Link>
            <a
              className="transition-colors hover:text-[#047857]"
              href={`mailto:${brand.contacts.general}`}
            >
              Fale com a gente
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-[#dce5de] pt-6 text-xs text-[#526158] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {currentYear} {brand.name}. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <a
            aria-label="GitHub de Jeferson Mesquita"
            href="https://github.com/JeffyMesquita"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4 transition-colors hover:text-[#047857]" />
          </a>
          <a
            aria-label="LinkedIn de Jeferson Mesquita"
            href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/"
            rel="noreferrer"
            target="_blank"
          >
            <Linkedin className="h-4 w-4 transition-colors hover:text-[#047857]" />
          </a>
          <a aria-label="Enviar e-mail" href={`mailto:${brand.contacts.general}`}>
            <Mail className="h-4 w-4 transition-colors hover:text-[#047857]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
