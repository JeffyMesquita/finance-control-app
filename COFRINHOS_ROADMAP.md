# 📦 Roadmap: Sistema de Cofrinhos Digitais

> **Objetivo**: Criar um sistema de "caixinhas" de poupança separadas das metas, com possibilidade de vinculação opcional às metas existentes.

## 🎯 **Visão Geral do Sistema**

### **Conceito**

- **Cofrinhos independentes**: Usuário pode guardar dinheiro por categoria/propósito
- **Flexibilidade**: Dinheiro não precisa estar vinculado a uma meta específica
- **Vinculação opcional**: Cofrinho pode ser linkado a uma meta para facilitar controle
- **Movimentação**: Depósitos, saques e transferências entre cofrinhos

---

## 📋 **Checklist de Implementação**

### **STATUS ATUAL: FASE 4 CONCLUÍDA**

- ✅ **Fase 1**: CONCLUÍDA
- ✅ **Fase 2**: CONCLUÍDA
- ✅ **Fase 3**: CONCLUÍDA
- ✅ **Fase 4**: CONCLUÍDA
- 🔄 **Próximo**: Fase 5 - Integração com sistema existente

---

### **🗄️ Fase 1: Estrutura do Banco de Dados**

#### **1.1 Criar Tabelas Principais**

- [x] `savings_boxes` - Tabela principal dos cofrinhos
- [x] `savings_transactions` - Histórico de movimentações dos cofrinhos
- [x] Modificar `financial_goals` para incluir `savings_box_id`

#### **1.2 Scripts SQL**

```sql
-- savings_boxes
CREATE TABLE savings_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  current_amount DECIMAL(12,2) DEFAULT 0.00,
  target_amount DECIMAL(12,2), -- Meta opcional para o cofrinho
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'piggy-bank',
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- savings_transactions
CREATE TABLE savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_box_id UUID NOT NULL REFERENCES savings_boxes(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'TRANSFER')),
  description TEXT,
  source_account_id UUID REFERENCES financial_accounts(id),
  target_savings_box_id UUID REFERENCES savings_boxes(id), -- Para transferências
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar financial_goals
ALTER TABLE financial_goals
ADD COLUMN savings_box_id UUID REFERENCES savings_boxes(id);

-- Índices para performance
CREATE INDEX idx_savings_boxes_user_id ON savings_boxes(user_id);
CREATE INDEX idx_savings_transactions_savings_box_id ON savings_transactions(savings_box_id);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_financial_goals_savings_box_id ON financial_goals(savings_box_id);

-- RLS (Row Level Security)
ALTER TABLE savings_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own savings_boxes"
ON savings_boxes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own savings_transactions"
ON savings_transactions FOR ALL USING (auth.uid() = user_id);
```

#### **1.3 Atualizar Types**

- [x] Atualizar `lib/supabase/database.types.ts` com novas tabelas
- [x] Criar tipos TypeScript para os novos componentes

### **🔄 Fase 2: Actions e Lógica de Backend**

#### **2.1 Actions para Cofrinhos (`app/actions/savings-boxes.ts`)**

- [x] `getSavingsBoxes()` - Listar todos os cofrinhos do usuário
- [x] `getSavingsBoxById(id)` - Buscar cofrinho específico
- [x] `createSavingsBox(data)` - Criar novo cofrinho
- [x] `updateSavingsBox(id, data)` - Atualizar cofrinho
- [x] `deleteSavingsBox(id)` - Excluir cofrinho
- [x] `getSavingsBoxesTotal()` - Total guardado em todos os cofrinhos
- [x] `getSavingsBoxesSummary()` - Resumo para dashboard
- [x] `getSavingsBoxesStats()` - Estatísticas gerais
- [x] `restoreSavingsBox(id)` - Restaurar cofrinho excluído

#### **2.2 Actions para Transações (`app/actions/savings-transactions.ts`)**

- [x] `depositToSavingsBox(boxId, amount, accountId, description)` - Depósito
- [x] `withdrawFromSavingsBox(boxId, amount, accountId, description)` - Saque
- [x] `transferBetweenBoxes(fromBoxId, toBoxId, amount, description)` - Transferência
- [x] `getSavingsTransactions(boxId, limit?)` - Histórico de transações
- [x] `getSavingsTransactionsByUser(limit?)` - Todas as transações do usuário
- [x] `getSavingsTransactionsStats(boxId?)` - Estatísticas de movimentação
- [x] `deleteSavingsTransaction(transactionId)` - Controle de exclusão

#### **2.3 Atualizar Actions de Metas**

- [ ] Modificar `updateGoalProgress()` para debitar de cofrinho vinculado
- [ ] Adicionar `linkGoalToSavingsBox(goalId, boxId)`
- [ ] Adicionar `unlinkGoalFromSavingsBox(goalId)`

### **🎨 Fase 3: Componentes da Interface**

#### **3.1 Componentes Básicos**

- [x] `components/savings-box-card.tsx` - Card individual do cofrinho
- [x] `components/savings-box-dialog.tsx` - Dialog para criar/editar cofrinho
- [x] `components/savings-transaction-dialog.tsx` - Dialog para depósito/saque
- [x] `components/savings-transfer-dialog.tsx` - Dialog para transferências
- [x] `components/savings-history-list.tsx` - Lista de transações

#### **3.2 Componentes de Resumo**

- [x] `components/savings-summary.tsx` - Card resumo para dashboard
- [ ] `components/savings-stats.tsx` - Estatísticas gerais dos cofrinhos (OPCIONAL)

#### **3.3 Formulários**

- [x] Form de criação com validações
- [x] Form de edição (nome, cor, ícone, meta)
- [x] Form de movimentação (depósito/saque/transferência)

### **📱 Fase 4: Páginas e Navegação**

#### **4.1 Nova Página Principal**

- [x] `app/dashboard/cofrinhos/page.tsx` - Página principal dos cofrinhos
- [x] Layout responsivo (grid de cards)
- [x] Estados: loading, empty, erro
- [x] Filtros e busca
- [x] Ordenação por múltiplos critérios
- [x] Visualização em grid e lista
- [x] Estatísticas resumidas

#### **4.2 Integração no Dashboard**

- [x] Adicionar card de resumo no dashboard principal
- [x] Mostrar total geral dos cofrinhos
- [x] Link para página completa
- [x] Preview dos principais cofrinhos
- [x] Progresso médio das metas

#### **4.3 Navegação**

- [x] Adicionar item no menu lateral (`dashboard-nav.tsx`)
- [x] Adicionar item no menu mobile (`mobile-nav.tsx`)
- [x] Ícone e rota para `/dashboard/cofrinhos`
- [x] Posicionamento adequado no menu

### **🔗 Fase 5: Integração com Sistema Existente**

#### **5.1 Integração com Metas**

- [ ] Dropdown no `goal-dialog.tsx` para selecionar cofrinho
- [ ] Mostrar cofrinho vinculado no `goal-card.tsx`
- [ ] Opção de desvincular cofrinho da meta
- [ ] Validação: valor suficiente no cofrinho

#### **5.2 Integração com Transações**

- [ ] Opção "Guardar no cofrinho" ao criar transação
- [ ] Histórico mostra origem da movimentação
- [ ] Balanceamento de contas vs cofrinhos

#### **5.3 Relatórios e Exports**

- [ ] Incluir cofrinhos no sistema de export
- [ ] Relatório de crescimento dos cofrinhos
- [ ] Dashboard analytics

### **✨ Fase 6: Funcionalidades Avançadas**

#### **6.1 Recursos Extras**

- [ ] Meta individual para cada cofrinho (opcional)
- [ ] Progresso visual para cofrinhos com meta
- [ ] Cores personalizadas (palette predefinida)
- [ ] Ícones personalizados (Lucide icons)

#### **6.2 Automações**

- [ ] Transferência automática para cofrinho ao criar transação
- [ ] Regras de arredondamento ("troco digital")
- [ ] Depósito automático mensal

#### **6.3 Analytics**

- [ ] Gráfico de crescimento por cofrinho
- [ ] Distribuição de valores entre cofrinhos
- [ ] Tempo médio para atingir metas

---

## 🎯 **Ordem de Implementação Sugerida**

### **Sprint 1: Fundação** (Base funcional) ✅ COMPLETO

1. ✅ Criar estrutura do banco (Fase 1)
2. ✅ Actions básicas (Fase 2.1 e 2.2)
3. ✅ Componentes básicos (Fase 3.1)
4. ✅ Página principal completa (Fase 4.1)

### **Sprint 2: Interface** (UX completa) ✅ COMPLETO

1. ✅ Refinar componentes e validações
2. ✅ Integrar no dashboard principal (Fase 4.2)
3. ✅ Navegação completa (Fase 4.3)
4. ✅ Estados de loading/erro

### **Sprint 3: Integração** (Conectar com sistema existente) - **PRÓXIMO**

1. 🔄 Integração com metas (Fase 5.1)
2. 🔄 Integração com transações (Fase 5.2)
3. 🔄 Testes e validações

### **Sprint 4: Polimento** (Funcionalidades extras)

1. 🔄 Recursos avançados (Fase 6)
2. 🔄 Analytics e relatórios
3. 🔄 Otimizações de performance

---

## 📝 **Notas de Implementação**

### **Considerações Técnicas**

- **Consistência de dados**: Usar transações SQL quando necessário
- **Performance**: Índices nas foreign keys e user_id
- **Segurança**: RLS em todas as tabelas
- **Validações**: Frontend e backend

### **UX/UI Guidelines**

- **Cores**: Usar palette consistente com tema da aplicação
- **Ícones**: Lucide React para consistência
- **Responsividade**: Mobile-first approach
- **Feedback**: Loading states e mensagens claras

### **Testes Necessários**

- [ ] CRUD completo de cofrinhos
- [ ] Movimentações (depósito/saque/transferência)
- [ ] Integração com metas
- [ ] Cálculos de valores e porcentagens
- [ ] Validações de segurança (RLS)

---

## 🚀 **Próximos Passos**

1. **Começar pela Fase 1**: Criar estrutura do banco
2. **Testar localmente**: Validar schema e inserções básicas
3. **Implementar Actions**: CRUD básico funcionando
4. **Criar interface mínima**: Primeiro cofrinho funcionando end-to-end

---

**📅 Data de Início**: `[INSERIR DATA]`  
**👤 Responsável**: Equipe de desenvolvimento  
**⏰ Estimativa**: 2-3 semanas para implementação completa

> ⚡ **Lembre-se**: Implementar incrementalmente, testando cada fase antes de prosseguir!
