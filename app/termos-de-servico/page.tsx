import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermosDeServico() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar ou usar o FinanceTrack, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se
          você não concordar com algum aspecto destes termos, não poderá usar nossos serviços.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrição do Serviço</h2>
        <p>
          O FinanceTrack é uma plataforma de gerenciamento financeiro pessoal que permite aos usuários rastrear
          despesas, monitorar receitas, definir metas financeiras e gerar relatórios.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Contas de Usuário</h2>
        <p>
          Para usar o FinanceTrack, você precisa criar uma conta. Você é responsável por manter a confidencialidade de
          suas credenciais de login e por todas as atividades que ocorrem em sua conta.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Privacidade</h2>
        <p>
          Nossa{" "}
          <Link href="/politica-de-privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>{" "}
          descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao usar o FinanceTrack, você
          concorda com nossa Política de Privacidade.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Uso Aceitável</h2>
        <p>Você concorda em usar o FinanceTrack apenas para fins legais e de acordo com estes Termos. Você não deve:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
          <li>Violar quaisquer leis em sua jurisdição</li>
          <li>Tentar acessar áreas restritas do sistema</li>
          <li>Interferir no funcionamento adequado do serviço</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Propriedade Intelectual</h2>
        <p>
          O FinanceTrack e todo o seu conteúdo, recursos e funcionalidades são de propriedade do FinanceTrack, seus
          licenciadores ou outros provedores desse material e são protegidos por leis de direitos autorais, marcas
          registradas e outras leis de propriedade intelectual.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitação de Responsabilidade</h2>
        <p>
          O FinanceTrack é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo. Em nenhuma
          circunstância o FinanceTrack será responsável por danos diretos, indiretos, incidentais, especiais ou
          consequentes resultantes do uso ou incapacidade de usar o serviço.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor
          imediatamente após a publicação dos Termos atualizados. O uso contínuo do FinanceTrack após tais alterações
          constitui sua aceitação dos novos Termos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Rescisão</h2>
        <p>
          Podemos encerrar ou suspender sua conta e acesso ao FinanceTrack imediatamente, sem aviso prévio ou
          responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Lei Aplicável</h2>
        <p>
          Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições de
          conflito de leis.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contato</h2>
        <p>
          Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do e-mail:
          contato@financetrack.com.br
        </p>
      </div>
    </div>
  )
}
