# Sistema de Investimentos - Documentação

## Visão Geral

O sistema de investimentos permite aos usuários acompanhar sua carteira de investimentos de forma simples e manual. É um MVP focado em tracking básico sem integração com APIs externas.

## Características Principais

### ✅ Funcionalidades Implementadas

- Cadastro manual de investimentos por categoria
- Tracking de valor inicial vs valor atual
- Cálculo automático de rentabilidade
- Organização por categorias (Renda Fixa, Ações, Fundos, etc.)
- Cards de resumo da carteira
- Gráfico de distribuição por categoria
- Interface responsiva e intuitiva

### 🔄 Funcionalidades Planejadas (Futuro)

- Sistema de transações (aportes, resgates, rendimentos)
- Integração com APIs de cotação
- Metas de investimento
- Relatórios avançados
- Comparação com índices (CDI, IPCA)

## Estrutura do Sistema

### 1. Banco de Dados

#### Tabela `investments`

```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- name: VARCHAR(255) - Nome do investimento
- category: VARCHAR(100) - Categoria do investimento
- description: TEXT - Descrição opcional
- initial_amount: DECIMAL(12,2) - Valor inicial investido
- current_amount: DECIMAL(12,2) - Valor atual
- target_amount: DECIMAL(12,2) - Meta opcional
- investment_date: DATE - Data do investimento
- last_updated: TIMESTAMP - Última atualização
- is_active: BOOLEAN - Se está ativo
- color: VARCHAR(7) - Cor para visualização
```

#### Tabela `investment_transactions` (Preparada para futuro)

```sql
- id: UUID (PK)
- investment_id: UUID (FK -> investments)
- user_id: UUID (FK -> auth.users)
- type: VARCHAR(20) - aporte, resgate, rendimento, taxa
- amount: DECIMAL(12,2) - Valor da transação
- description: TEXT - Descrição
- transaction_date: DATE - Data da transação
```

### 2. Categorias Disponíveis

- **Renda Fixa**: Tesouro Direto, CDB, LCI/LCA
- **Ações**: Ações individuais, ETFs de ações
- **Fundos**: Fundos de investimento diversos
- **FIIs**: Fundos Imobiliários
- **Criptomoedas**: Bitcoin, Ethereum, etc.
- **Commodities**: Ouro, petróleo, etc.
- **Internacional**: Investimentos no exterior
- **Previdência**: PGBL, VGBL
- **Outros**: Outras modalidades

### 3. Componentes Principais

#### `InvestmentDialog`

- Modal para criar/editar investimentos
- Validação de formulário
- Seleção de categoria com cores

#### `InvestmentCard`

- Card individual mostrando:
  - Nome e categoria
  - Valor investido vs atual
  - Rentabilidade (R$ e %)
  - Menu de ações

#### `InvestmentSummaryCards`

- 4 cards de resumo:
  - Valor Total Investido
  - Valor Atual da Carteira
  - Rentabilidade Total
  - Número de Investimentos Ativos

#### `InvestmentCategoryChart`

- Gráfico de pizza mostrando distribuição por categoria
- Usa cores específicas para cada categoria

### 4. Server Actions

#### Principais Funções

- `createInvestment()` - Criar novo investimento
- `getInvestments()` - Listar investimentos do usuário
- `updateInvestment()` - Atualizar investimento existente
- `deleteInvestment()` - Remover investimento
- `getInvestmentSummary()` - Obter resumo da carteira
- `getInvestmentCategoryStats()` - Estatísticas por categoria

## Como Usar

### 1. Aplicar Migration

```bash
# No Supabase Dashboard ou CLI
-- Executar o conteúdo de: supabase/migrations/20241223_create_investments_system.sql
```

### 2. Acessar a Seção

- Navegar para `/dashboard/investimentos`
- O menu lateral já inclui o item "Investimentos"

### 3. Criar Primeiro Investimento

1. Clicar em "Novo Investimento"
2. Preencher:
   - Nome (ex: "Tesouro IPCA+ 2029")
   - Categoria (ex: "Renda Fixa")
   - Valor inicial (ex: R$ 1.000,00)
   - Data do investimento
   - Descrição opcional
3. Salvar

### 4. Atualizar Valores

- Atualmente manual através do botão "Editar"
- Futuro: sistema de transações automatizará

## Vantagens da Abordagem Atual

### 🎯 Simplicidade

- Foco no essencial: tracking básico
- Interface intuitiva e familiar
- Sem complexidade desnecessária

### 🚀 MVP Funcional

- Entrega valor imediato
- Base sólida para evoluções
- Feedback rápido dos usuários

### 🔒 Segurança

- Sem dados sensíveis de APIs
- Controle total do usuário
- Compliance simplificado

### 💰 Custo Zero

- Sem APIs pagas
- Infraestrutura existente
- Manutenção mínima

## Evolução Futura

### Fase 2 - Transações

- Sistema completo de aportes/resgates
- Cálculo automático de rentabilidade
- Histórico detalhado

### Fase 3 - Automação

- Integração com APIs de cotação
- Atualização automática de preços
- Alertas e notificações

### Fase 4 - Analytics

- Comparação com benchmarks
- Análise de performance
- Recomendações inteligentes

## Considerações Técnicas

### Performance

- Queries otimizadas com índices
- Paginação preparada para grandes volumes
- Cache de resumos calculados

### Escalabilidade

- Estrutura preparada para múltiplas features
- Separação clara de responsabilidades
- APIs REST-like para integrações futuras

### Manutenibilidade

- Código organizado em módulos
- Tipos TypeScript bem definidos
- Documentação inline

## Próximos Passos Imediatos

### 🚀 Fase 1 - Componentes e Funcionalidades Básicas

#### 1. Funcionalidade de Criação de Investimentos

- ✅ Componente `InvestmentDialog` criado
- 🔄 **Implementar**: Integração completa com formulário funcional
- 🔄 **Implementar**: Validações de campos obrigatórios
- 🔄 **Implementar**: Seleção de cores por categoria

#### 2. Sistema de Edição e Exclusão

- 🔄 **Implementar**: Action `updateInvestment()`
- 🔄 **Implementar**: Funcionalidade de edição no `InvestmentDialog`
- 🔄 **Implementar**: Modal de confirmação para exclusão
- 🔄 **Implementar**: Menu de ações nos cards de investimento

#### 3. Visualização e Interação Melhorada

- 🔄 **Implementar**: Gráfico de distribuição por categoria (recharts)
- 🔄 **Implementar**: Modos de visualização Grid vs Lista
- 🔄 **Implementar**: Filtros avançados (status ativo/inativo, período)
- 🔄 **Implementar**: Ordenação por período de investimento

#### 4. Sistema de Transações Básico

- 🔄 **Implementar**: Modal para registrar aportes/resgates manuais
- 🔄 **Implementar**: Histórico de transações por investimento
- 🔄 **Implementar**: Recálculo automático de valores atuais
- 🔄 **Implementar**: Gráfico de evolução da carteira

### 📊 Fase 2 - Analytics e Relatórios

#### 1. Dashboard de Performance

- 🔄 **Implementar**: Comparação de rentabilidade entre investimentos
- 🔄 **Implementar**: Gráfico de evolução temporal da carteira
- 🔄 **Implementar**: Indicadores de diversificação
- 🔄 **Implementar**: Top/Bottom performers

#### 2. Relatórios Específicos

- 🔄 **Implementar**: Relatório mensal de performance
- 🔄 **Implementar**: Análise de concentração por categoria
- 🔄 **Implementar**: Projeção de crescimento baseada em aportes
- 🔄 **Implementar**: Exportação de dados para Excel/PDF

#### 3. Metas de Investimento

- 🔄 **Implementar**: Definir metas de valor por investimento
- 🔄 **Implementar**: Metas de diversificação (% por categoria)
- 🔄 **Implementar**: Alertas de proximidade de metas
- 🔄 **Implementar**: Sugestões de rebalanceamento

### 🔗 Fase 3 - Integrações e Automação

#### 1. Integração com APIs Financeiras

- 🔄 **Pesquisar**: APIs gratuitas para cotações (Alpha Vantage, Yahoo Finance)
- 🔄 **Implementar**: Atualização automática de preços de ações
- 🔄 **Implementar**: Cotações de fundos e ETFs
- 🔄 **Implementar**: Histórico de preços e volatilidade

#### 2. Notificações e Alertas

- 🔄 **Implementar**: Alertas de variação significativa (±5%)
- 🔄 **Implementar**: Lembretes de aportes mensais
- 🔄 **Implementar**: Notificações de vencimento (renda fixa)
- 🔄 **Implementar**: Resumo semanal por email

#### 3. Recursos Avançados

- 🔄 **Implementar**: Import de corretoras via CSV/OFX
- 🔄 **Implementar**: Calculadora de IR sobre investimentos
- 🔄 **Implementar**: Simulador de cenários (what-if)
- 🔄 **Implementar**: Benchmark contra índices (CDI, IPCA, IBOV)

### 🛠️ Melhorias Técnicas

#### 1. Performance e UX

- 🔄 **Implementar**: Cache de dados com react-query
- 🔄 **Implementar**: Lazy loading para gráficos pesados
- 🔄 **Implementar**: Skeleton loading específico por componente
- 🔄 **Implementar**: Otimização de queries do banco

#### 2. Responsividade e Acessibilidade

- 🔄 **Melhorar**: Layout mobile para gráficos
- 🔄 **Implementar**: Atalhos de teclado
- 🔄 **Implementar**: Suporte a screen readers
- 🔄 **Implementar**: Modo escuro otimizado para gráficos

#### 3. Testes e Qualidade

- 🔄 **Implementar**: Testes unitários para cálculos
- 🔄 **Implementar**: Testes de integração para APIs
- 🔄 **Implementar**: Validação de dados de entrada
- 🔄 **Implementar**: Logs de auditoria para transações

## Priorização Sugerida

### 📅 Sprint 1 (1-2 semanas)

1. Finalizar `InvestmentDialog` funcional
2. Implementar edição e exclusão
3. Adicionar gráfico básico de categorias
4. Melhorar cards de investimento com ações

### 📅 Sprint 2 (2-3 semanas)

1. Sistema básico de transações manuais
2. Histórico de movimentações
3. Filtros avançados e modos de visualização
4. Relatório simples de performance

### 📅 Sprint 3 (3-4 semanas)

1. Metas de investimento
2. Dashboard de analytics
3. Notificações básicas
4. Exportação de dados

### 📅 Futuro (Backlog)

- Integrações com APIs
- Recursos avançados
- Automações complexas
- IA para recomendações

## Feedback e Melhorias

Este é um MVP focado em validação. Colete feedback sobre:

1. **Usabilidade**: Interface intuitiva?
2. **Funcionalidades**: O que está faltando?
3. **Categorias**: Precisam de mais opções?
4. **Relatórios**: Que dados são importantes?
5. **Automação**: Prioridade para APIs?

Com base no feedback, priorize as próximas evoluções do sistema.
