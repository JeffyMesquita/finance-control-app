# 🔧 Configuração do Painel Administrativo

## 🎯 **Visão Geral**

O painel administrativo fornece uma visão completa e detalhada de todos os aspectos do seu app FinanceTrack, incluindo:

- 📊 **Métricas gerais** (usuários, transações, metas, cofrinhos)
- 👥 **Gestão de usuários** com estatísticas detalhadas
- 💬 **Sistema de feedbacks** completo
- 📈 **Analytics de uso** e comportamento
- 🎯 **Sistema de referência** e gamificação

## 🔐 **Configuração de Acesso**

### **1. Definir a claim administrativa**

O acesso administrativo não usa IDs públicos nem variáveis `NEXT_PUBLIC_*`. Atribua a claim controlada pelo servidor no usuário do Supabase:

```json
{
  "role": "admin"
}
```

A claim deve ficar em `app_metadata` e ser alterada apenas por um fluxo administrativo seguro (service role no backend). O navegador recebe apenas o papel normalizado `ADMIN` pela sessão.

### **2. Verificar o acesso**

1. Faça login com o usuário que possui `app_metadata.role = "admin"`.
2. Confirme que a sessão retorna `role: "ADMIN"` em `/auth/me`.
3. Usuários sem a claim devem ser redirecionados e receber `403` nas ações administrativas.
## **2. Como Encontrar o ID do Usuário**

**Opção 1 - Via Supabase Dashboard:**

1. Acesse o Supabase Dashboard
2. Vá para "Authentication" > "Users"
3. Encontre seu usuário e copie o UUID

**Opção 2 - Via Aplicação:**

1. Faça login no app
2. Abra o console do navegador
3. Execute: `console.log(user.id)` (se tiver acesso ao objeto user)

## 🚀 **Estrutura do Painel**

### **📊 Dashboard Principal (`/dashboard/admin`)**

**Métricas Exibidas:**

- Total de usuários (novos, ativos, crescimento)
- Transações (volume, valores, tipos)
- Metas financeiras (progresso, conclusões)
- Cofrinhos (total poupado, média)
- Feedbacks (total, status, tipos)
- Sistema de referência (conversões, top referrers)

**Funcionalidades:**

- Atualização em tempo real
- Cards interativos com detalhes
- Ações rápidas para outras seções
- Status do sistema

### **👥 Gestão de Usuários (`/dashboard/admin/users`)**

**Informações por Usuário:**

- Dados pessoais (email, nome, data cadastro)
- Estatísticas de transações
- Metas criadas e concluídas
- Cofrinhos e valores poupados
- Feedbacks enviados
- Atividade recente

**Funcionalidades:**

- Busca e filtros
- Paginação
- Visualização detalhada
- Export de dados (futuro)

### **💬 Sistema de Feedbacks (`/dashboard/admin/feedbacks`)**

**Gestão Completa:**

- Visualização de todos os feedbacks
- Filtros por tipo, status, prioridade
- Atualização de status em tempo real
- Informações técnicas do usuário
- Notas administrativas

**Status Disponíveis:**

- 🔵 **OPEN** - Novo feedback
- 🟡 **IN_PROGRESS** - Em análise
- 🟢 **RESOLVED** - Resolvido
- ⚪ **CLOSED** - Fechado

**Tipos de Feedback:**

- 💡 **SUGGESTION** - Sugestões
- 🐛 **BUG_REPORT** - Relatos de bugs
- 💬 **FEEDBACK** - Feedback geral
- ⭐ **FEATURE_REQUEST** - Novas funcionalidades
- 📝 **OTHER** - Outros

### **📈 Analytics (`/dashboard/admin/analytics`)**

**Métricas de Uso:**

- Páginas mais visitadas
- Dispositivos utilizados
- Navegadores principais
- Tempo de sessão
- Retenção de usuários

_Nota: Atualmente usando dados mockados. Em produção, integrar com Google Analytics._

### **🎯 Sistema de Referência (`/dashboard/admin/referrals`)**

**Análise Completa:**

- Total de convites enviados
- Taxa de conversão
- Top referenciadores
- Timeline de conversões
- Badges e gamificação

## 🔒 **Segurança**

### **Verificação de Acesso**

O sistema utiliza o hook `useAdminGuard()` que:

1. ✅ Verifica se o usuário está autenticado
2. ✅ Compara o ID com a variável de ambiente
3. ✅ Redireciona não-admins automaticamente
4. ✅ Mostra loading durante verificação

### **Server Actions Protegidas**

Todas as actions administrativas verificam:

```typescript
async function verifyAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}
```

## 🎨 **Personalização Visual**

### **Identificação Visual**

- 🔴 **Header vermelho** para distinguir área admin
- 🛡️ **Ícone de escudo** para identificação
- 🚨 **Alertas visuais** para dados críticos
- 📊 **Cores semânticas** para status e prioridades

### **Navegação**

- **Dashboard** - Visão geral
- **Usuários** - Gestão de usuários
- **Feedbacks** - Sistema de feedback
- **Analytics** - Métricas de uso
- **Referências** - Sistema de convites

## 📊 **Métricas Disponíveis**

### **Usuários**

```typescript
users: {
  total: number; // Total de usuários
  newThisMonth: number; // Novos este mês
  newThisWeek: number; // Novos esta semana
  activeThisMonth: number; // Ativos este mês
}
```

### **Transações**

```typescript
transactions: {
  total: number;
  totalAmount: number; // Volume total
  thisMonth: number; // Transações este mês
  thisMonthAmount: number; // Volume este mês
  byType: {
    income: {
      count: number;
      amount: number;
    }
    expense: {
      count: number;
      amount: number;
    }
  }
}
```

### **Metas e Cofrinhos**

```typescript
goals: {
  total: number;
  completed: number;
  inProgress: number;
  averageProgress: number; // Progresso médio em %
  totalTargetAmount: number;
  totalCurrentAmount: number;
}

savingsBoxes: {
  total: number;
  totalSaved: number; // Total poupado
  averageAmount: number; // Média por cofrinho
  activeBoxes: number; // Cofrinhos ativos
}
```

### **Feedbacks**

```typescript
feedbacks: {
  total: number;
  thisMonth: number;
  byType: Record<string, number>; // Por tipo
  byStatus: Record<string, number>; // Por status
  byPriority: Record<string, number>; // Por prioridade
}
```

### **Sistema de Referência**

```typescript
referrals: {
  totalInvites: number;
  successfulReferrals: number;
  conversionRate: number; // Taxa de conversão
  topReferrers: Array<{
    referrer_id: string;
    count: number;
    email?: string;
  }>;
}
```

## 🚀 **Próximos Passos**

### **Implementar:**

- [ ] Página de usuários detalhada
- [ ] Sistema de notificações admin
- [ ] Export de relatórios
- [ ] Integração com Google Analytics
- [ ] Dashboard de sistema em tempo real
- [ ] Logs de atividade administrativa

### **Melhorias:**

- [ ] Filtros avançados
- [ ] Gráficos interativos
- [ ] Alertas automáticos
- [ ] Backup de dados
- [ ] Auditoria de ações

## 🆘 **Solução de Problemas**

### **Acesso Negado**

1. ✅ Verificar se `app_metadata.role` é `admin` no Supabase
2. ✅ Confirmar que o usuário está logado
3. ✅ Limpar cache do navegador
4. ✅ Verificar console para erros

### **Dados Não Carregam**

1. ✅ Verificar conexão com banco
2. ✅ Conferir permissões RLS no Supabase
3. ✅ Verificar logs do servidor
4. ✅ Testar queries no Supabase Dashboard

### **Performance Lenta**

1. ✅ Verificar número de usuários
2. ✅ Implementar paginação
3. ✅ Adicionar cache às queries
4. ✅ Otimizar consultas do banco

---

**🎉 Painel Administrativo Configurado!**

Agora você tem acesso completo a todas as métricas e pode gerenciar seu app de forma eficiente e detalhada.
