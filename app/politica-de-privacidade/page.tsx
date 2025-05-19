import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PoliticaDePrivacidade() {
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

      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <p className="mb-6">
          Esta Política de Privacidade descreve como o FinanceTrack coleta, usa e compartilha suas informações pessoais
          quando você usa nosso serviço. Ao usar o FinanceTrack, você concorda com a coleta e uso de informações de
          acordo com esta política.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Informações que Coletamos</h2>

        <h3 className="text-xl font-medium mt-6 mb-3">1.1 Informações Pessoais</h3>
        <p>Quando você se registra no FinanceTrack, podemos coletar as seguintes informações:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Nome</li>
          <li>Endereço de e-mail</li>
          <li>Informações de perfil (como foto de perfil, data de nascimento)</li>
          <li>Informações de contato</li>
        </ul>

        <h3 className="text-xl font-medium mt-6 mb-3">1.2 Dados Financeiros</h3>
        <p>Para fornecer nossos serviços, coletamos informações financeiras que você opta por inserir, como:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Transações financeiras</li>
          <li>Categorias de despesas</li>
          <li>Metas financeiras</li>
          <li>Saldos de contas</li>
        </ul>

        <h3 className="text-xl font-medium mt-6 mb-3">1.3 Informações de Uso</h3>
        <p>Coletamos informações sobre como você interage com nosso serviço, incluindo:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Endereço IP</li>
          <li>Tipo de navegador</li>
          <li>Páginas visitadas</li>
          <li>Tempo gasto no serviço</li>
          <li>Ações realizadas no aplicativo</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Como Usamos Suas Informações</h2>
        <p>Usamos as informações coletadas para:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Fornecer, manter e melhorar nossos serviços</li>
          <li>Processar e gerenciar suas transações financeiras</li>
          <li>Enviar notificações relacionadas à sua conta ou atividades</li>
          <li>Responder às suas solicitações e fornecer suporte ao cliente</li>
          <li>Personalizar sua experiência e fornecer recomendações</li>
          <li>Monitorar o uso de nossos serviços para melhorias e segurança</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Compartilhamento de Informações</h2>
        <p>
          Não vendemos suas informações pessoais a terceiros. Podemos compartilhar suas informações nas seguintes
          circunstâncias:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Com provedores de serviços que nos ajudam a operar nosso serviço</li>
          <li>Para cumprir obrigações legais</li>
          <li>Para proteger nossos direitos, privacidade, segurança ou propriedade</li>
          <li>Em conexão com uma fusão, venda de ativos ou aquisição</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Segurança de Dados</h2>
        <p>
          Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado,
          alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou método de
          armazenamento eletrônico é 100% seguro.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Seus Direitos</h2>
        <p>Você tem os seguintes direitos em relação às suas informações pessoais:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Acessar e receber uma cópia das suas informações pessoais</li>
          <li>Retificar informações imprecisas</li>
          <li>Solicitar a exclusão de suas informações pessoais</li>
          <li>Restringir ou se opor ao processamento de suas informações</li>
          <li>Solicitar a portabilidade de seus dados</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Alterações nesta Política</h2>
        <p>
          Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações
          publicando a nova Política de Privacidade nesta página e atualizando a data de "última atualização".
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contato</h2>
        <p>
          Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do e-mail:
          privacidade@financetrack.com.br
        </p>
      </div>
    </div>
  )
}
