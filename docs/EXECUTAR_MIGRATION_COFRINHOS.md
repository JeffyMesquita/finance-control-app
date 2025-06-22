# 🚀 Como Executar a Migration dos Cofrinhos

## ✅ **Fase 1 Concluída - Estrutura do Banco**

A estrutura do banco de dados para o sistema de Cofrinhos Digitais foi criada com sucesso!

### **📁 Arquivos Criados:**

- ✅ `supabase/migrations/20241222_create_savings_boxes.sql` - Migration completa
- ✅ `lib/supabase/database.types.ts` - Types atualizados
- ✅ `lib/types/savings-boxes.ts` - Types específicos para cofrinhos

---

## 🗄️ **Como Executar a Migration**

### **Opção 1: Via Supabase Dashboard (Recomendado)**

1. **Acesse o Supabase Dashboard**

   - Entre em [supabase.com](https://supabase.com)
   - Acesse seu projeto do Finance Control App

2. **Vá para SQL Editor**

   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute a Migration**

   - Copie todo o conteúdo do arquivo `supabase/migrations/20241222_create_savings_boxes.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verificar Execução**
   - Vá para "Table Editor"
   - Verifique se as tabelas foram criadas:
     - ✅ `savings_boxes`
     - ✅ `savings_transactions`
     - ✅ `financial_goals` (com novo campo `savings_box_id`)

### **Opção 2: Via Supabase CLI** (Se tiver configurado)

```bash
# Se estiver usando Supabase CLI
npx supabase db push

# Ou aplicar migration específica
npx supabase db reset --linked
```

---

## 🔍 **Verificar se Funcionou**

Execute estas queries no SQL Editor para testar:

### **1. Verificar Tabelas Criadas**

```sql
-- Verificar se as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('savings_boxes', 'savings_transactions');
```

### **2. Verificar Políticas RLS**

```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('savings_boxes', 'savings_transactions');
```

### **3. Verificar Novo Campo em financial_goals**

```sql
-- Verificar se o campo savings_box_id foi adicionado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'financial_goals'
AND column_name = 'savings_box_id';
```

### **4. Teste de Inserção (Opcional)**

```sql
-- Teste inserir um cofrinho (substituir USER_ID pelo seu ID)
INSERT INTO savings_boxes (name, description, target_amount, color, icon, user_id)
VALUES ('Teste', 'Cofrinho de teste', 1000.00, '#3B82F6', 'piggy-bank', 'SEU_USER_ID_AQUI');

-- Verificar se foi inserido
SELECT * FROM savings_boxes WHERE name = 'Teste';

-- Limpar teste (opcional)
DELETE FROM savings_boxes WHERE name = 'Teste';
```

---

## 🎯 **Próximos Passos**

Uma vez que a migration for executada com sucesso, podemos prosseguir para:

### **Fase 2: Actions e Lógica de Backend**

- [ ] Criar `app/actions/savings-boxes.ts`
- [ ] Criar `app/actions/savings-transactions.ts`
- [ ] Testar CRUD básico

### **Comandos para testar Types**

```bash
# Verificar se não há erros de TypeScript
npx tsc --noEmit

# Ou apenas os arquivos específicos
npx tsc --noEmit lib/supabase/database.types.ts
npx tsc --noEmit lib/types/savings-boxes.ts
```

---

## ⚠️ **Troubleshooting**

### **Erro: "relation already exists"**

Se você já executou a migration antes:

```sql
-- Remover tabelas (CUIDADO - isso apaga todos os dados!)
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_boxes CASCADE;
ALTER TABLE financial_goals DROP COLUMN IF EXISTS savings_box_id;
```

### **Erro de Permissão**

- Verifique se você é o owner do projeto no Supabase
- Tente executar as partes da migration separadamente

### **Erro de RLS**

Se houver problemas com RLS:

```sql
-- Desabilitar temporariamente (NÃO recomendado em produção)
ALTER TABLE savings_boxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions DISABLE ROW LEVEL SECURITY;
```

---

## 📊 **Resultado Esperado**

Após executar com sucesso, você terá:

1. **2 novas tabelas**:

   - `savings_boxes` - Para armazenar os cofrinhos
   - `savings_transactions` - Para histórico de movimentações

2. **1 campo novo**:

   - `financial_goals.savings_box_id` - Para vincular metas aos cofrinhos

3. **Segurança configurada**:

   - RLS ativo em todas as tabelas
   - Políticas que garantem isolamento por usuário

4. **Triggers automáticos**:
   - Atualização de saldo dos cofrinhos
   - Validação de transações
   - Timestamps automáticos

---

**🎉 Execute a migration e me avise quando estiver pronto para a Fase 2!**
