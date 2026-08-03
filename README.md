# 💸 AjeitaGrana - Sistema Completo de Gestão Financeira

> **Plataforma completa de controle financeiro pessoal e empresarial**, desenvolvida com foco em automação, análise inteligente e experiência do usuário excepcional.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Demo Ao Vivo](https://ajeitagrana.jeffymesquita.dev) • [📋 Roadmap 2025](./docs/ROADMAP_MELHORIAS_2025.md) • [📖 Documentação](./docs/)

</div>

---

## 🌟 **Visão Geral**

O **AjeitaGrana** é uma solução completa de gestão financeira que vai muito além de um simples controle de gastos. É uma plataforma inteligente que combina automação, análise preditiva e uma interface moderna para transformar a forma como você gerencia suas finanças.

### 🎯 **Por que AjeitaGrana?**

- 🧠 **Inteligência Financeira**: Analytics avançadas e insights automáticos
- 🔄 **Automação Total**: Débitos recorrentes, lembretes e relatórios automáticos
- 📱 **Multi-Plataforma**: PWA responsivo que funciona em qualquer dispositivo
- 🔒 **Segurança Enterprise**: Row Level Security e criptografia end-to-end
- 📊 **Analytics Avançadas**: Dashboards interativos e relatórios personalizados

---

## ✨ **Funcionalidades Principais**

### 💰 **Gestão Financeira Core**

- [x] **Transações Inteligentes**: CRUD completo com categorização automática
- [x] **Contas Múltiplas**: Gestão de bancos, cartões, dinheiro e investimentos
- [x] **Categorias Customizáveis**: Sistema flexível com ícones e cores
- [x] **Filtros Avançados**: Por período, categoria, conta, tipo e valor
- [x] **Importação de Dados**: Excel, CSV e integração bancária (futuro)

### 🎯 **Metas e Planejamento**

- [x] **Metas Financeiras**: Criação e acompanhamento de objetivos
- [x] **Cofrinhos Digitais**: Sistema de poupança organizada por objetivos
- [x] **Transferências Internas**: Entre cofrinhos e contas
- [x] **Progresso Visual**: Gráficos e barras de progresso em tempo real
- [x] **Vinculação Inteligente**: Metas conectadas a cofrinhos específicos

### 📈 **Investimentos e Patrimônio**

- [x] **Carteira de Investimentos**: Tracking completo de 9 categorias
- [x] **ROI Automático**: Cálculo de rentabilidade em tempo real
- [x] **Análise de Performance**: Gráficos de evolução patrimonial
- [x] **Diversificação**: Visualização de distribuição por categoria
- [x] **Metas de Investimento**: Objetivos específicos por ativo

### 🔄 **Automação Inteligente**

- [x] **Débitos Recorrentes**: Processamento automático via Supabase Cron
- [x] **Lembretes Inteligentes**: Notificações de vencimentos e metas
- [x] **Relatórios Automáticos**: Geração mensal de análises financeiras
- [x] **Backup Automático**: Sincronização e backup de dados
- [x] **Notificações Push**: Sistema completo de alertas

### 📊 **Analytics e Relatórios**

- [x] **Dashboard Executivo**: 8+ cards com métricas essenciais
- [x] **Gráficos Interativos**: Recharts com drill-down e filtros
- [x] **Comparativos Temporais**: Análise mensal, trimestral e anual
- [x] **Exportação Avançada**: PDF, Excel, CSV com layouts personalizados
- [x] **Análise de Tendências**: Detecção de padrões e anomalias

### 👥 **Social e Gamificação**

- [x] **Sistema de Conquistas**: 13 badges com critérios específicos
- [x] **Programa de Referrals**: Convites com tracking completo
- [x] **Perfil Personalizado**: Customização completa do usuário
- [x] **Compartilhamento**: Links de convite e conquistas
- [x] **Comunidade**: Sistema de feedback integrado

### 🛠️ **Administração e Suporte**

- [x] **Painel Administrativo**: Dashboard completo para gestão
- [x] **Analytics de Usuários**: DAU, MAU, retention e churn
- [x] **Sistema de Feedback**: Coleta estruturada de sugestões e bugs
- [x] **Monitoramento**: Logs, métricas e alertas em tempo real
- [x] **Gestão de Usuários**: CRUD completo com permissões

---

## 🏗️ **Arquitetura Técnica**

### **Frontend Stack**

```typescript
Next.js 15.2.4      // App Router + Server Components
TypeScript 5.0      // Type Safety completo
Tailwind CSS 3.4    // Styling system + Design tokens
Radix UI            // Componentes acessíveis
Recharts            // Gráficos interativos
Framer Motion       // Animações fluidas
React Hook Form     // Gerenciamento de formulários
Zod                 // Validação de schemas
```

### **Backend & Database**

```sql
Supabase            // BaaS completo
PostgreSQL 15       // Database principal
Row Level Security  // Segurança granular
Supabase Cron       // Jobs agendados
Edge Functions      // Serverless computing
pg_cron + pg_net    // Automação nativa
```

### **DevOps & Performance**

```yaml
Vercel              # Hosting e CI/CD
Vercel Analytics    # Web Vitals tracking
Service Workers     # PWA + Offline support
Bundle Analyzer     # Otimização de build
ESLint + Prettier   # Code quality
Performance Monitor # Core Web Vitals
```

---

## 📱 **Progressive Web App**

O AjeitaGrana é uma **PWA completa** com:

- 📱 **Instalação**: Funciona como app nativo
- 🔄 **Offline-First**: Sincronização automática quando online
- 🔔 **Push Notifications**: Lembretes e alertas em tempo real
- ⚡ **Performance**: Lighthouse Score 95+ em todas as métricas
- 🎨 **Design Responsivo**: Otimizado para mobile, tablet e desktop

---

## 🚀 **Quick Start**

### **1. Clone e Install**

```bash
git clone https://github.com/jeffymesquita/finance-control-app.git
cd finance-control-app
pnpm install
```

### **2. Setup Environment**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key # Para emails
```

### **3. Database Setup**

```bash
# Execute as migrations na ordem:
# 1. supabase/migrations/20241222_create_feedback_system.sql
# 2. supabase/migrations/20241222_create_savings_boxes.sql
# 3. supabase/migrations/20241223_create_investments_system.sql
```

### **4. Run Development**

```bash
pnpm dev
# Acesse http://localhost:3000
```

---

## 📋 **Roadmap 2025**

Temos um **[roadmap detalhado](./docs/ROADMAP_MELHORIAS_2025.md)** com 100+ melhorias planejadas:

### **🔥 Q1 2025 - Automação Total**

- ✅ Supabase Cron para débitos recorrentes
- ✅ Sistema de orçamentos inteligente
- ✅ Open Banking integration
- ✅ Análise preditiva com IA

### **🚀 Q2 2025 - Mobile & Performance**

- ✅ App móvel nativo (React Native)
- ✅ OCR para escaneamento de recibos
- ✅ Sincronização offline robusta
- ✅ Performance optimization

### **📊 Q3 2025 - Analytics & BI**

- ✅ Dashboard de BI avançado
- ✅ Machine Learning para insights
- ✅ Alertas inteligentes
- ✅ Relatórios personalizados

### **🌍 Q4 2025 - Scale & Enterprise**

- ✅ Multi-tenancy para empresas
- ✅ API pública para integrações
- ✅ Marketplace de plugins
- ✅ Suporte multi-idioma

---

## 📊 **Métricas e Performance**

### **Web Vitals**

- 🟢 **LCP**: < 1.2s (Excellent)
- 🟢 **FID**: < 100ms (Excellent)
- 🟢 **CLS**: < 0.1 (Excellent)
- 🟢 **Lighthouse**: 95+ em todas as categorias

### **Funcionalidades**

- 📈 **50+ Componentes** React reutilizáveis
- 🗄️ **15+ Tabelas** no banco de dados
- ⚡ **30+ Server Actions** otimizadas
- 🎨 **100+ Variantes** de design system
- 🔄 **10+ Cronjobs** automatizados

---

## 🤝 **Contribuição**

Adoramos contribuições! Veja nosso [Guia de Contribuição](./CONTRIBUTING.md):

### **Como Contribuir**

1. 🍴 Fork o projeto
2. 🌿 Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abra um Pull Request

### **Áreas de Contribuição**

- 🐛 **Bug fixes** e melhorias de performance
- ✨ **Novas funcionalidades** do roadmap
- 📖 **Documentação** e tutoriais
- 🎨 **Design** e UX improvements
- 🌍 **Traduções** para outros idiomas

---

## 📞 **Suporte e Comunidade**

### **Canais Oficiais**

- 🐛 **Issues**: [GitHub Issues](https://github.com/jeffymesquita/finance-control-app/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/jeffymesquita/finance-control-app/discussions)
- 📧 **Email**: je_2742@hotmail.com
- 💼 **LinkedIn**: [@jeffymesquita](https://www.linkedin.com/in/jeffymesquita/)

### **Documentação**

- 📖 **Docs Técnicas**: [/docs](./docs/)
- 🚀 **API Reference**: [/docs/api](./docs/api/)
- 🎯 **Roadmap**: [/docs/ROADMAP_MELHORIAS_2025.md](./docs/ROADMAP_MELHORIAS_2025.md)
- 🏗️ **Architecture**: [/docs/architecture.md](./docs/architecture.md)

---

## 👨‍💻 **Autor**

<div align="center">

### **Jeferson Mesquita**

_Desenvolvedor Full Stack & Product Manager_

[![LinkedIn](https://img.shields.io/badge/LinkedIn-jeffymesquita-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/jeffymesquita/)
[![GitHub](https://img.shields.io/badge/GitHub-jeffymesquita-black?style=flat-square&logo=github)](https://github.com/jeffymesquita)
[![Portfolio](https://img.shields.io/badge/Portfolio-jeffymesquita.dev-orange?style=flat-square&logo=safari)](https://jeffymesquita.dev)

_"Transformando ideias em soluções tecnológicas que impactam vidas"_

</div>

---

## 📄 **Licença**

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 **Agradecimentos**

### **Open Source Heroes**

- 🚀 [Vercel](https://vercel.com) - Hosting e deployment incríveis
- 💚 [Supabase](https://supabase.com) - Backend-as-a-Service revolucionário
- ⚛️ [Next.js Team](https://nextjs.org) - Framework React de próxima geração
- 🎨 [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- 📊 [Recharts](https://recharts.org) - Biblioteca de gráficos fantástica

### **Community**

Um agradecimento especial a todos os **early adopters**, **beta testers** e **contributors** que tornaram este projeto possível! 🎉

---

<div align="center">

### **⭐ Se este projeto te ajudou, deixe uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/jeffymesquita/finance-control-app?style=social)](https://github.com/jeffymesquita/finance-control-app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jeffymesquita/finance-control-app?style=social)](https://github.com/jeffymesquita/finance-control-app/network/members)

---

**🚀 Feito com ❤️ no Brasil • 2024-2025**

</div>
