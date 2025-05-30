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
                  Recursos Principais
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Tudo que você precisa para controlar suas finanças de forma
                  eficiente
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Controle de Despesas</h4>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe todos os seus gastos em um só lugar
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Registre e categorize suas despesas, visualize relatórios
                  detalhados e mantenha suas finanças organizadas.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Análise de Gastos</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualize padrões e tendências
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Gráficos interativos e relatórios personalizados para entender
                  melhor seus hábitos financeiros.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Orçamento Inteligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Planeje e controle seus gastos
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Defina limites de gastos por categoria e receba alertas quando
                  estiver próximo do limite.
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

              {/* Eventos da linha do tempo */}
              {[
                {
                  id: 1,
                  title: "Registre Transações",
                  description:
                    "Adicione receitas e despesas facilmente com categorização automática. Acompanhe suas compras parceladas e despesas recorrentes.",
                  icon: CreditCard,
                  position: "right",
                },
                {
                  id: 2,
                  title: "Visualize Relatórios",
                  description:
                    "Obtenha insights visuais sobre seus hábitos financeiros e tendências com gráficos interativos e relatórios personalizáveis.",
                  icon: TrendingUp,
                  position: "left",
                },
                {
                  id: 3,
                  title: "Defina Metas",
                  description:
                    "Estabeleça objetivos financeiros e acompanhe seu progresso ao longo do tempo. Receba notificações quando atingir marcos importantes.",
                  icon: Target,
                  position: "right",
                },
              ].map((step, index) => (
                <div key={step.id} className="mb-24 relative">
                  {/* Layout para desktop */}
                  <div
                    className={`hidden md:grid md:grid-cols-2 items-center gap-8 md:gap-0`}
                  >
                    {/* Lado esquerdo (texto se for left, vazio se for right) */}
                    <div
                      className={`flex justify-end ${
                        step.position === "left" ? "" : "invisible"
                      }`}
                    >
                      {step.position === "left" && (
                        <motion.div
                          className="max-w-md text-right"
                          initial={{ x: 100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.5 + index * 0.1,
                            type: "spring",
                            stiffness: 50,
                          }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <div className="bg-card p-6 rounded-lg shadow-sm inline-block">
                            <div className="rounded-full bg-primary/10 p-3 w-fit mb-4 mx-auto">
                              <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                              {step.id}. {step.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    {/* Lado direito (texto se for right, vazio se for left) */}
                    <div
                      className={`flex justify-start ${
                        step.position === "right" ? "" : "invisible"
                      }`}
                    >
                      {step.position === "right" && (
                        <motion.div
                          className="max-w-md text-left"
                          initial={{ x: -100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.5 + index * 0.1,
                            type: "spring",
                            stiffness: 50,
                          }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <div className="bg-card p-6 rounded-lg shadow-sm inline-block">
                            <div className="rounded-full bg-primary/10 p-3 w-fit mb-4 mx-auto">
                              <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                              {step.id}. {step.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    {/* Círculo numerado central */}
                    <div className="absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full flex items-center justify-center z-10 border-4 border-background shadow-lg">
                      {step.id}
                    </div>
                  </div>

                  {/* Layout para mobile */}
                  <div className="flex flex-col md:hidden pl-12 relative">
                    {/* Marcador na linha do tempo - Mobile */}
                    <div
                      className="absolute left-4 top-0 w-5 h-5 bg-primary rounded-full -translate-x-1/2 z-10"
                      style={{
                        boxShadow: "0 0 0 4px rgba(var(--primary), 0.2)",
                      }}
                    />
                    {/* Conteúdo do evento - Mobile */}
                    <motion.div
                      className="mb-6"
                      initial={{ x: -50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + index * 0.1,
                        type: "spring",
                        stiffness: 100,
                      }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <div className="bg-card p-6 rounded-lg shadow-sm">
                        <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {step.id}. {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                    {/* Linha conectora vertical para mobile */}
                    {index < 2 && (
                      <div className="absolute left-4 top-5 bottom-0 w-0.5 h-[calc(100%+6rem)] bg-border -translate-x-1/2 z-0" />
                    )}
                  </div>
                </div>
              ))}
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
                  Junte-se a outras pessoas que já estão economizando mais e
                  gerenciando melhor seu dinheiro com o FinanceTrack.
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
                  Benefícios Reais para Suas Finanças
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Um sistema completo para gerenciar suas finanças de forma
                  inteligente
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Análise Detalhada</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualize seus gastos por categoria
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Gráficos interativos e relatórios personalizados que mostram
                  exatamente para onde seu dinheiro está indo, ajudando você a
                  tomar decisões mais inteligentes.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Controle Total</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerencie todas as suas contas
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Acompanhe saldos, receitas e despesas em tempo real. Receba
                  alertas de pagamentos e mantenha suas contas sempre em dia.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Metas Financeiras</h4>
                    <p className="text-sm text-muted-foreground">
                      Planeje seu futuro financeiro
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Defina objetivos financeiros, acompanhe seu progresso e receba
                  sugestões personalizadas para alcançar suas metas mais
                  rapidamente.
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
