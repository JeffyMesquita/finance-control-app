import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { HeroVisual } from "@/components/hero-visual";
import { Footer } from "@/components/footer";

export default function TermosDeServicoPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background px-2 sm:px-4 py-8 gap-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-forest-green-700 hover:bg-forest-green-700/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para a página inicial
            </Button>
          </Link>
          <Logo dark className="h-14 w-auto" />
        </div>

        <div className="space-y-8 bg-card/80 rounded-xl p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-2 text-forest-green-700">
              Termos de Serviço
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar ou usar o FinanceTrack, você concorda em cumprir e
              estar vinculado a estes Termos de Serviço. Se você não concordar
              com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              2. Descrição do Serviço
            </h2>
            <p>
              O FinanceTrack é uma plataforma de gerenciamento financeiro
              pessoal que permite aos usuários rastrear despesas, receitas,
              criar orçamentos e visualizar relatórios financeiros.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              3. Contas de Usuário
            </h2>
            <p>
              Para usar determinados recursos do FinanceTrack, você precisa
              criar uma conta. Você é responsável por manter a confidencialidade
              de sua senha e por todas as atividades que ocorrem em sua conta.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              4. Uso do Serviço
            </h2>
            <p>
              Você concorda em usar o FinanceTrack apenas para fins legais e de
              acordo com estes Termos. Você não deve:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Usar o serviço de qualquer maneira que possa danificar,
                desabilitar ou sobrecarregar o FinanceTrack
              </li>
              <li>Tentar acessar áreas não autorizadas do serviço</li>
              <li>
                Usar o serviço para qualquer finalidade ilegal ou não autorizada
              </li>
              <li>Violar quaisquer leis em sua jurisdição ao usar o serviço</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              5. Privacidade
            </h2>
            <p>
              Sua privacidade é importante para nós. Consulte nossa{" "}
              <Link
                href="/politica-de-privacidade"
                className="text-primary hover:underline"
              >
                Política de Privacidade
              </Link>{" "}
              para entender como coletamos, usamos e protegemos seus dados
              pessoais.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              6. Modificações do Serviço
            </h2>
            <p>
              Reservamo-nos o direito de modificar ou descontinuar, temporária
              ou permanentemente, o serviço (ou qualquer parte dele) com ou sem
              aviso prévio. Não seremos responsáveis perante você ou terceiros
              por qualquer modificação, suspensão ou descontinuação do serviço.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              7. Limitação de Responsabilidade
            </h2>
            <p>
              Em nenhuma circunstância o FinanceTrack, seus diretores,
              funcionários ou agentes serão responsáveis por quaisquer danos
              indiretos, incidentais, especiais, consequenciais ou punitivos,
              incluindo, sem limitação, perda de lucros, dados, uso, boa vontade
              ou outras perdas intangíveis, resultantes de seu acesso ou uso ou
              incapacidade de acessar ou usar o serviço.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              8. Lei Aplicável
            </h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis
              do Brasil, sem considerar suas disposições de conflito de leis.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              9. Alterações nos Termos
            </h2>
            <p>
              Reservamo-nos o direito, a nosso exclusivo critério, de modificar
              ou substituir estes Termos a qualquer momento. Se uma revisão for
              material, tentaremos fornecer um aviso com pelo menos 30 dias de
              antecedência antes que quaisquer novos termos entrem em vigor.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              10. Contato
            </h2>
            <p>
              Se você tiver alguma dúvida sobre estes Termos, entre em contato
              conosco pelo e-mail: contato@financetrack.com.br
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <HeroVisual className="max-w-xs sm:max-w-sm md:max-w-md" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
