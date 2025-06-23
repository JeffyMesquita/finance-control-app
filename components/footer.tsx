import Link from "next/link";
import { Logo } from "./logo";
import { Github, Linkedin, Mail, Instagram, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo dark className="h-14 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Sua solução completa para gerenciamento financeiro pessoal.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Transações
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Relatórios
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Metas
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Carreiras
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/termos-de-servico"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-muted-foreground hover:text-forest-green-700"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {currentYear} FinanceTrack. Todos os direitos reservados.
            </p>
            <span className="flex items-center gap-1 text-xs text-center">
              Desenvolvido por
              <a
                href="https://jeffymesquita.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-forest-green-700 hover:underline ml-1"
              >
                Jeferson Mesquita
              </a>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 rounded-lg p-3 bg-foreground/5 border border-border">
            <a
              href="https://github.com/JeffyMesquita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-forest-green-700 hover:text-forest-green-800 text-base min-w-[60px]"
            >
              <Github size={22} />
              <span className="text-xs hidden sm:block">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-forest-green-700 hover:text-forest-green-800 text-base min-w-[60px]"
            >
              <Linkedin size={22} />
              <span className="text-xs hidden sm:block">LinkedIn</span>
            </a>
            <a
              href="mailto:je_2742@hotmail.com"
              className="flex flex-col items-center gap-1 text-forest-green-700 hover:text-forest-green-800 text-base min-w-[60px]"
            >
              <Mail size={22} />
              <span className="text-xs hidden sm:block">E-mail</span>
            </a>
            <a
              href="https://instagram.com/jeferson.mesquita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-forest-green-700 hover:text-forest-green-800 text-base min-w-[60px]"
            >
              <Instagram size={22} />
              <span className="text-xs hidden sm:block">Instagram</span>
            </a>
            <a
              href="tel:+5517991305254"
              className="flex flex-col items-center gap-1 text-forest-green-700 hover:text-forest-green-800 text-base min-w-[60px]"
            >
              <Phone size={22} />
              <span className="text-xs hidden sm:block">Telefone</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
