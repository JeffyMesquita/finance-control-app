import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  LineChart,
  LockKeyhole,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: WalletCards,
    eyebrow: "01 / Organize",
    title: "Controle mensal sem atrito",
    text: "Contas, receitas e gastos em uma visão que ajuda você a decidir o próximo passo.",
  },
  {
    icon: BarChart3,
    eyebrow: "02 / Entenda",
    title: "Relatórios que conversam com a vida real",
    text: "Veja os padrões do seu mês sem transformar o cuidado com o dinheiro em outra obrigação.",
  },
  {
    icon: Target,
    eyebrow: "03 / Planeje",
    title: "Metas que deixam o avanço visível",
    text: "Separe intenções em metas e cofrinhos para acompanhar o que importa com mais clareza.",
  },
  {
    icon: LineChart,
    eyebrow: "04 / Acompanhe",
    title: "Investimentos no mesmo mapa",
    text: "Registre aportes e movimentações junto do restante da sua vida financeira.",
  },
];

const steps = [
  ["01", "Registre", "Comece pelas contas e movimentos que já fazem parte da sua rotina."],
  ["02", "Entenda", "Use totais, categorias e relatórios para enxergar sem julgamento."],
  ["03", "Avance", "Transforme uma decisão pequena em um plano que você consegue sustentar."],
] as const;

const faqs = [
  {
    question: "O que é o AjeitaGrana?",
    answer:
      "O AjeitaGrana é uma ferramenta de organização financeira pessoal para registrar contas, gastos, metas, cofrinhos e investimentos em um só lugar.",
  },
  {
    question: "Preciso conectar minha conta bancária?",
    answer:
      "Não. O AjeitaGrana funciona com os dados que você escolhe registrar. Não é necessário compartilhar credenciais bancárias para começar.",
  },
  {
    question: "Como meus dados são tratados?",
    answer:
      "O acesso é protegido por autenticação e as informações ficam disponíveis para a sua conta. Você pode consultar a política de privacidade para conhecer os detalhes.",
  },
  {
    question: "Posso começar sem uma planilha pronta?",
    answer:
      "Sim. Você pode começar com uma conta e poucos movimentos, depois adicionar categorias, metas e investimentos conforme a sua necessidade.",
  },
] as const;

function ProductPreview() {
  return (
    <div
      aria-label="Prévia fictícia do produto"
      className="relative mx-auto w-full max-w-[34rem] md:ml-auto"
      role="img"
    >
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-emerald-400/10 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#202d26] shadow-[0_32px_100px_-30px_rgba(4,120,87,0.75)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/65">Visão do mês</span>
          </div>
          <span className="rounded-full border border-emerald-300/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            dados fictícios
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[1.15fr_0.85fr] sm:p-5">
          <div className="rounded-2xl bg-[#e8f3ec] p-5 text-[#162019] sm:row-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#526158]">Saldo disponível</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.07em]">
                  R$ 4.280,40
                </p>
              </div>
              <CircleDollarSign className="h-5 w-5 text-[#047857]" />
            </div>
            <div className="mt-10 flex h-24 items-end gap-1.5" aria-hidden="true">
              {[34, 46, 40, 62, 56, 76, 68, 86, 74, 92, 82, 100].map((height, index) => (
                <span
                  className={`flex-1 rounded-t-md ${index > 8 ? "bg-[#047857]" : "bg-[#9ac9ad]"}`}
                  key={height}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#526158]">
              <span>jan</span>
              <span>dez</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs text-white/55">Próxima meta</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-medium text-white">Reserva</p>
              <Target className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[64%] rounded-full bg-emerald-400" />
            </div>
            <p className="mt-2 text-right text-[11px] text-white/55">64% organizado</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs text-white/55">Último movimento</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                <WalletCards className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Mercado</p>
                <p className="text-[11px] text-white/50">Alimentação</p>
              </div>
              <p className="ml-auto font-mono text-xs text-white/75">− R$ 86,40</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-right text-[11px] text-white/40">
        Exemplo visual — valores ilustrativos.
      </p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f7f8f4] text-[#162019]">
      <section className="bg-[#162019] text-[#f7f8f4]">
        <header className="border-b border-white/10 px-4 md:px-8">
          <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between">
            <Link href="/" aria-label="AjeitaGrana — início">
              <Logo light className="h-9 sm:h-10" />
            </Link>
            <nav aria-label="Navegação principal" className="flex items-center gap-2 text-sm">
              <Link
                className="hidden px-4 py-2 text-white/65 transition-colors hover:text-white sm:inline-flex"
                href="#recursos"
              >
                Como funciona
              </Link>
              <Link
                className="hidden px-4 py-2 text-white/65 transition-colors hover:text-white md:inline-flex"
                href="#recursos"
              >
                Recursos
              </Link>
              <Link
                className="rounded-full border border-white/20 px-4 py-2 font-semibold transition-colors hover:border-emerald-300 hover:text-emerald-300"
                href="/login"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 md:grid-cols-[0.92fr_1.08fr] md:px-8 md:pb-28 md:pt-24">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-px w-8 bg-emerald-400" />
              Organização financeira pessoal
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Ajeite sua grana. Faça seus planos avançarem.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-white/65 sm:text-xl">
              Contas, gastos, metas, cofrinhos e investimentos em um só lugar — sem planilha e sem
              complicação.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 font-semibold text-[#102319] transition-transform hover:-translate-y-1"
                href="/login?mode=register"
              >
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition-colors hover:border-emerald-300 hover:text-emerald-300"
                href="#recursos"
              >
                Ver o produto
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/55">
              {[
                "Sem integração bancária obrigatória",
                "Dados sob seu controle",
                "Feito para a vida real",
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b border-[#dce5de] bg-[#eef4ef] px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#526158] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-6">
            Um espaço para olhar para o dinheiro com mais clareza — e menos barulho.
          </p>
          <span className="inline-flex items-center gap-2 font-medium text-[#162019]">
            <LockKeyhole className="h-4 w-4 text-[#047857]" /> Privacidade como ponto de partida
          </span>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28" id="como-funciona">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.62fr_1.38fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#047857]">
              Como funciona
            </p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">
              Menos culpa. Mais contexto para escolher.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#526158]">
              O AjeitaGrana acompanha o seu ritmo: começa simples, mostra o que importa e deixa
              espaço para o próximo passo.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map(([number, title, text], index) => (
              <div className="relative border-t border-[#b8c9bd] pt-5" key={number}>
                {index < steps.length - 1 && (
                  <span className="absolute right-0 top-[-1px] hidden h-px w-6 bg-[#047857] sm:block" />
                )}
                <p className="font-mono text-sm text-[#047857]">{number}</p>
                <h3 className="mt-12 text-xl font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#526158]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#162019] px-4 py-20 text-[#f7f8f4] md:px-8 md:py-28" id="recursos">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Recursos essenciais
              </p>
              <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">
                Uma visão mais calma da sua vida financeira.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/60">
              Ferramentas para registrar, entender e avançar — sem promessas exageradas e sem
              esconder os detalhes.
            </p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {features.map(({ icon: Icon, eyebrow, title, text }) => (
              <article className="border-t border-white/15 pt-5" key={title}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    {eyebrow}
                  </p>
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-8 max-w-sm text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#047857]">
              Perguntas frequentes
            </p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">
              Comece com o que você precisa saber.
            </h2>
          </div>
          <div className="divide-y divide-[#dce5de] border-y border-[#dce5de]">
            {faqs.map(({ question, answer }) => (
              <details className="group py-5" key={question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold tracking-[-0.025em] [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#047857] transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pr-10 pt-3 text-sm leading-6 text-[#526158]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e1efe4] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#047857]">
              Seu próximo passo começa aqui
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">
              Ajeite o que dá para ajeitar hoje.
            </h2>
          </div>
          <Link
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#047857] px-6 py-3.5 font-semibold text-white transition-transform hover:-translate-y-1"
            href="/login?mode=register"
          >
            Criar minha conta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
