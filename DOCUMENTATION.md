# Documentação Oficial: Maple Help

## 1. Visão Geral do Projeto

**Maple Help** é um sistema de Help Desk e gerenciamento de chamados internos desenvolvido para a unidade Maple Bear Araxá. O objetivo principal do projeto é centralizar, organizar e otimizar o atendimento a requisições de TI, Manutenção e outras categorias, substituindo métodos informais por uma plataforma centralizada e de fácil acompanhamento.

---

## 2. Tecnologias Utilizadas (Stack)

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema de desenvolvimento web:

- **Next.js 16 (App Router)**: Framework React utilizado para renderização server-side (SSR) e construção de rotas.
- **React 19**: Biblioteca base para a construção da interface de usuário.
- **Tailwind CSS v4**: Framework CSS utility-first para estilização ágil e responsiva.
- **Supabase**: Backend as a Service (BaaS) utilizado para:
  - Banco de Dados PostgreSQL.
  - Autenticação e Gestão de Sessões (`@supabase/ssr`).
- **Zod**: Validação de schemas e payloads no backend.
- **TypeScript**: Tipagem estática em toda a base de código para garantir segurança na transição de dados.
- **Recharts**: Utilizado para visualização de dados (gráficos) e métricas na visão do administrador.
- **ExcelJS / File-Saver**: Ferramentas para exportação de dados e relatórios no painel ADM.

---

## 3. Arquitetura e Padrões de Projeto

- **Server Actions**: O projeto substitui o antigo padrão de API Routes do Next.js pelo uso de Server Actions (arquivos com a diretiva `'use server'`). Todas as interações com o banco de dados (como abrir um chamado, editar e deletar) ocorrem de maneira segura no servidor, em `app/actions/chamados.ts`.
- **Proteção na Borda (Middleware)**: Utiliza `middleware.ts` para interceptar requisições. O middleware checa o cookie de sessão do Supabase de forma nativa e redireciona usuários que tentam acessar o painel administrativo (`/adm`) sem a devida autorização.
- **Design System Customizado**: Em vez de bibliotecas pesadas de UI, o projeto opta por construir componentes customizados acessíveis usando Tailwind (ex: `ChamadoModal.tsx`, `ConfirmModal.tsx`, `ToastProvider.tsx`).

---

## 4. Funcionalidades Principais

### Para Usuários Comuns (Professores / Funcionários)
- **Autenticação Institucional**: O sistema restringe cadastros apenas para usuários que possuam o domínio oficial da escola (`@maplebeararaxa.com.br`).
- **Abertura de Chamados**: Os usuários podem abrir chamados preenchendo Solicitante, Local, Categoria, Descrição e URL de Anexos.
- **Acompanhamento (Meus Chamados)**: Tela específica onde o usuário consegue visualizar o andamento de seus próprios chamados através do vínculo direto pelo `user_id`.

### Para Administradores (TI / Manutenção)
- **Painel Administrativo (`/adm`)**: Área restrita. O acesso é verificado de forma segura baseando-se em uma variável de ambiente que define os administradores autorizados.
- **Gestão de Chamados**:
  - **Status**: O chamado tem o clico de vida `Pendente` → `Em Andamento` → `Concluído`.
  - **Assumir Chamado**: Um admin pode "Assumir" um chamado pendente.
  - **Finalizar Chamado**: Ao concluir um atendimento, é obrigatório registrar o **Tempo Gasto** (ex: 30m, 1h) e as **Notas de Resolução** sobre o que foi consertado.
- **Estatísticas e Exportação**: Módulo focado em relatório gerencial, capaz de filtrar chamados e exportar históricos para planilhas `.xlsx`.

---

## 5. Histórico de Evolução e Refatorações Recentes

Ao longo do seu ciclo de vida, o projeto passou por auditorias e melhorias para se adequar ao padrão "Nível Sênior" de escalabilidade. A última grande refatoração trouxe os seguintes avanços:

1. **Desacoplamento de Administradores**: Inicialmente os emails de administradores estavam *hardcoded* (fixos) no código do projeto (`lib/utils.ts`). Na refatoração, o sistema passou a ler a lista de e-mails dinamicamente através da variável de ambiente `ADMIN_EMAILS` contida no `.env.local` e no sistema de deploy da Vercel. Isso garante que a adição/remoção de admins seja feita sem a necessidade de novos deploys de código.
2. **Correção de Anti-patterns no React**: Componentes complexos (como o `ChamadoModal.tsx`) que possuíam manipulação direta de DOM para renderização de erros visuais (via `document.getElementById`) foram totalmente convertidos para os princípios declarativos do React, gerindo estado via hooks (`useState`) e renderização condicional por classes Tailwind (`className`).
3. **Consistência de Identidade do Usuário (user_id)**: Anteriormente as rotas permitiam criar chamados anônimos internamente, o que quebrava o filtro da view "Meus Chamados". A ação de `abrirChamado` no backend foi atualizada para extrair o JWT e a sessão via `@supabase/ssr` e automaticamente injetar o ID do dono na linha do banco de dados na coluna UUID `user_id`.
4. **Alinhamento do Banco de Dados (Supabase)**: O schema relacional foi retificado na nuvem com comandos para ligar os chamados à tabela primária de usuários (`auth.users`), implementando também a proteção de domínio corporativo (`@maplebeararaxa.com.br`) nativamente dentro da configuração de segurança no dashboard do Supabase (para impedir bypass pelo frontend).

---

## 6. Próximos Passos Sugeridos no Roadmap

- **Integração Upstash (Redis)**: Migrar o atual Rate Limiter de "memória interna" para uma solução externa distribuída com Redis para mitigar ataques DDoS ou spam em infraestrutura Serverless.
- **Sistema de Notificações Internas**: Acoplar uma trigger no banco que envie e-mail (via Resend ou serviço nativo) alertando o criador do chamado quando este for "Assumido" ou "Finalizado" por um admin. 
- **Roles (RBAC) via Supabase**: Substituir o controle de administrador baseado em "Variáveis de Ambiente de E-mail" por tabelas de perfis (`profiles`) ou claims JWT atrelados a Row Level Security (RLS) diretamente no banco.

---
_Documentação gerada automaticamente acompanhando as mudanças arquiteturais e manutenções do projeto._
