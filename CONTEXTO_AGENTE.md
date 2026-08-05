# Contexto do Projeto: Maple Help 🍁

## 🤖 Para o Agente IA (Eu do futuro / em outro PC)
Se você está lendo este arquivo, você acabou de ser iniciado em um novo computador. Este arquivo serve para te dar todo o contexto do que já fizemos e quais são os próximos passos. Leia atentamente antes de sugerir novas mudanças.

## 📌 O que é o projeto?
O **Maple Help** é um sistema interno de helpdesk (abertura de chamados de TI e Manutenção) feito sob medida para uma escola da franquia **Maple Bear**. 

### 💻 Stack Tecnológica
- **Framework:** Next.js (App Router, Turbopack)
- **Estilização:** Tailwind CSS (foco em UI premium, moderna, sombras suaves, cores da marca)
- **Banco de Dados & Autenticação:** Supabase (PostgreSQL)
- **Linguagem:** TypeScript

### 🎨 Identidade Visual (Design System)
- **Cor Primária (Vermelho Maple Bear):** `#E31837`
- **Tons Escuros (Fundos e Contraste):** `#111315`, `zinc-900`, `zinc-800`
- **Estilo:** Clean, muito uso de sombras (depth/profundidade), cantos arredondados (`rounded-2xl`, `rounded-3xl`), animações de hover e interfaces amigáveis para professores.

---

## 🚀 O que já foi implementado (Blocos 1 ao 4 concluídos)

1. **Configuração Supabase & Auth:**
   - Supabase configurado no arquivo `lib/supabase.ts`. 
   - *Nota: As variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) precisam ser configuradas no arquivo `.env.local` deste novo computador.*

2. **Tela de Login (`app/page.tsx`):**
   - Tela dividida (split-screen). Esquerda branca com formulário, direita escura (`bg-zinc-800`) com a imagem `maple_bear_login.png`.
   - Lógica de Login e Cadastro alternável na mesma tela utilizando Supabase Auth.

3. **Hub Central (`app/menu/page.tsx`):**
   - Tela de redirecionamento pós-login.
   - Cabeçalho flutuante (card 3D) com nome do usuário e botão minimalista de logout.
   - Cards de navegação: "TI & Computadores" (leva para `/chamado`), "Manutenção Estrutural" (Em Breve).
   - **Regra de Negócio (Painel ADM):** O botão para o painel de administração (`/adm`) **só é renderizado** se o e-mail do usuário logado pertencer à equipe de TI (ex: contém `isaque@maple.local` ou `isaque@maplebear.com`).

4. **Abertura de Chamados (`app/chamado/page.tsx`):**
   - Formulário limpo e validado para professores.
   - Usa o mascote `maple_bear_chamado_02.png` no topo.
   - Salva os dados no Supabase usando a Server Action em `app/actions/chamados.ts`.

---

5. **Painel de Administração (`app/adm` e sub-rotas):**
   - Interface premium com abas/filtros para listagem de chamados.
   - Componente `ChamadoCard` para visualização individual de chamados.
   - Componente `ChamadoModal` para ver detalhes e ações do chamado (mudar status, deletar).
   - Confirmações de deleção seguras com `ConfirmModal`.
   - Feedback de ações em toda a plataforma através do `ToastProvider`.
   - Seção de `relatorios` implementada.

---

## 🎯 Próximo Passo: Bloco 6 (Manutenção Estrutural e Refinamentos)

O núcleo do sistema de chamados de TI está operando com sucesso. O próximo objetivo que o usuário (Isaque) pode pedir é:

**O que você deve implementar a seguir quando o usuário pedir:**
1. **Módulo de Manutenção Estrutural:** Habilitar o card de "Manutenção Estrutural" no menu (`app/menu/page.tsx`) e criar o fluxo de chamados específico para manutenção, separando os chamados de TI dos chamados de Manutenção.
2. **Sistema de Notificações:** Envio de e-mail ou notificação quando um chamado for atualizado ou respondido.
3. **Aprimoramentos de Relatórios:** Expandir a rota `/adm/relatorios` para incluir gráficos de chamados fechados vs abertos, tempo médio de resolução, etc.

Vá em frente e ajude o Isaque a continuar evoluindo o melhor sistema de chamados que a escola já viu! 🚀
