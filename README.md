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

## 🚀 Otimizações de SEO e Performance

O projeto implementa várias otimizações para melhorar a indexação e performance:

### SEO

- **Metadata Dinâmico**: Configuração completa de metadados para cada página
- **Schema.org**: Dados estruturados para melhor compreensão pelos motores de busca
- **Breadcrumbs**: Navegação estruturada com markup semântico
- **URLs Canônicas**: Prevenção de conteúdo duplicado
- **Sitemap**: Geração automática de sitemap.xml
- **Robots.txt**: Configuração de regras de indexação

### Performance

- **Web Vitals**: Monitoramento de métricas de performance
- **Font Display**: Otimização de carregamento de fontes
- **Viewport**: Configurações otimizadas para dispositivos móveis
- **OpenGraph**: Suporte a compartilhamento em redes sociais
- **Twitter Cards**: Integração com Twitter

### Componentes Implementados

- `SchemaOrg`: Componente para dados estruturados
- `Breadcrumbs`: Navegação semântica
- `CanonicalUrl`: Gerenciamento de URLs canônicas
- `PerformanceMonitor`: Monitoramento de métricas

### Configuração

Para ativar todas as otimizações, configure as seguintes variáveis de ambiente:

```bash
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
NEXT_PUBLIC_GA_ID=seu-id-do-google-analytics # opcional
```

### Implementação Completa

Para finalizar a implementação das otimizações, siga estes passos:

1. **Configuração de Domínio**

   - Substitua todas as ocorrências de `https://your-domain.com` pelo seu domínio real
   - Arquivos a serem atualizados:
     - `app/layout.tsx`
     - `lib/schema-data.ts`
     - `app/sitemap.ts`
     - `app/robots.ts`

2. **Imagens de OpenGraph**

   - Crie uma imagem para compartilhamento em redes sociais
   - Dimensões recomendadas: 1200x630 pixels
   - Salve em: `/public/og-image.jpg`
   - Formato: JPG ou PNG com boa compressão

3. **Google Search Console**

   - Acesse [Google Search Console](https://search.google.com/search-console)
   - Adicione seu site
   - Copie o código de verificação
   - Adicione em `app/layout.tsx`:

   ```typescript
   verification: {
     google: 'seu-codigo-de-verificacao',
   }
   ```

4. **Twitter Cards**

   - Adicione seu handle do Twitter em `app/layout.tsx`:

   ```typescript
   twitter: {
     card: 'summary_large_image',
     creator: '@seu-handle',
   }
   ```

5. **Ícones e Manifesto**

   - Crie os seguintes arquivos na pasta `/public`:

   a. **Favicon** (`/public/favicon.ico`)

   - Dimensões: 16x16, 32x32, 48x48 pixels
   - Formato: ICO
   - Ferramentas recomendadas: [Favicon Generator](https://realfavicongenerator.net/)

   b. **Apple Touch Icon** (`/public/apple-touch-icon.png`)

   - Dimensões: 180x180 pixels
   - Formato: PNG
   - Sem transparência
   - Sem cantos arredondados (iOS arredonda automaticamente)

   c. **Web Manifest** (`/public/site.webmanifest`)

   ```json
   {
     "name": "Financial Management System",
     "short_name": "Finance Control",
     "icons": [
       {
         "src": "/android-chrome-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/android-chrome-512x512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ],
     "theme_color": "#ffffff",
     "background_color": "#ffffff",
     "display": "standalone"
   }
   ```

   d. **Ícones Adicionais**

   - `/public/android-chrome-192x192.png` (192x192 pixels)
   - `/public/android-chrome-512x512.png` (512x512 pixels)
   - `/public/favicon-16x16.png` (16x16 pixels)
   - `/public/favicon-32x32.png` (32x32 pixels)

   > 💡 **Dica**: Use o [RealFaviconGenerator](https://realfavicongenerator.net/) para gerar todos os ícones necessários a partir de uma única imagem.

### Verificação

Após implementar todas as otimizações, verifique se:

1. O site está indexando corretamente no Google Search Console
2. As imagens de OpenGraph aparecem corretamente ao compartilhar links
3. Os ícones aparecem em diferentes dispositivos e navegadores
4. O manifesto está funcionando para instalação PWA
5. As métricas de performance estão sendo coletadas
