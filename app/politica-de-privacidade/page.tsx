import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PoliticaDePrivacidadePage() {
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
        <h1>Política de Privacidade</h1>
        <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2>1. Introdução</h2>
        <p>
          Esta Política de Privacidade descreve como o FinanceTrack coleta, usa e compartilha suas informações pessoais
          quando você usa nosso serviço. Levamos sua privacidade muito a sério e nos comprometemos a proteger seus dados
          pessoais.
        </p>

        <h2>2. Informações que Coletamos</h2>
        <p>Coletamos os seguintes tipos de informações:</p>
        <ul>
          <li>
            <strong>Informações da Conta:</strong> Nome, endereço de e-mail, senha e outras informações fornecidas
            durante o registro.
          </li>
          <li>
            <strong>Dados Financeiros:</strong> Transações, categorias, contas, metas financeiras e outros dados que
            você insere no sistema.
          </li>
          <li>
            <strong>Dados de Uso:</strong> Informações sobre como você interage com nosso serviço, incluindo páginas
            visitadas, tempo gasto e ações realizadas.
          </li>
          <li>
            <strong>Informações do Dispositivo:</strong> Tipo de dispositivo, sistema operacional, navegador e endereço
            IP.
          </li>
        </ul>

        <h2>3. Como Usamos Suas Informações</h2>
        <p>Usamos suas informações para:</p>
        <ul>
          <li>Fornecer, manter e melhorar nossos serviços</li>
          <li>Processar e gerenciar suas transações financeiras</li>
          <li>Gerar relatórios e análises personalizadas</li>
          <li>Enviar comunicações relacionadas ao serviço</li>
          <li>Detectar, prevenir e resolver problemas técnicos e de segurança</li>
          <li>Cumprir obrigações legais</li>
        </ul>

        <h2>4. Compartilhamento de Informações</h2>
        <p>
          Não vendemos suas informações pessoais a terceiros. Podemos compartilhar suas informações nas seguintes
          circunstâncias:
        </p>
        <ul>
          <li>
            <strong>Provedores de Serviço:</strong> Compartilhamos informações com fornecedores terceirizados que nos
            ajudam a operar nossos serviços.
          </li>
          <li>
            <strong>Conformidade Legal:</strong> Podemos divulgar informações quando exigido por lei ou para proteger
            nossos direitos legais.
          </li>
          <li>
            <strong>Com Seu Consentimento:</strong> Podemos compartilhar informações com terceiros quando você nos
            autorizar explicitamente a fazê-lo.
          </li>
        </ul>

        <h2>5. Segurança de Dados</h2>
        <p>
          Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não
          autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou
          método de armazenamento eletrônico é 100% seguro.
        </p>

        <h2>6. Seus Direitos</h2>
        <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
        <ul>
          <li>Acessar e receber uma cópia dos seus dados</li>
          <li>Retificar ou atualizar seus dados</li>
          <li>Solicitar a exclusão de seus dados</li>
          <li>Restringir ou se opor ao processamento de seus dados</li>
          <li>Portabilidade de dados</li>
          <li>Retirar seu consentimento a qualquer momento</li>
        </ul>

        <h2>7. Retenção de Dados</h2>
        <p>
          Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir nossas
          obrigações legais. Quando você exclui sua conta, podemos reter algumas informações por um período limitado
          para fins legais ou de auditoria.
        </p>

        <h2>8. Crianças</h2>
        <p>
          Nossos serviços não são destinados a pessoas com menos de 18 anos. Não coletamos intencionalmente informações
          pessoais de crianças menores de 18 anos.
        </p>

        <h2>9. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações
          significativas publicando a nova Política de Privacidade em nosso site ou enviando um e-mail.
        </p>

        <h2>10. Contato</h2>
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais, entre em
          contato conosco pelo e-mail: privacidade@financetrack.com.br
        </p>
      </div>
    </div>
  )
}
