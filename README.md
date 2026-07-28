# IssueTracker - Modern & Minimalist Jira Kanban

Aplicação web limpa e minimalista para gestão avançada de tarefas, múltiplos projetos, Épicos dinâmicos por projeto, Backlog de 2 caixas para planeamento de Sprints/Releases, colunas personalizadas e quadros Kanban.

## 🚀 Funcionalidades

- **Contorno e Demarcação Visível das Colunas em Dark Mode**:
  - As colunas do Quadro Kanban possuem um bordo visível e demarcado em estado de repouso (`border: 1px solid var(--border)` com `--border: #424647` e fundo `--bg-board: #2a2d2e`), eliminando o efeito de mistura com o fundo da página `#242426`.
- **Paleta Personalizada de Dark Mode (`#242426` e `#313536`)**:
  - Tema escuro com a paleta charcoal personalizada:
    - Fundo da página e do quadro: `#242426`
    - Cartões, barra superior, navegação lateral e modais: `#313536`
    - Bordos e acentuações: `#424647` com elevado contraste visual.
- **Espaçamento e Layout Respirável (Padding)**:
  - Espaçamento generoso (`padding: 24px 28px`) no topo, esquerda, direita e fundo em relação à barra superior e barra lateral.
- **Contorno de Coluna Destacado ao Arrastar Tarefas**:
  - Ao arrastar qualquer cartão no Quadro Kanban (`📊 Quadro`), a coluna de destino exibe instantaneamente um **contorno tracejado a azul primário (`#2563eb`)** com sombra em anel (`box-shadow`) e elevação suave.
- **Navegação Lateral (Sidebar) com Destaque Ativo**:
  - Barra lateral vertical esquerda com **📊 Quadro** e **📋 Backlog** com o indicador de seleção ativa (`active`).
- **Título do Projeto Clicável & Sincronizado**: Título principal no topo (`🚀 Nome do Projeto ▾`) com sincronização instantânea do nome do projeto ao alternar entre projetos.
- **Épicos 100% Isolados por Projeto**: Cada projeto possui a sua própria lista independente de Épicos (`project.epics`).
- **Workspace Limpo Sem Dados Pré-definidos**: O projeto inicia totalmente limpo (`issues: []`, `epics: []`, `sprints: []`).
- **Regras Estritas de Execução de Sprints**:
  - **Apenas 1 Sprint Ativo por Projeto**: Não é possível iniciar um novo Sprint sem concluir o Sprint ativo.
  - **Devolução Automática ao Backlog ao Concluir**: Tarefas não concluídas (`!= Done`) voltam automaticamente para o Backlog Geral ao concluir um Sprint.
- **Planeamento de Backlog em 2 Caixas (Layout Split)**:
  - **Caixa da Esquerda (Sprints & Releases)**: Formulário inline para criar novos Sprints/Releases e botão `▶️ Iniciar Sprint`.
  - **Caixa da Direita (Tarefas a Resolver / Pool do Backlog)**: Suporte a **Drag & Drop** para mover tarefas entre o Backlog e Sprints.
- **Quadro Kanban Focado em Sprints Ativos**: Exibe apenas colunas de trabalho ativas (`To Do`, `In Progress`, `In Review`, `Done`).
- **Definições do Projeto Limpas**: Modal simplificado para atualizar nome e descrição do projeto.
- **Menu de Opções**: Importação/Exportação CSV e gestão rápida de projetos.
