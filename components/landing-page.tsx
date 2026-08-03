import {
  ArrowRight,
  BarChart3,
  Check,
  LineChart,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: WalletCards,
    title: "Controle mensal",
    text: "Contas, receitas e gastos organizados para você saber o que está acontecendo.",
  },
  {
    icon: BarChart3,
    title: "Leitura simples",
    text: "Relatórios objetivos para transformar números em decisões mais tranquilas.",
  },
  {
    icon: Target,
    title: "Planos visíveis",
    text: "Metas e cofrinhos mostram o próximo passo sem esconder a realidade.",
  },
  {
    icon: LineChart,
    title: "Investimentos",
    text: "Acompanhe aportes e evolução da carteira no mesmo lugar.",
  },
];

const steps = [
  ["01", "Registre", "Adicione contas, categorias e movimentos do seu jeito."],
  ["02", "Entenda", "Veja padrões, totais e próximos compromissos com clareza."],
  ["03", "Avance", "Use metas e cofrinhos para transformar intenção em hábito."],
];

export function LandingPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 px-4 backdrop-blur md:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" aria-label="AjeitaGrana — início">
            <Logo className="h-9 sm:h-10" />
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              className="hidden rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              href="#como-funciona"
            >
              Como funciona
            </Link>
            <Link
              className="rounded-full border border-border px-4 py-2 font-medium transition-colors hover:border-primary hover:text-primary"
              href="/login"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-28 md:pt-24">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Seu dinheiro, no seu ritmo
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl">
            Ajeite sua grana. Faça seus planos avançarem.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Contas, gastos, metas, cofrinhos e investimentos em um só lugar — sem planilha e sem
            complicação.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
              href="/login?mode=register"
            >
              Começar grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-semibold transition-colors hover:border-primary hover:text-primary"
              href="/login"
            >
              Já tenho conta
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["Sem cartão", "Dados sob seu controle", "Feito para a vida real"].map((item) => (
              <span className="inline-flex items-center gap-2" key={item}>
                <Check className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative md:pl-8">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl" />
          <div className="rounded-[2rem] border border-border bg-card p-4 shadow-[0_24px_70px_-28px_hsl(var(--primary)/0.45)] sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Prévia demonstrativa
                </p>
                <p className="mt-1 text-lg font-semibold">Visão do mês</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                fictício
              </span>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2">
                <p className="text-sm text-primary-foreground/75">Saldo total</p>
                <p className="mt-2 font-mono text-3xl font-semibold">R$ 4.280,40</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
                  <div className="h-full w-[68%] rounded-full bg-primary-foreground" />
                </div>
                <p className="mt-2 text-xs text-primary-foreground/70">
                  68% do plano mensal organizado
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="mt-2 font-mono text-xl font-semibold">R$ 6.940,00</p>
                <p className="mt-1 text-xs text-primary">neste mês</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="mt-2 font-mono text-xl font-semibold">R$ 2.659,60</p>
                <p className="mt-1 text-xs text-muted-foreground">organizadas por categoria</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              {["Reserva de emergência", "Aluguel", "Aporte mensal"].map((item, index) => (
                <div className="flex items-center justify-between text-sm" key={item}>
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                      {index === 0 ? (
                        <Target className="h-4 w-4" />
                      ) : (
                        <WalletCards className="h-4 w-4" />
                      )}
                    </span>
                    {item}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {index === 0 ? "R$ 820,00" : index === 1 ? "R$ 1.250,00" : "R$ 400,00"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50 px-4 py-20 md:px-8" id="como-funciona">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Como funciona
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
                Clareza para decidir. Leveza para continuar.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map(([number, title, text]) => (
                <div className="border-t border-border pt-5" key={number}>
                  <p className="font-mono text-sm text-primary">{number}</p>
                  <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Feito para o cotidiano
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
              Tudo que você precisa para cuidar da sua vida financeira.
            </h2>
          </div>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <div className="border-t border-border pt-5" key={title}>
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-20 text-primary-foreground md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <ShieldCheck className="h-8 w-8 text-primary-foreground/80" />
            <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Seus dados merecem cuidado. Seus planos também.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-primary-foreground/75">
              O AjeitaGrana organiza o que você informa e deixa decisões importantes nas suas mãos.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3 font-semibold text-primary transition-transform hover:-translate-y-0.5"
            href="/login?mode=register"
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
