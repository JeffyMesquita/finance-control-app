"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Save,
  Search,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { getUserProfile, updateUserProfile } from "@/app/actions/profile";
import type { UserProfile } from "@/lib/types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCepSearch } from "@/hooks/use-cep-search";

export default function PerfilPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Hook para busca de CEP com debounce
  const {
    isLoading: isCepLoading,
    isSearching: isCepSearching,
    error: cepError,
    data: cepData,
    searchCep,
    clearError: clearCepError,
    cancelSearch: cancelCepSearch,
  } = useCepSearch(800);

  // Funções para formatação do CEP
  const formatCep = useCallback((value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 8 dígitos
    const limitedNumbers = numbers.slice(0, 8);

    // Aplica a máscara 00000-000
    if (limitedNumbers.length <= 5) {
      return limitedNumbers;
    } else {
      return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`;
    }
  }, []);

  const getNumericCep = useCallback((value: string): string => {
    return value.replace(/\D/g, "");
  }, []);

  // Perfil inicial com campos em branco
  const initialProfile = useMemo(
    (): UserProfile => ({
      id: user?.id || "",
      full_name: "",
      phone: "",
      birth_date: "",
      document_id: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      profile_image: "",
      bio: "",
      profession: "",
      created_at: null,
      updated_at: null,
    }),
    [user?.id]
  );

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    getUserProfile()
      .then((profileData) => {
        if (profileData) {
          setProfile(profileData);
        } else {
          // Se não há perfil, usa o perfil inicial
          setProfile(initialProfile);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar perfil:", error);
        // Em caso de erro, usa o perfil inicial
        setProfile(initialProfile);
        toast({
          title: "Aviso",
          description:
            "Perfil não encontrado. Você pode criar um novo preenchendo as informações abaixo.",
          variant: "default",
        });
      })
      .finally(() => setIsLoading(false));
  }, [user, userLoading, router, toast, initialProfile]);

  // Efeito para tratar dados do CEP quando obtidos
  useEffect(() => {
    if (cepData && !cepError) {
      // Atualiza os campos de endereço com os dados do CEP
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              address: cepData.logradouro || prev.address,
              city: cepData.localidade || prev.city,
              state: cepData.uf || prev.state,
              postal_code: formatCep(cepData.cep), // Aplica formatação
            }
          : null
      );

      toast({
        title: "Endereço encontrado",
        description: "Os campos de endereço foram preenchidos automaticamente.",
        variant: "default",
      });
    }
  }, [cepData, cepError, toast, formatCep]);

  // Efeito para mostrar erros do CEP
  useEffect(() => {
    if (cepError) {
      toast({
        title: "Erro ao buscar CEP",
        description: cepError,
        variant: "destructive",
      });
    }
  }, [cepError, toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    try {
      setIsSaving(true);

      const result = await updateUserProfile(profile);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso",
          variant: "success",
        });
      } else {
        throw new Error("Falha ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      let processedValue = value;

      // Tratamento especial para CEP
      if (name === "postal_code") {
        // Aplica máscara de formatação
        processedValue = formatCep(value);

        // Obtém apenas números para busca
        const numericCep = getNumericCep(processedValue);

        // Dispara a busca
        if (!numericCep || numericCep.length === 0) {
          // Se o campo for limpo, cancela a busca
          cancelCepSearch();
        } else {
          searchCep(numericCep);
          clearCepError(); // Limpa erros anteriores quando o usuário digita
        }
      }

      setProfile((prev) => {
        if (!prev) {
          // Se não há perfil anterior, cria um novo com o campo atualizado
          return {
            ...initialProfile,
            [name]: processedValue,
          };
        }

        return {
          ...prev,
          [name]: processedValue,
        };
      });
    },
    [
      initialProfile,
      searchCep,
      clearCepError,
      cancelCepSearch,
      formatCep,
      getNumericCep,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <Tabs defaultValue="informacoes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="informacoes">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes" className="space-y-4">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais. Estas informações serão
                  exibidas em seu perfil.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={
                          user?.user_metadata?.avatar_url ||
                          profile?.profile_image ||
                          ""
                        }
                        alt={profile?.full_name || user?.email}
                      />
                      <AvatarFallback className="text-2xl">
                        {(
                          profile?.full_name?.[0] ||
                          user?.email?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="mt-2">
                      Alterar foto
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="full_name"
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Nome completo
                        </Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={profile?.full_name || ""}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profile?.phone || ""}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="birth_date"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Data de nascimento
                        </Label>
                        <Input
                          id="birth_date"
                          name="birth_date"
                          type="date"
                          value={
                            profile?.birth_date
                              ? new Date(profile.birth_date)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="document_id"
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          CPF
                        </Label>
                        <Input
                          id="document_id"
                          name="document_id"
                          value={profile?.document_id || ""}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="profession"
                          className="flex items-center gap-2"
                        >
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Profissão
                        </Label>
                        <Input
                          id="profession"
                          name="profession"
                          value={profile?.profession || ""}
                          onChange={handleInputChange}
                          placeholder="Sua profissão"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile?.address || ""}
                    onChange={handleInputChange}
                    placeholder="Seu endereço"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      value={profile?.city || ""}
                      onChange={handleInputChange}
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={profile?.state || ""}
                      onChange={handleInputChange}
                      placeholder="Seu estado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="postal_code"
                      className="flex items-center gap-2"
                    >
                      CEP
                      {(isCepLoading || isCepSearching) && (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                      {cepData &&
                        !cepError &&
                        !isCepLoading &&
                        !isCepSearching && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      {cepError && !isCepLoading && !isCepSearching && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={profile?.postal_code || ""}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        maxLength={9}
                        inputMode="numeric"
                        pattern="[0-9-]*"
                        title="Digite apenas números - a máscara será aplicada automaticamente"
                        className={`pr-10 font-mono ${
                          cepError && !isCepLoading && !isCepSearching
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : cepData &&
                              !cepError &&
                              !isCepLoading &&
                              !isCepSearching
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : ""
                        }`}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {(isCepLoading || isCepSearching) && (
                          <Search className="h-4 w-4 text-blue-500 animate-pulse" />
                        )}
                        {cepData &&
                          !cepError &&
                          !isCepLoading &&
                          !isCepSearching && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        {cepError && !isCepLoading && !isCepSearching && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-transparent"
                              onClick={clearCepError}
                              title="Limpar erro"
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      {!cepError && !cepData && (
                        <p className="text-muted-foreground">
                          Digite apenas números - a máscara será aplicada
                          automaticamente
                        </p>
                      )}
                      {(isCepLoading || isCepSearching) && (
                        <p className="text-blue-600 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Buscando endereço...
                        </p>
                      )}
                      {cepData &&
                        !cepError &&
                        !isCepLoading &&
                        !isCepSearching && (
                          <p className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Endereço encontrado: {cepData.localidade},{" "}
                            {cepData.uf}
                          </p>
                        )}
                      {cepError && !isCepLoading && !isCepSearching && (
                        <p className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {cepError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre mim</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile?.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Conte um pouco sobre você"
                    rows={4}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="conta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Gerencie as informações da sua conta e preferências de
                segurança.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provedor de autenticação</Label>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  {user?.app_metadata?.provider === "google" ? (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Google</span>
                    </>
                  ) : (
                    <span>Email/Senha</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email verificado</Label>
                <div className="flex items-center gap-2">
                  {user?.email_confirmed_at ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Sim
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Não
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de criação da conta</Label>
                <div className="p-2 rounded-md bg-muted">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("pt-BR")
                    : "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Último login</Label>
                <div className="p-2 rounded-md bg-muted">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "N/A"}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4">
              <div>
                <h3 className="text-lg font-medium">Ações da conta</h3>
                <p className="text-sm text-muted-foreground">
                  Ações que afetam sua conta e seus dados.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Alterar senha</Button>
                <Button
                  variant="outline"
                  className="text-amber-600 border-amber-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  Exportar meus dados
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Excluir minha conta
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
