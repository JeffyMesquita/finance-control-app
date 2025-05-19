"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Shield,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Clock,
} from "lucide-react"
import { motion } from "framer-motion"

export function LandingPage() {
  const currentYear = new Date().getFullYear()

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-6 w-6" />
          <span>FinanceTrack</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Cadastrar</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.3 } },
              }}
            >
              <motion.div className="flex flex-col justify-center space-y-4" variants={fadeIn}>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Assuma o Controle das Suas Finanças
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Acompanhe despesas, monitore receitas e visualize sua saúde financeira com nosso sistema completo de
                    gestão financeira.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="gap-1.5">
                      Comece Agora
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div className="flex items-center justify-center" variants={fadeIn}>
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-4 shadow-sm">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Controle de Despesas</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Categorize e monitore todas as suas despesas em um só lugar.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-4 shadow-sm">
                    <PieChart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Análise de Orçamento</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Visualize padrões de gastos e identifique oportunidades de economia.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-4 shadow-sm">
                    <LineChart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Relatórios Financeiros</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Gere relatórios detalhados para acompanhar seu progresso financeiro.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-4 shadow-sm">
                    <Shield className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Armazenamento Seguro</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Mantenha seus dados financeiros seguros com nossa plataforma protegida.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Como o FinanceTrack Funciona
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Nossa plataforma foi projetada para simplificar o gerenciamento financeiro pessoal
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Registre Transações</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Adicione receitas e despesas facilmente com categorização automática.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Visualize Relatórios</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Obtenha insights visuais sobre seus hábitos financeiros e tendências.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Defina Metas</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Estabeleça objetivos financeiros e acompanhe seu progresso ao longo do tempo.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="w-full py-12 md:py-24 lg:py-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Recursos</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Tudo o que você precisa para gerenciar suas finanças
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  O FinanceTrack oferece uma suíte completa de ferramentas para ajudá-lo a tomar decisões financeiras
                  mais inteligentes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">
                      Experimente Grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Categorização Inteligente</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Organize automaticamente suas transações em categorias personalizáveis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Orçamentos Personalizados</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Crie limites de gastos para diferentes categorias e receba alertas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Metas Financeiras</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Defina objetivos de economia e acompanhe seu progresso visualmente.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Relatórios Detalhados</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Analise seus gastos com gráficos e relatórios personalizáveis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Acesse de Qualquer Lugar
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  O FinanceTrack está disponível em todos os seus dispositivos
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-primary" />
                      <div className="font-medium">Responsivo em Dispositivos Móveis</div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      <div className="font-medium">Sincronização em Tempo Real</div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-primary" />
                      <div className="font-medium">Dados Criptografados</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl border bg-muted/50 object-cover object-center sm:w-full lg:order-last">
                {/* Espaço para imagem da aplicação */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Imagem da aplicação em dispositivos</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {currentYear} FinanceTrack. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/termos-de-servico" className="text-xs hover:underline underline-offset-4">
            Termos de Serviço
          </Link>
          <Link href="/politica-de-privacidade" className="text-xs hover:underline underline-offset-4">
            Política de Privacidade
          </Link>
          <a
            href="https://github.com/JeffyMesquita"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline underline-offset-4"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline underline-offset-4"
          >
            LinkedIn
          </a>
        </nav>
      </footer>
    </div>
  )
}
