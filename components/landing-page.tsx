"use client";

import { logger } from "@/lib/utils/logger";
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
  PiggyBank,
  Users,
  Bell,
  Download,
  Wallet,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Logo } from "./logo";
import { useSearchParams } from "next/navigation";

export function LandingPage() {
  const params = useSearchParams();
  const referralId = params.get("ref");

  // First-touch attribution - manter o primeiro referral
  if (referralId) {
    const existingRef = localStorage.getItem("referral_id");

    if (!existingRef) {
      logger.info("🔗 First referral captured in landing page:", {
        data: referralId,
      });
      localStorage.setItem("referral_id", referralId);
    } else if (existingRef !== referralId) {
      logger.info("⚠️ Keeping first referral:", {
        data: [existingRef, "ignoring:", referralId],
      });
    } else {
      logger.info("✅ Same referral confirmed:", { data: referralId });
    }
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
                    Transforme Suas Finanças com Inteligência
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Controle total das suas finanças com cofrinhos virtuais,
                    metas inteligentes, múltiplas contas e um sistema de
                    gamificação que torna economizar divertido.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/login">
                    <Button size="lg" className="gap-1.5">
                      Comece Agora
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#funcionalidades">
                    <Button size="lg" variant="outline">
                      Ver Funcionalidades
                    </Button>
                  </a>
                </div>
              </motion.div>
              <motion.div
                variants={itemFade}
                className="relative mx-auto w-full max-w-[500px]"
              >
                {/* Imagens sobrepostas em formato triangular */}
                <div className="relative h-[350px] w-full">
                  {/* Imagem 1 (frente) - Cofrinhos */}
                  <div className="absolute top-0 left-0 w-[280px] h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl overflow-hidden shadow-xl z-30 transform -rotate-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <PiggyBank className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Cofrinhos Virtuais
                        </p>
                        <p className="text-xs text-muted-foreground">
                          R$ 2.340 / R$ 5.000
                        </p>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mx-auto mt-1">
                          <div
                            className="bg-primary h-1 rounded-full"
                            style={{ width: "47%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Imagem 2 (meio) - Sistema de Referências */}
                  <div className="absolute top-[60px] left-[40px] w-[280px] h-[200px] bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl overflow-hidden shadow-xl z-20 transform rotate-3">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Gift className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Sistema de Badges
                        </p>
                        <div className="flex justify-center gap-1">
                          <span className="text-xs">🥇</span>
                          <span className="text-xs">🥈</span>
                          <span className="text-xs">⭐</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          12 convites enviados
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Imagem 3 (fundo) - Múltiplas Contas */}
                  <div className="absolute top-[120px] left-[80px] w-[280px] h-[200px] bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl overflow-hidden shadow-xl z-10 transform rotate-12">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Múltiplas Contas
                        </p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>💳 Conta Corrente</div>
                          <div>💰 Poupança</div>
                          <div>🏦 Investimentos</div>
                        </div>
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
          <div className="container mx-auto px-4 md:px-6" id="funcionalidades">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Funcionalidades Inovadoras
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Descubra todas as ferramentas que transformarão sua relação
                  com o dinheiro
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
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Cofrinhos Virtuais</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de economia gamificado
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Crie cofrinhos temáticos, transfira dinheiro virtual e
                  acompanhe visualmente seu progresso com barras de progresso
                  motivadoras.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Análises Detalhadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Gráficos e relatórios completos
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Visualize gastos por categoria, comparações mensais e
                  relatórios personalizados que revelam seus padrões
                  financeiros.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Metas Inteligentes</h4>
                    <p className="text-sm text-muted-foreground">
                      Objetivos com acompanhamento automático
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Defina metas com prazos, acompanhe progresso em tempo real e
                  receba sugestões para alcançar seus objetivos mais
                  rapidamente.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Exportação Completa</h4>
                    <p className="text-sm text-muted-foreground">
                      Seus dados em Excel e PDF
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Exporte todas suas transações, relatórios e análises em
                  formatos úteis para backup ou análise externa.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sistema de Referências</h4>
                    <p className="text-sm text-muted-foreground">
                      Convide amigos e ganhe badges
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Indique amigos, ganhe badges especiais (Ouro, Prata, Bronze) e
                  acompanhe sua evolução no ranking de referenciadores.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Transações Avançadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Controle completo e categorização
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Registre receitas e despesas com categorias personalizáveis,
                  notas detalhadas e acompanhamento de transações recorrentes.
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
                  title: "Cadastre-se e Configure",
                  description:
                    "Crie sua conta gratuitamente e configure suas primeiras categorias de gastos. Adicione suas contas principais para começar o controle.",
                  icon: Users,
                  position: "right",
                },
                {
                  id: 2,
                  title: "Registre Suas Transações",
                  description:
                    "Adicione receitas e despesas facilmente com nossa interface intuitiva. Categorize automaticamente e acompanhe transações recorrentes.",
                  icon: CreditCard,
                  position: "left",
                },
                {
                  id: 3,
                  title: "Crie Cofrinhos e Metas",
                  description:
                    "Estabeleça objetivos financeiros inteligentes e crie cofrinhos virtuais para diferentes propósitos. O sistema acompanha automaticamente seu progresso.",
                  icon: PiggyBank,
                  position: "right",
                },
                {
                  id: 4,
                  title: "Analise Seus Hábitos",
                  description:
                    "Visualize relatórios detalhados, gráficos interativos e comparações mensais para entender melhor seus padrões financeiros.",
                  icon: BarChart3,
                  position: "left",
                },
                {
                  id: 5,
                  title: "Conquiste e Compartilhe",
                  description:
                    "Atinja suas metas, ganhe badges de conquista, convide amigos para a plataforma e celebre cada vitória financeira!",
                  icon: TrendingUp,
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
                    {index < 4 && (
                      <div className="absolute left-4 top-5 bottom-0 w-0.5 h-[calc(100%+6rem)] bg-border -translate-x-1/2 z-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Cofrinhos e Gamificação Section */}
        <AnimatedSection className="w-full py-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Economizar Nunca Foi Tão Divertido
              </h2>
              <p className="text-muted-foreground md:text-xl max-w-[600px] mx-auto">
                Descubra como nossos cofrinhos virtuais e sistema de gamificação
                transformam economia em uma experiência envolvente e motivadora.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <motion.div
                className="space-y-6"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <PiggyBank className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Cofrinhos Inteligentes
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Crie cofrinhos para diferentes objetivos: viagem, casa
                    própria, emergência. Transfira dinheiro virtual e acompanhe
                    visualmente seu progresso.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Sistema de Conquistas
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Ganhe badges por atingir metas, economizar consistentemente
                    e indicar amigos. Cada conquista desbloquia funcionalidades
                    especiais.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Convide e Ganhe</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Indique o FinanceTrack para amigos e familiares. Quanto mais
                    pessoas você trouxer, mais benefícios exclusivos você
                    desbloqueia!
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Simulação visual dos cofrinhos */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-6 rounded-2xl border-2 border-blue-500/20">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <PiggyBank className="h-6 w-6 text-blue-500" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        Viagem dos Sonhos
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        R$ 2.340 / R$ 5.000
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "47%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 p-6 rounded-2xl border-2 border-green-500/20">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-green-500" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">Emergência</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        R$ 3.200 / R$ 3.000
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-6 rounded-2xl border-2 border-purple-500/20">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-purple-500" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        Casa Própria
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        R$ 8.500 / R$ 50.000
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: "17%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 p-6 rounded-2xl border-2 border-yellow-500/20">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        Novo Celular
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        R$ 890 / R$ 1.200
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: "74%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-primary/5 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="w-full py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-2/3 space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Seja um dos Primeiros Usuários!
                </h2>
                <p className="text-primary-foreground/80 md:text-xl max-w-[600px]">
                  Estamos na fase inicial e coletando feedbacks de usuários para
                  aprimorar a plataforma. Junte-se a nós nessa jornada e ajude a
                  construir o futuro do controle financeiro pessoal!
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
                  Por Que Escolher o FinanceTrack?
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Funcionalidades inovadoras que transformam seu relacionamento
                  com o dinheiro
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
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Economize Brincando</h4>
                    <p className="text-sm text-muted-foreground">
                      Cofrinhos virtuais que motivam
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Transforme economia em diversão com cofrinhos temáticos, metas
                  visuais e um sistema de conquistas que torna cada centavo
                  economizado uma vitória.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Seus Dados, Sua Escolha</h4>
                    <p className="text-sm text-muted-foreground">
                      Exportação completa e controle total
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Exporte todos seus dados financeiros em formatos úteis (Excel,
                  PDF), mantenha backups e tenha controle total sobre suas
                  informações.
                </p>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Cresça em Comunidade</h4>
                    <p className="text-sm text-muted-foreground">
                      Indique amigos e ganhe benefícios
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Convide amigos, ganhe badges exclusivos e participe de uma
                  comunidade engajada em transformar hábitos financeiros através
                  da gamificação.
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

