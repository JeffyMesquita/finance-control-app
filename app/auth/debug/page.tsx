"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle, XCircle, RefreshCw, UserPlus } from "lucide-react"

export default function AuthDebugPage() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [publicUser, setPublicUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar sessão atual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setAuthUser(session.user)

        // Verificar se o usuário existe na tabela public.users
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          console.error("Erro ao buscar usuário:", userError)
          setError(`Erro ao buscar usuário: ${userError.message}`)
        } else {
          setPublicUser(userData || null)
        }
      } else {
        setAuthUser(null)
        setPublicUser(null)
      }
    } catch (err: any) {
      console.error("Erro ao verificar autenticação:", err)
      setError(`Erro ao verificar autenticação: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // O redirecionamento será tratado pelo Supabase
    } catch (err: any) {
      console.error("Erro ao fazer login:", err)
      setError(`Erro ao fazer login: ${err.message}`)
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setAuthUser(null)
      setPublicUser(null)
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err)
      setError(`Erro ao fazer logout: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualInsert = async () => {
    if (!authUser) {
      setError("Você precisa estar autenticado para inserir manualmente")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Inserir manualmente na tabela users
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // Atualizar o estado
      await checkAuth()
    } catch (err: any) {
      console.error("Erro ao inserir usuário manualmente:", err)
      setError(`Erro ao inserir usuário manualmente: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Depuração de Autenticação</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status da Autenticação</CardTitle>
            <CardDescription>Verifique o status atual da sua autenticação</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {authUser ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Autenticado
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> Não Autenticado
                    </span>
                  )}
                </div>

                {authUser && (
                  <>
                    <div>
                      <span className="font-medium">Email:</span> {authUser.email}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> {authUser.id}
                    </div>
                    <div>
                      <span className="font-medium">Provedor:</span> {authUser.app_metadata?.provider || "N/A"}
                    </div>
                    <div className="pt-2">
                      <span className="font-medium">Usuário na tabela public.users:</span>{" "}
                      {publicUser ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Encontrado
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" /> Não Encontrado
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {authUser ? (
              <div className="flex gap-2 w-full">
                <Button onClick={checkAuth} disabled={isLoading} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={handleSignOut} disabled={isLoading} variant="destructive" className="flex-1">
                  Sair
                </Button>
              </div>
            ) : (
              <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full">
                Entrar com Google
              </Button>
            )}

            {authUser && !publicUser && (
              <Button onClick={handleManualInsert} disabled={isLoading} className="w-full mt-2">
                <UserPlus className="h-4 w-4 mr-2" />
                Inserir Usuário Manualmente
              </Button>
            )}
          </CardFooter>
        </Card>

        {authUser && (
          <Tabs defaultValue="auth">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auth">Dados de Autenticação</TabsTrigger>
              <TabsTrigger value="public">Dados da Tabela Users</TabsTrigger>
            </TabsList>
            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle>Dados de Autenticação</CardTitle>
                  <CardDescription>Informações completas do usuário autenticado</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(authUser, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="public">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Tabela Users</CardTitle>
                  <CardDescription>Informações do usuário na tabela public.users</CardDescription>
                </CardHeader>
                <CardContent>
                  {publicUser ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(publicUser, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Usuário não encontrado na tabela public.users
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Solução de Problemas</CardTitle>
            <CardDescription>Dicas para resolver problemas comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Se o trigger não estiver funcionando:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Verifique se o trigger e a função estão criados corretamente</li>
                  <li>Verifique se a tabela users tem a estrutura correta</li>
                  <li>Verifique se há erros nos logs do Supabase</li>
                  <li>Use o botão "Inserir Usuário Manualmente" como solução temporária</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-1">Se o login com Google não funcionar:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Verifique se o provedor Google está habilitado no Supabase</li>
                  <li>Verifique se as URLs de redirecionamento estão configuradas corretamente</li>
                  <li>Verifique se as credenciais do Google Cloud estão corretas</li>
                  <li>Limpe os cookies e o cache do navegador</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
