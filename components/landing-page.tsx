"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { motion, useAnimation } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  CreditCard,
  LineChart,
  PieChart,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Logo } from "./logo";
import { useSearchParams } from "next/navigation";

export function LandingPage() {
  const params = useSearchParams();
  const referralId = params.get("ref");

  console.log(referralId, "referralId");

  if (referralId) {
    localStorage.setItem("referralId", referralId);
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemFade = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Hook para animação baseada em scroll
  function AnimatedSection({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) {
    const controls = useAnimation();
    const [ref, inView] = useInView({
      threshold: 0.2,
      triggerOnce: true,
    });

    useEffect(() => {
      if (inView) {
        controls.start("visible");
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={fadeInUp}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo dark className="h-12 w-auto" />
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

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                className="flex flex-col justify-center space-y-4"
                variants={itemFade}
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Assuma o Controle das Suas Finanças
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Acompanhe despesas, monitore receitas e visualize sua saúde
                    financeira com nosso sistema completo de gestão financeira.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/login">
                    <Button size="lg" className="gap-1.5">
                      Comece Agora
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#recursos">
                    <Button size="lg" variant="outline">
                      Conheça os Recursos
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                variants={itemFade}
                className="relative mx-auto w-full max-w-[500px]"
              >
                {/* Imagens sobrepostas em formato triangular */}
                <div className="relative h-[350px] w-full">
                  {/* Imagem 1 (frente) */}
                  <div className="absolute top-0 left-0 w-[280px] h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl overflow-hidden shadow-xl z-30 transform -rotate-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Dashboard de Finanças
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Imagem 2 (meio) */}
                  <div className="absolute top-[60px] left-[40px] w-[280px] h-[200px] bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl overflow-hidden shadow-xl z-20 transform rotate-3">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <PieChart className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Análise de Gastos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Imagem 3 (fundo) */}
                  <div className="absolute top-[120px] left-[80px] w-[280px] h-[200px] bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl overflow-hidden shadow-xl z-10 transform rotate-12">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Metas Financeiras
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <AnimatedSection className="w-full py-20 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Recursos Poderosos para Suas Finanças
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Tudo o que você precisa para gerenciar seu dinheiro de forma
                  inteligente
                </p>
              </div>
            </div>

            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                variants={itemFade}
                className="flex flex-col items-center gap-2 rounded-lg bg-card p-6 shadow-sm"
              >
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Controle de Despesas</h3>
                <p className="text-center text-muted-foreground">
                  Categorize e monitore todas as suas despesas em um só lugar.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="flex flex-col items-center gap-2 rounded-lg bg-card p-6 shadow-sm"
              >
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <PieChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Análise de Orçamento</h3>
                <p className="text-center text-muted-foreground">
                  Visualize padrões de gastos e identifique oportunidades de
                  economia.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="flex flex-col items-center gap-2 rounded-lg bg-card p-6 shadow-sm"
              >
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <LineChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Relatórios Detalhados</h3>
                <p className="text-center text-muted-foreground">
                  Gere relatórios detalhados para acompanhar seu progresso
                  financeiro.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="flex flex-col items-center gap-2 rounded-lg bg-card p-6 shadow-sm"
              >
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Armazenamento Seguro</h3>
                <p className="text-center text-muted-foreground">
                  Mantenha seus dados financeiros seguros com nossa plataforma
                  protegida.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* How it Works Section - Timeline melhorada */}
        <AnimatedSection className="w-full py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Como o FinanceTrack Funciona
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Nossa plataforma foi projetada para simplificar o
                  gerenciamento financeiro pessoal
                </p>
              </div>
            </div>

            <div className="relative">
              {/* Linha vertical central (apenas desktop) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

              {/* Linha vertical esquerda (apenas mobile) */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:hidden" />

              <div className="space-y-16 relative">
                {/* Item 1 */}
                <motion.div
                  className="flex flex-col md:flex-row gap-8 items-center"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {/* Conteúdo desktop (direita) */}
                  <div className="md:w-1/2 flex justify-end order-1 md:order-1 relative">
                    {/* Linha horizontal (desktop) */}
                    <div className="absolute right-0 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 hidden md:block" />

                    <div className="bg-card p-6 rounded-lg shadow-sm max-w-md">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        1. Registre Transações
                      </h3>
                      <p className="text-muted-foreground">
                        Adicione receitas e despesas facilmente com
                        categorização automática. Acompanhe suas compras
                        parceladas e despesas recorrentes.
                      </p>
                    </div>
                  </div>

                  {/* Círculo numerado */}
                  <div className="md:w-1/2 order-2 md:order-2 relative">
                    {/* Linha horizontal (mobile) */}
                    <div className="absolute left-4 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 md:hidden" />

                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center ml-8 md:mx-0 md:absolute md:left-0 md:-translate-x-1/2 z-10">
                      1
                    </div>
                  </div>
                </motion.div>

                {/* Item 2 */}
                <motion.div
                  className="flex flex-col md:flex-row gap-8 items-center"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {/* Conteúdo desktop (esquerda) */}
                  <div className="md:w-1/2 order-1 md:order-2 relative">
                    {/* Linha horizontal (desktop) */}
                    <div className="absolute left-0 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 hidden md:block" />

                    <div className="bg-card p-6 rounded-lg shadow-sm max-w-md ml-auto">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        2. Visualize Relatórios
                      </h3>
                      <p className="text-muted-foreground">
                        Obtenha insights visuais sobre seus hábitos financeiros
                        e tendências com gráficos interativos e relatórios
                        personalizáveis.
                      </p>
                    </div>
                  </div>

                  {/* Círculo numerado */}
                  <div className="md:w-1/2 order-2 md:order-1 relative">
                    {/* Linha horizontal (mobile) */}
                    <div className="absolute left-4 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 md:hidden" />

                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center ml-8 md:mx-0 md:absolute md:right-0 md:translate-x-1/2 z-10">
                      2
                    </div>
                  </div>
                </motion.div>

                {/* Item 3 */}
                <motion.div
                  className="flex flex-col md:flex-row gap-8 items-center"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {/* Conteúdo desktop (direita) */}
                  <div className="md:w-1/2 flex justify-end order-1 md:order-1 relative">
                    {/* Linha horizontal (desktop) */}
                    <div className="absolute right-0 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 hidden md:block" />

                    <div className="bg-card p-6 rounded-lg shadow-sm max-w-md">
                      <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        3. Defina Metas
                      </h3>
                      <p className="text-muted-foreground">
                        Estabeleça objetivos financeiros e acompanhe seu
                        progresso ao longo do tempo. Receba notificações quando
                        atingir marcos importantes.
                      </p>
                    </div>
                  </div>

                  {/* Círculo numerado */}
                  <div className="md:w-1/2 order-2 md:order-2 relative">
                    {/* Linha horizontal (mobile) */}
                    <div className="absolute left-4 top-1/2 h-0.5 w-8 bg-border -translate-y-1/2 md:hidden" />

                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center ml-8 md:mx-0 md:absolute md:left-0 md:-translate-x-1/2 z-10">
                      3
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="w-full py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-2/3 space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Pronto para transformar suas finanças?
                </h2>
                <p className="text-primary-foreground/80 md:text-xl max-w-[600px]">
                  Junte-se a milhares de pessoas que já estão economizando mais
                  e gerenciando melhor seu dinheiro com o FinanceTrack.
                </p>
              </div>
              <div className="lg:w-1/3 flex justify-center lg:justify-end">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Comece Gratuitamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection className="w-full py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  O Que Nossos Usuários Dizem
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Histórias reais de pessoas que transformaram suas finanças
                </p>
              </div>
            </div>

            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">MC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Maria Costa</h4>
                    <p className="text-sm text-muted-foreground">
                      Usuária desde 2022
                    </p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "O FinanceTrack mudou completamente a forma como eu gerencio
                  minhas finanças. Agora consigo ver exatamente para onde vai
                  meu dinheiro e planejar melhor meu futuro."
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">RS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Rafael Silva</h4>
                    <p className="text-sm text-muted-foreground">
                      Usuário desde 2023
                    </p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "A função de parcelamento e acompanhamento de despesas
                  recorrentes é incrível! Finalmente consigo ter uma visão clara
                  das minhas contas mensais."
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">JO</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Juliana Oliveira</h4>
                    <p className="text-sm text-muted-foreground">
                      Usuária desde 2021
                    </p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "Os relatórios e gráficos me ajudaram a identificar padrões de
                  gastos que eu nem percebia. Consegui economizar mais de 20% da
                  minha renda mensal!"
                </p>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
