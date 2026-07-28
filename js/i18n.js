// Internationalization (i18n) System for PT and EN

const TRANSLATIONS = {
    pt: {
        // Navigation & Header
        nav_board: "Quadro",
        nav_backlog: "Backlog",
        btn_new_task: "+ Nova Tarefa",
        btn_filters: "Filtros",
        btn_options: "⚙️ Opções ▾",
        export_csv: "📥 Exportar CSV",
        import_csv: "📂 Importar CSV",
        clear_board: "🗑️ Apagar Quadro",
        delete_project: "❌ Eliminar Projeto",
        
        // Filters
        filter_search_ph: "🔍 Pesquisar por título, ID...",
        filter_epic: "Épico:",
        filter_sprint: "Sprint/Release:",
        filter_type: "Tipo:",
        filter_priority: "Prioridade:",
        filter_all: "Todos",
        filter_all_sprints: "Todos os Sprints",
        filter_no_sprint: "Sem Sprint (Apenas Backlog)",
        filter_all_priorities: "Todas",
        filter_high: "Alta 🔴",
        filter_med: "Média 🟡",
        filter_low: "Baixa 🟢",
        filter_clear: "Limpar Filtros",

        // Board & Empty State
        board_no_active_sprint_title: "Nenhum Sprint Ativo no Quadro",
        board_no_active_sprint_desc: "Vá ao Backlog para planear as suas tarefas num Sprint/Release e clique em \"▶️ Iniciar Sprint\" para ativar o quadro.",
        board_go_to_backlog_btn: "📋 Ir para o Backlog & Planear Sprint",
        btn_add_column: "➕ Adicionar Coluna",

        // Backlog 2-Box View
        backlog_sprints_header: "🏃 Sprints & Releases",
        backlog_sprint_name_ph: "Ex: Sprint 1 - Lançamento MVP...",
        backlog_sprint_goal_ph: "Objetivo do Sprint (opcional)...",
        btn_create_sprint: "+ Criar Sprint / Release",
        no_sprints_created: "Nenhum Sprint criado. Crie um Sprint acima para começar a planear.",
        backlog_pool_header: "📋 Tarefas a Resolver",
        backlog_empty_pool: "Nenhuma tarefa pendente no Backlog Geral!",
        btn_start_sprint: "▶️ Iniciar Sprint",
        btn_conclude_sprint: "✅ Concluir",
        btn_reopen_sprint: "↩️ Reabrir",
        sprint_status_active: "🟢 Sprint Ativo",
        sprint_status_planned: "🔵 Planeado",
        sprint_status_completed: "⚪ Concluído",

        // Modals
        modal_create_task_title: "Criar Nova Tarefa",
        modal_edit_task_title: "Editar Tarefa",
        label_title: "Título",
        label_desc: "Descrição",
        label_type: "Tipo de Tarefa",
        label_epic: "Épico",
        btn_create_epic: "+ Criar Épico",
        label_sprint: "Sprint / Release",
        label_priority: "Prioridade",
        label_story_points: "Story Points",
        label_assignee: "Atribuído a",
        label_status: "Coluna (Estado)",
        label_subtasks: "Subtarefas (Checklist)",
        subtask_ph: "Adicionar nova subtarefa...",
        btn_add_subtask: "+ Adicionar",
        btn_cancel: "Cancelar",
        btn_save: "Guardar",
        btn_delete: "🗑️ Eliminar",

        // Alerts & Prompts
        alert_sprint_active_exists: "Já existe um Sprint ativo (\"{name}\"). Conclua o Sprint ativo antes de iniciar um novo.",
        confirm_conclude_sprint: "Concluir o Sprint \"{name}\"? As tarefas não concluídas voltarão para o Backlog Geral.",
        confirm_delete_sprint: "Eliminar o sprint \"{name}\"? As tarefas associadas voltarão ao Backlog geral.",
        prompt_new_epic: "Nome do novo Épico (ex: Design System, Checkout, Infraestrutura):",
        no_epic_option: "Sem Épico",
        no_epic_ph_option: "Sem Épico (Clique em + Criar Épico)",
        create_new_epic_opt: "➕ Criar Novo Épico..."
    },
    en: {
        // Navigation & Header
        nav_board: "Board",
        nav_backlog: "Backlog",
        btn_new_task: "+ New Task",
        btn_filters: "Filters",
        btn_options: "⚙️ Options ▾",
        export_csv: "📥 Export CSV",
        import_csv: "📂 Import CSV",
        clear_board: "🗑️ Clear Board",
        delete_project: "❌ Delete Project",
        
        // Filters
        filter_search_ph: "🔍 Search by title, ID...",
        filter_epic: "Epic:",
        filter_sprint: "Sprint/Release:",
        filter_type: "Type:",
        filter_priority: "Priority:",
        filter_all: "All",
        filter_all_sprints: "All Sprints",
        filter_no_sprint: "No Sprint (Backlog Only)",
        filter_all_priorities: "All",
        filter_high: "High 🔴",
        filter_med: "Medium 🟡",
        filter_low: "Low 🟢",
        filter_clear: "Clear Filters",

        // Board & Empty State
        board_no_active_sprint_title: "No Active Sprint on Board",
        board_no_active_sprint_desc: "Go to Backlog to plan your tasks in a Sprint/Release and click \"▶️ Start Sprint\" to activate the board.",
        board_go_to_backlog_btn: "📋 Go to Backlog & Plan Sprint",
        btn_add_column: "➕ Add Column",

        // Backlog 2-Box View
        backlog_sprints_header: "🏃 Sprints & Releases",
        backlog_sprint_name_ph: "Ex: Sprint 1 - MVP Launch...",
        backlog_sprint_goal_ph: "Sprint Goal (optional)...",
        btn_create_sprint: "+ Create Sprint / Release",
        no_sprints_created: "No Sprints created yet. Create a Sprint above to start planning.",
        backlog_pool_header: "📋 Issues to Solve",
        backlog_empty_pool: "No pending issues in the General Backlog!",
        btn_start_sprint: "▶️ Start Sprint",
        btn_conclude_sprint: "✅ Complete",
        btn_reopen_sprint: "↩️ Reopen",
        sprint_status_active: "🟢 Active Sprint",
        sprint_status_planned: "🔵 Planned",
        sprint_status_completed: "⚪ Completed",

        // Modals
        modal_create_task_title: "Create New Task",
        modal_edit_task_title: "Edit Task",
        label_title: "Title",
        label_desc: "Description",
        label_type: "Task Type",
        label_epic: "Epic",
        btn_create_epic: "+ Create Epic",
        label_sprint: "Sprint / Release",
        label_priority: "Priority",
        label_story_points: "Story Points",
        label_assignee: "Assignee",
        label_status: "Column (Status)",
        label_subtasks: "Subtasks (Checklist)",
        subtask_ph: "Add new subtask...",
        btn_add_subtask: "+ Add",
        btn_cancel: "Cancel",
        btn_save: "Save",
        btn_delete: "🗑️ Delete",

        // Alerts & Prompts
        alert_sprint_active_exists: "An active Sprint already exists (\"{name}\"). Please complete the active Sprint before starting a new one.",
        confirm_conclude_sprint: "Complete Sprint \"{name}\"? Incomplete tasks will return to the General Backlog.",
        confirm_delete_sprint: "Delete sprint \"{name}\"? Associated tasks will return to the general Backlog.",
        prompt_new_epic: "New Epic name (e.g. Design System, Checkout, Infrastructure):",
        no_epic_option: "No Epic",
        no_epic_ph_option: "No Epic (Click + Create Epic)",
        create_new_epic_opt: "➕ Create New Epic..."
    }
};

let currentLang = localStorage.getItem('trilhosLang') || 'pt';

function getCurrentLang() {
    return currentLang;
}

function t(key, params = {}) {
    let text = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || (TRANSLATIONS['pt'][key]) || key;
    Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return text;
}

function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('trilhosLang', lang);
    updateLangSelect();
    applyTranslations();
    renderCurrentView();
}

function updateLangSelect() {
    const flagElem = document.getElementById('currentLangFlag');
    const textElem = document.getElementById('currentLangText');
    if (flagElem && textElem) {
        flagElem.innerText = currentLang === 'pt' ? '🇵🇹' : '🇬🇧';
        textElem.innerText = currentLang === 'pt' ? 'PT' : 'EN';
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (key && TRANSLATIONS[currentLang][key]) {
            elem.innerText = TRANSLATIONS[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-ph');
        if (key && TRANSLATIONS[currentLang][key]) {
            elem.setAttribute('placeholder', TRANSLATIONS[currentLang][key]);
        }
    });
}
