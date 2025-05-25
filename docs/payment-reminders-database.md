# Documentação do Sistema de Lembretes de Pagamento

## Visão Geral

Este documento detalha a estrutura e funcionalidades do banco de dados para o sistema de lembretes de pagamento. O sistema permite gerenciar pagamentos recorrentes e únicos, com notificações automáticas e controle de status.

## Estrutura do Banco de Dados

### 1. Extensões e Tipos

```sql
create extension if not exists "uuid-ossp";
```

- Habilita a extensão UUID para geração de identificadores únicos
- Necessária para criar IDs únicos para cada lembrete

### 2. Enums (Tipos Enumerados)

```sql
create type payment_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type payment_frequency as enum ('daily', 'weekly', 'monthly', 'yearly');
```

- `payment_status`: Define os possíveis estados de um pagamento
  - `pending`: Pagamento pendente
  - `paid`: Pagamento realizado
  - `overdue`: Pagamento vencido
  - `cancelled`: Pagamento cancelado
- `payment_frequency`: Define as frequências possíveis para pagamentos recorrentes
  - `daily`: Diário
  - `weekly`: Semanal
  - `monthly`: Mensal
  - `yearly`: Anual

### 3. Tabela Principal

```sql
create table payment_reminders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    description text,
    amount decimal not null,
    due_date date not null,
    is_recurring boolean default false,
    frequency payment_frequency,
    recurrence_pattern jsonb,
    category text,
    status payment_status default 'pending',
    notification_sent boolean default false,
    last_notification_sent_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Campos da Tabela:

- `id`: Identificador único do lembrete (UUID)
- `user_id`: Referência ao usuário do Supabase Auth
- `title`: Título do lembrete
- `description`: Descrição opcional
- `amount`: Valor do pagamento
- `due_date`: Data de vencimento
- `is_recurring`: Indica se é um pagamento recorrente
- `frequency`: Frequência do pagamento recorrente
- `recurrence_pattern`: Padrão personalizado de recorrência (JSON)
- `category`: Categoria do pagamento
- `status`: Status atual do pagamento
- `notification_sent`: Flag para controle de notificações
- `last_notification_sent_at`: Timestamp da última notificação
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

### 4. Índices

```sql
create index payment_reminders_user_id_idx on payment_reminders(user_id);
create index payment_reminders_due_date_idx on payment_reminders(due_date);
create index payment_reminders_status_idx on payment_reminders(status);
```

- Otimiza consultas por:
  - ID do usuário
  - Data de vencimento
  - Status do pagamento

### 5. Atualização Automática de Timestamps

```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_payment_reminders_updated_at
    before update on payment_reminders
    for each row
    execute function update_updated_at_column();
```

- Função e trigger para atualizar automaticamente o campo `updated_at`
- Garante que a data de atualização seja sempre precisa

### 6. Segurança (Row Level Security)

```sql
alter table payment_reminders enable row level security;
```

- Habilita RLS para controle de acesso em nível de linha
- Políticas implementadas:
  - Visualização: Usuários só veem seus próprios lembretes
  - Inserção: Usuários só podem criar lembretes para si
  - Atualização: Usuários só podem atualizar seus lembretes
  - Exclusão: Usuários só podem excluir seus lembretes

### 7. Gerenciamento de Pagamentos Recorrentes

```sql
create or replace function handle_recurring_payment()
returns trigger as $$
begin
    if new.is_recurring and new.status = 'paid' then
        -- Lógica de recorrência
    end if;
    return new;
end;
$$ language plpgsql;
```

- Função que gerencia pagamentos recorrentes
- Quando um pagamento é marcado como pago:
  - Calcula a próxima data de vencimento
  - Reseta o status para pendente
  - Prepara para nova notificação

### 8. Verificação de Pagamentos Vencidos

```sql
create or replace function check_overdue_payments()
returns void as $$
begin
    update payment_reminders
    set status = 'overdue'
    where status = 'pending'
    and due_date < current_date;
end;
$$ language plpgsql;
```

- Função que verifica pagamentos vencidos
- Atualiza automaticamente o status para 'overdue'

### 9. Agendamento de Tarefas

```sql
select cron.schedule(
    'check-overdue-payments',
    '0 0 * * *',
    $$select check_overdue_payments()$$
);
```

- Agenda a verificação de vencimentos para rodar diariamente à meia-noite
- Usa a extensão `pg_cron` do PostgreSQL

## Fluxo de Funcionamento

1. **Criação de Lembrete**:

   - Usuário cria um novo lembrete
   - Sistema gera UUID único
   - Define status inicial como 'pending'

2. **Pagamento Recorrente**:

   - Quando marcado como pago, trigger atualiza próxima data
   - Reseta flags de notificação
   - Mantém histórico de pagamentos

3. **Notificações**:

   - Sistema verifica pagamentos pendentes
   - Envia notificações quando necessário
   - Registra timestamp da notificação

4. **Verificação de Vencimentos**:
   - Job agendado verifica diariamente
   - Atualiza status para 'overdue' quando necessário
   - Mantém histórico de vencimentos

## Considerações de Segurança

1. **Row Level Security**:

   - Garante isolamento de dados entre usuários
   - Previne acesso não autorizado
   - Mantém integridade dos dados

2. **Validações**:

   - Tipos enumerados para status e frequência
   - Constraints para campos obrigatórios
   - Validação de datas e valores

3. **Auditoria**:
   - Timestamps de criação e atualização
   - Histórico de notificações
   - Rastreamento de mudanças de status

## Manutenção e Monitoramento

1. **Índices**:

   - Otimizam consultas frequentes
   - Melhoram performance
   - Facilitam buscas por data e status

2. **Jobs Agendados**:

   - Verificação automática de vencimentos
   - Manutenção de status
   - Limpeza de dados antigos (se necessário)

3. **Logs e Monitoramento**:
   - Registro de alterações
   - Monitoramento de performance
   - Detecção de problemas
