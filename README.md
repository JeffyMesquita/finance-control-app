# 💸 Finance Control App

> Repositório oficial do projeto de controle financeiro pessoal e multiplataforma, desenvolvido com foco em organização, visualização e segurança.

---

## 📌 Objetivo

Este projeto foi criado com o intuito de proporcionar uma **plataforma de controle financeiro moderna, responsiva e segura**, onde usuários possam:

- Registrar entradas e saídas financeiras de diferentes tipos
- Acompanhar seu saldo e evolução ao longo do tempo
- Gerar gráficos e comparativos mensais, trimestrais, semestrais e anuais
- Visualizar relatórios por categoria e tipo de transação
- Acessar o sistema com segurança via **login do Google**

---

## 🧠 Por que este projeto existe?

- 🌟 **Educação financeira é liberdade**: queremos tornar a gestão de finanças mais acessível e visual.
- 🧱 **Tecnologia moderna**: integrar as melhores práticas de desenvolvimento fullstack com ferramentas modernas como Next.js, Prisma e Supabase.
- 🔐 **Segurança em primeiro lugar**: garantir que apenas o dono dos dados tenha acesso aos mesmos via RLS.
- 🎯 **Usabilidade**: criar uma interface agradável, responsiva e eficiente para qualquer dispositivo.

---

## 🏗️ Tech Stack

| Camada         | Tecnologias                                              |
| -------------- | -------------------------------------------------------- |
| Frontend       | [Next.js](https://nextjs.org/), TailwindCSS              |
| Backend        | Next.js API Routes, [Prisma ORM](https://www.prisma.io/) |
| Autenticação   | Supabase Auth (Google OAuth)                             |
| Banco de dados | PostgreSQL (via Supabase)                                |
| Hospedagem     | Supabase (DB/Auth), Vercel (Frontend/API)                |
| Gráficos       | Recharts / ApexCharts                                    |

---

## 🧰 Funcionalidades principais

- [x] Login com Google
- [x] Criação automática de perfil ao autenticar
- [x] Registro de entradas e saídas
- [x] Filtros por categoria e período
- [x] Gráficos comparativos por mês/trimestre/ano
- [x] Responsivo (mobile-first)
- [ ] Modo escuro
- [ ] Exportação de relatórios em PDF
- [ ] Dashboard com KPIs e metas financeiras

---

## 🔐 Autenticação com Supabase

O sistema utiliza o **Supabase Auth com Google OAuth**.  
Ao realizar o primeiro login, o Supabase dispara uma trigger que cria automaticamente o perfil do usuário na tabela `users`.

> Isso garante que os dados estejam prontos no banco sem depender de nenhuma ação adicional no frontend ou backend.

---

## 🧾 Estrutura do banco de dados

O Supabase está conectado a um banco PostgreSQL chamado `finance_control_db`.

**Tabelas principais:**

1. `users`: guarda informações do usuário autenticado
2. `transactions`: entradas e saídas, com categorias, datas e descrição

Cada transação pertence a um usuário e é protegida por **Row Level Security (RLS)**.

---

## 🛡️ Segurança

- Row Level Security ativado nas tabelas sensíveis
- Apenas o dono dos dados pode acessar/alterar seus próprios registros
- Tokens gerenciados pelo Supabase com expiração e verificação nativas

---

## ▶️ Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/jeffymesquita/finance-control-app.git
cd finance-control-app
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<opcional>
```

### 4. Execute o projeto

```bash
npm run dev
# ou
yarn dev
```

## 💡 Futuras melhorias

- 💡 Modo escuro
- Sistema de metas financeiras
- IA para análise de gastos
- Upload de comprovantes
- Compartilhamento de gastos com cônjuge/grupo

## 📫 Contato

Para dúvidas, sugestões ou feedback, entre em contato:

- [LinkedIn](https://www.linkedin.com/in/jeffymesquita/)

## 👨‍💻 Autor

**Jeffy Mesquita**  
GitHub: [@jeffymesquita](https://github.com/jeffymesquita)  
Desenvolvedor fullstack apaixonado por produtividade, design e finanças pessoais.

## 🪪 Licença

MIT License. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📜 Agradecimentos

Agradeço especialmente ao [Supabase](https://supabase.io/) e [Next.js](https://nextjs.org/) por suas ferramentas incríveis que tornaram este projeto possível.
Agradeço também ao [TailwindCSS](https://tailwindcss.com/) pela facilidade de estilização e ao [Prisma](https://www.prisma.io/) pela simplicidade na manipulação de dados.
