import { createClient } from "@/lib/supabase/client"

/**
 * Função para monitorar se um usuário foi inserido corretamente na tabela users
 * @param userId ID do usuário a ser verificado
 * @returns Objeto com status da verificação e dados do usuário se encontrado
 */
export async function monitorUserInsertion(userId: string) {
  const supabase = createClient()

  try {
    // Verificar se o usuário existe na tabela users
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }

    return {
      success: true,
      error: null,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

/**
 * Função para verificar logs de erros no Supabase
 * Nota: Esta função requer permissões administrativas
 * e deve ser usada apenas em ambiente de desenvolvimento
 */
export async function checkTriggerLogs() {
  // Esta função é apenas um exemplo e não funcionará diretamente
  // Os logs do Supabase devem ser verificados no painel administrativo
  console.log("Para verificar logs de erros do trigger:")
  console.log("1. Acesse o painel do Supabase")
  console.log('2. Vá para "Database" > "Logs"')
  console.log("3. Filtre por erros relacionados ao seu trigger")
}
