import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { HeroVisual } from "@/components/hero-visual";
import { Footer } from "@/components/footer";

export default function PoliticaDePrivacidadePage() {
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
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              1. Introdução
            </h2>
            <p>
              Esta Política de Privacidade descreve como o FinanceTrack coleta,
              usa e compartilha suas informações pessoais quando você usa nosso
              serviço. Valorizamos sua privacidade e nos comprometemos a
              proteger suas informações pessoais.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              2. Informações que Coletamos
            </h2>
            <p>
              Coletamos diferentes tipos de informações para fornecer e melhorar
              nosso serviço:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Informações da Conta:</strong> Quando você se registra,
                coletamos seu nome, endereço de e-mail e senha.
              </li>
              <li>
                <strong>Informações Financeiras:</strong> Para fornecer nossos
                serviços, coletamos dados sobre suas transações, categorias,
                contas financeiras e metas. Estas informações são armazenadas de
                forma segura e usadas apenas para fornecer os recursos do
                FinanceTrack.
              </li>
              <li>
                <strong>Informações de Uso:</strong> Coletamos dados sobre como
                você interage com nosso serviço, incluindo páginas visitadas,
                tempo gasto no site e ações realizadas.
              </li>
              <li>
                <strong>Informações do Dispositivo:</strong> Podemos coletar
                informações sobre o dispositivo que você usa para acessar o
                FinanceTrack, incluindo modelo, sistema operacional e navegador.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              3. Como Usamos Suas Informações
            </h2>
            <p>Usamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>
                Processar e gerenciar suas transações financeiras dentro da
                plataforma
              </li>
              <li>
                Enviar notificações relacionadas à sua conta ou transações
              </li>
              <li>
                Personalizar sua experiência e fornecer conteúdo relevante
              </li>
              <li>Analisar como nossos serviços são usados para melhorá-los</li>
              <li>
                Detectar, prevenir e resolver problemas técnicos e de segurança
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              4. Compartilhamento de Informações
            </h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais
              com terceiros, exceto nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir obrigações legais</li>
              <li>
                Para proteger nossos direitos, privacidade, segurança ou
                propriedade
              </li>
              <li>
                Com prestadores de serviços que nos ajudam a operar o
                FinanceTrack (sempre com garantias adequadas de proteção de
                dados)
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              5. Segurança de Dados
            </h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para
              proteger suas informações pessoais contra acesso não autorizado,
              alteração, divulgação ou destruição. Suas informações financeiras
              são criptografadas e armazenadas em servidores seguros.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              6. Seus Direitos
            </h2>
            <p>
              Você tem os seguintes direitos em relação às suas informações
              pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar e receber uma cópia das suas informações pessoais</li>
              <li>Retificar informações imprecisas</li>
              <li>Solicitar a exclusão de suas informações pessoais</li>
              <li>
                Restringir ou opor-se ao processamento de suas informações
              </li>
              <li>Solicitar a portabilidade de seus dados</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato conosco
              através do e-mail: privacidade@financetrack.com.br
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              7. Retenção de Dados
            </h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário
              para os fins estabelecidos nesta Política de Privacidade, a menos
              que um período de retenção mais longo seja exigido por lei.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              8. Alterações nesta Política
            </h2>
            <p>
              Podemos atualizar nossa Política de Privacidade periodicamente.
              Notificaremos você sobre quaisquer alterações publicando a nova
              Política de Privacidade nesta página e, se as alterações forem
              significativas, enviaremos uma notificação por e-mail.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-forest-green-700">
              9. Contato
            </h2>
            <p>
              Se você tiver alguma dúvida sobre esta Política de Privacidade,
              entre em contato conosco pelo e-mail:
              privacidade@financetrack.com.br
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
