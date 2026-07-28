# IssueTracker - Modern & Minimalist Jira Kanban

Aplicação web limpa e minimalista para gestão avançada de tarefas, múltiplos projetos, Épicos dinâmicos por projeto, Backlog de 2 caixas para planeamento de Sprints/Releases, colunas personalizadas e quadros Kanban.

## 🚀 Funcionalidades

- **Título do Projeto Clicável & Sincronizado**:
  - Título principal no topo (`🚀 Nome do Projeto ▾`) com sincronização instantânea do nome do projeto ao alternar entre projetos ou editar os detalhes.
- **Épicos 100% Isolados por Projeto**:
  - Cada projeto possui a sua própria lista independente de Épicos (`project.epics`). Os Épicos criados no Projeto A nunca são partilhados com o Projeto B.
  - Alternar entre projetos no menu superior atualiza instantaneamente os seletores de tarefas e a barra de filtros para exibir exclusivamente os Épicos do projeto ativo.
- **Workspace Limpo Sem Dados Pré-definidos**:
  - O projeto inicia totalmente limpo (`issues: []`, `epics: []`, `sprints: []`), pronto para o utilizador criar a sua própria estrutura de raiz.
- **Criação e Gestão Dinâmica de Épicos**:
  - Épicos são criados à medida das necessidades do projeto através do atalho `+ Criar Épico` ou da opção `➕ Criar Novo Épico...` no modal de tarefas.
- **Regras Estritas de Execução de Sprints**:
  - **Apenas 1 Sprint Ativo por Projeto**: Não é possível iniciar um novo Sprint sem concluir o Sprint atualmente em execução.
  - **Devolução Automática ao Backlog ao Concluir**: Ao concluir um Sprint, todas as tarefas que **não estejam em estado `Done`** voltam automaticamente para o Backlog Geral para serem replaneadas em Sprints futuros.
- **Planeamento de Backlog em 2 Caixas (Layout Split)**:
  - **Caixa da Esquerda (Sprints & Releases)**: Formulário inline rápido para criar novos Sprints/Releases e botão `▶️ Iniciar Sprint`.
  - **Caixa da Direita (Tarefas a Resolver / Pool do Backlog)**: Suporte a **Drag & Drop** para mover tarefas entre o Backlog e Sprints.
- **Quadro Kanban Focado em Sprints Ativos**:
  - O Quadro Kanban (`📊 Quadro`) exibe apenas colunas de trabalho ativas (`To Do`, `In Progress`, `In Review`, `Done`).
  - **Estado Vazio Inteligente**: Se nenhum Sprint estiver ativo, exibe um banner com atalho para planear no Backlog.
- **Navegação Lateral (Sidebar)**: Barra lateral vertical esquerda com **📊 Quadro** e **📋 Backlog**.
- **Definições do Projeto Limpas**: Modal simplificado para atualizar nome e descrição do projeto.
- **Menu de Opções**: Importação/Exportação CSV e gestão rápida de projetos.
