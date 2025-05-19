import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermosDeServicoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1>Termos de Serviço</h1>
        <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar ou usar o FinanceTrack, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se
          você não concordar com algum aspecto destes termos, não poderá usar nossos serviços.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          O FinanceTrack é uma plataforma de gerenciamento financeiro pessoal que permite aos usuários rastrear
          despesas, monitorar receitas, definir metas financeiras e gerar relatórios.
        </p>

        <h2>3. Contas de Usuário</h2>
        <p>
          Para usar o FinanceTrack, você precisa criar uma conta. Você é responsável por manter a confidencialidade de
          sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em notificar-nos imediatamente
          sobre qualquer uso não autorizado de sua conta.
        </p>

        <h2>4. Privacidade</h2>
        <p>
          Nossa Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao
          usar o FinanceTrack, você concorda com a coleta e uso de informações de acordo com nossa Política de
          Privacidade.
        </p>

        <h2>5. Conteúdo do Usuário</h2>
        <p>
          Você mantém todos os direitos sobre os dados que você envia ao FinanceTrack. Ao enviar conteúdo, você nos
          concede uma licença mundial, não exclusiva e isenta de royalties para usar, armazenar e processar esse
          conteúdo para fornecer nossos serviços.
        </p>

        <h2>6. Limitações de Uso</h2>
        <p>
          Você concorda em não usar o FinanceTrack para qualquer finalidade ilegal ou proibida por estes termos. Você
          não pode usar o serviço de maneira que possa danificar, desativar, sobrecarregar ou prejudicar o serviço.
        </p>

        <h2>7. Modificações do Serviço</h2>
        <p>
          Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço (ou qualquer
          parte dele) com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer
          modificação, suspensão ou descontinuação do serviço.
        </p>

        <h2>8. Rescisão</h2>
        <p>
          Podemos encerrar ou suspender sua conta e acesso ao FinanceTrack imediatamente, sem aviso prévio ou
          responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos de Serviço.
        </p>

        <h2>9. Isenção de Garantias</h2>
        <p>
          O FinanceTrack é fornecido "como está" e "conforme disponível" sem garantias de qualquer tipo, expressas ou
          implícitas.
        </p>

        <h2>10. Limitação de Responsabilidade</h2>
        <p>
          Em nenhum caso o FinanceTrack, seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos
          indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso do serviço.
        </p>

        <h2>11. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento. Se fizermos alterações materiais,
          notificaremos você por meio de um aviso em nosso site ou por e-mail. O uso continuado do serviço após tais
          alterações constitui sua aceitação dos novos termos.
        </p>

        <h2>12. Lei Aplicável</h2>
        <p>
          Estes Termos de Serviço serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas
          disposições sobre conflitos de leis.
        </p>

        <h2>13. Contato</h2>
        <p>
          Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco pelo e-mail:
          contato@financetrack.com.br
        </p>
      </div>
    </div>
  )
}
