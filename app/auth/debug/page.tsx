import { AuthDebugger } from "@/components/auth-debugger"

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Depuração de Autenticação</h1>
      <AuthDebugger />
    </div>
  )
}
