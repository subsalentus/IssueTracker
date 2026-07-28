// Default Initial State (Empty for user creation)
const DEFAULT_WORKSPACE = {
    activeProjectId: "TRL",
    projects: [
        {
            key: "TRL",
            name: "App Trilhos Portugal",
            description: "Gestão e desenvolvimento da aplicação Trilhos Portugal",
            columns: [
                { id: "backlog", title: "Backlog" },
                { id: "todo", title: "To Do" },
                { id: "in-progress", title: "In Progress" },
                { id: "review", title: "In Review" },
                { id: "done", title: "Done" }
            ],
            sprints: [],
            epics: [],
            issues: []
        }
    ]
};

const ISSUE_TYPE_ICONS = {
    'Task': '📑',
    'Bug': '🐛',
    'Story': '📖',
    'Epic': '⚡',
    'Feature': '🌟'
};

let workspace = JSON.parse(localStorage.getItem('trilhosWorkspace')) || JSON.parse(JSON.stringify(DEFAULT_WORKSPACE));
let currentView = 'board'; // 'board' or 'backlog'
let draggedTicketId = null;
let currentEditingId = null; // null if creating new ticket, string ID if editing

// Workspace Migration: Ensure structure & arrays exist in all projects
function migrateWorkspaceData() {
    if (!workspace || !workspace.projects) {
        workspace = JSON.parse(JSON.stringify(DEFAULT_WORKSPACE));
        return;
    }

    workspace.projects.forEach(project => {
        if (!project.columns) project.columns = [];
        const hasBacklogCol = project.columns.some(c => c.id === 'backlog');
        if (!hasBacklogCol) {
            project.columns.unshift({ id: "backlog", title: "Backlog" });
        }
        if (!project.sprints) project.sprints = [];
        if (!project.epics) project.epics = [];
        if (!project.issues) project.issues = [];
    });
    saveWorkspace();
}

migrateWorkspaceData();

// Theme Initialization
const savedTheme = localStorage.getItem('trilhosTheme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeButtonText(savedTheme);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('trilhosTheme', newTheme);
    updateThemeButtonText(newTheme);
}

function updateThemeButtonText(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

function getActiveProject() {
    let proj = workspace.projects.find(p => p.key === workspace.activeProjectId);
    if (!proj && workspace.projects.length > 0) {
        proj = workspace.projects[0];
        workspace.activeProjectId = proj.key;
    }
    return proj;
}

function saveWorkspace() {
    localStorage.setItem('trilhosWorkspace', JSON.stringify(workspace));
}

// View Switching (Board vs Backlog)
function switchView(viewName) {
    currentView = viewName;
    const boardTab = document.getElementById('sidebarTabBoard');
    const backlogTab = document.getElementById('sidebarTabBacklog');
    const boardWrapper = document.getElementById('boardWrapper');
    const backlogContainer = document.getElementById('backlogViewContainer');

    if (boardTab && backlogTab) {
        if (viewName === 'board') {
            boardTab.classList.add('active');
            backlogTab.classList.remove('active');
            boardWrapper.style.display = 'flex';
            backlogContainer.style.display = 'none';
        } else {
            boardTab.classList.remove('active');
            backlogTab.classList.add('active');
            boardWrapper.style.display = 'none';
            backlogContainer.style.display = 'flex';
        }
    }

    renderCurrentView();
}

// Filter handling & animations
function toggleFilterBar() {
    const filterToolbar = document.getElementById('filterToolbar');
    const btn = document.getElementById('toggleFilterBtn');
    filterToolbar.classList.toggle('show');
    btn.classList.toggle('active', filterToolbar.classList.contains('show'));
}

function onFilterChange() {
    updateFilterBadgeCount();
    renderCurrentView();
}

function updateFilterBadgeCount() {
    const filterEpic = document.getElementById('filterEpic').value;
    const filterSprint = document.getElementById('filterSprint')?.value || 'Todos';
    const filterPriority = document.getElementById('filterPriority').value;
    const filterType = document.getElementById('filterType').value;
    const searchText = document.getElementById('searchInput').value.trim();

    let activeCount = 0;
    if (filterEpic !== 'Todos') activeCount++;
    if (filterSprint !== 'Todos') activeCount++;
    if (filterPriority !== 'Todos') activeCount++;
    if (filterType !== 'Todos') activeCount++;
    if (searchText !== '') activeCount++;

    const badge = document.getElementById('filterActiveBadge');
    if (badge) {
        if (activeCount > 0) {
            badge.innerText = activeCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function toggleProjectTitleDropdown() {
    const menu = document.getElementById('projectTitleDropdown');
    if (menu) menu.classList.toggle('show');
}

function toggleActionsDropdown() {
    const menu = document.getElementById('actionsDropdown');
    menu.classList.toggle('show');
}

// Close dropdowns when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.project-title-dropdown')) {
        const projMenu = document.getElementById('projectTitleDropdown');
        if (projMenu) projMenu.classList.remove('show');
    }
    if (!e.target.closest('.dropdown:not(.project-title-dropdown)')) {
        const menu = document.getElementById('actionsDropdown');
        if (menu) menu.classList.remove('show');
    }
});

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterEpic').value = 'Todos';
    if (document.getElementById('filterSprint')) document.getElementById('filterSprint').value = 'Todos';
    document.getElementById('filterType').value = 'Todos';
    document.getElementById('filterPriority').value = 'Todos';
    onFilterChange();
}

// Project Selector (Title Dropdown)
function renderProjectSelector() {
    const project = getActiveProject();
    const titleElem = document.getElementById('currentProjectTitle');
    if (titleElem && project) {
        titleElem.innerText = project.name;
    }

    const listContainer = document.getElementById('projectListItems');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    workspace.projects.forEach(p => {
        const btn = document.createElement('button');
        const isActive = p.key === workspace.activeProjectId;
        btn.className = `dropdown-item ${isActive ? 'project-item-active' : ''}`;
        btn.innerHTML = `<span>🚀 ${escapeHTML(p.name)}</span> <span style="margin-left:auto; font-size:11px; opacity:0.7;">(${p.key})</span>`;
        btn.onclick = () => {
            switchProject(p.key);
            const menu = document.getElementById('projectTitleDropdown');
            if (menu) menu.classList.remove('show');
        };
        listContainer.appendChild(btn);
    });
}

function switchProject(key) {
    workspace.activeProjectId = key;
    saveWorkspace();
    renderProjectSelector();
    updateFilterDropdowns();
    renderCurrentView();
}

function openNewProjectModal() {
    document.getElementById('newProjectKey').value = '';
    document.getElementById('newProjectName').value = '';
    document.getElementById('newProjectDesc').value = '';
    document.getElementById('newProjectModalOverlay').classList.add('active');
}

function saveNewProjectModal() {
    const key = document.getElementById('newProjectKey').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const name = document.getElementById('newProjectName').value.trim();
    const desc = document.getElementById('newProjectDesc').value.trim();

    if (!key || !name) {
        alert('Preencha a Chave e o Nome do Projeto.');
        return;
    }

    if (workspace.projects.some(p => p.key === key)) {
        alert('Já existe um projeto com esta chave!');
        return;
    }

    workspace.projects.push({
        key: key,
        name: name,
        description: desc,
        columns: [
            { id: "backlog", title: "Backlog" },
            { id: "todo", title: "To Do" },
            { id: "in-progress", title: "In Progress" },
            { id: "review", title: "In Review" },
            { id: "done", title: "Done" }
        ],
        sprints: [],
        epics: [],
        issues: []
    });

    workspace.activeProjectId = key;
    saveWorkspace();

    closeNewProjectModal();
    renderProjectSelector();
    updateFilterDropdowns();
    renderCurrentView();
}

function closeNewProjectModal() {
    document.getElementById('newProjectModalOverlay').classList.remove('active');
}

function deleteCurrentProject() {
    const project = getActiveProject();
    if (workspace.projects.length <= 1) {
        alert('Não pode eliminar o único projeto existente!');
        return;
    }

    if (confirm(`Eliminar o projeto "${project.name}" (${project.key}) e todas as suas tarefas?`)) {
        workspace.projects = workspace.projects.filter(p => p.key !== project.key);
        workspace.activeProjectId = workspace.projects[0].key;
        saveWorkspace();

        renderProjectSelector();
        updateFilterDropdowns();
        renderCurrentView();
    }
}

// Project Settings Modal
function openProjectSettingsModal() {
    const project = getActiveProject();
    document.getElementById('settingsProjectKey').value = project.key;
    document.getElementById('settingsProjectName').value = project.name;
    document.getElementById('settingsProjectDesc').value = project.description || '';
    document.getElementById('projectSettingsModalOverlay').classList.add('active');
}

function closeProjectSettingsModal() {
    document.getElementById('projectSettingsModalOverlay').classList.remove('active');
}

function saveProjectDetails() {
    const project = getActiveProject();
    const name = document.getElementById('settingsProjectName').value.trim();
    const desc = document.getElementById('settingsProjectDesc').value.trim();

    if (!name) {
        alert('O nome do projeto não pode estar vazio.');
        return;
    }

    project.name = name;
    project.description = desc;
    saveWorkspace();

    renderProjectSelector();
    renderCurrentView();
    closeProjectSettingsModal();
}

function setSprintStatus(sprintId, status) {
    const project = getActiveProject();
    const sprint = project.sprints.find(s => s.id === sprintId);
    if (!sprint) return;

    if (status === 'active') {
        const currentActive = (project.sprints || []).find(s => s.status === 'active' && s.id !== sprintId);
        if (currentActive) {
            alert(`Já existe um Sprint ativo ("${currentActive.name}"). Conclua o Sprint ativo antes de iniciar um novo.`);
            return;
        }
    }

    if (status === 'completed') {
        if (!confirm(`Concluir o Sprint "${sprint.name}"? As tarefas não concluídas voltarão para o Backlog Geral.`)) {
            return;
        }
        // Return incomplete tasks to Backlog
        project.issues.forEach(i => {
            if (i.sprintId === sprintId && i.status !== 'done') {
                i.status = 'backlog';
                i.sprintId = null;
            }
        });
    }

    sprint.status = status;
    saveWorkspace();
    renderCurrentView();
}

function deleteSprint(sprintId) {
    const project = getActiveProject();
    const sprint = project.sprints.find(s => s.id === sprintId);
    if (!sprint) return;

    if (confirm(`Eliminar o sprint "${sprint.name}"? As tarefas associadas voltarão ao Backlog geral.`)) {
        project.sprints = project.sprints.filter(s => s.id !== sprintId);
        project.issues.forEach(i => {
            if (i.sprintId === sprintId) i.sprintId = null;
        });

        saveWorkspace();
        renderCurrentView();
    }
}

// Columns CRUD
function openAddColumnModal() {
    const title = prompt('Nome da nova coluna:');
    if (!title || !title.trim()) return;

    const project = getActiveProject();
    const colId = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (project.columns.some(c => c.id === colId)) {
        alert('Já existe uma coluna semelhante!');
        return;
    }

    project.columns.push({ id: colId, title: title.trim() });
    saveWorkspace();
    renderCurrentView();
}

function deleteColumn(colId) {
    const project = getActiveProject();
    if (colId === 'backlog') {
        alert('A coluna de Backlog não pode ser eliminada.');
        return;
    }

    if (project.columns.length <= 2) {
        alert('O quadro tem de ter pelo menos 1 coluna de trabalho além do Backlog!');
        return;
    }

    const col = project.columns.find(c => c.id === colId);
    if (confirm(`Eliminar coluna "${col.title}"? Tarefas existentes serão movidas para "To Do".`)) {
        project.columns = project.columns.filter(c => c.id !== colId);
        const fallbackId = project.columns.find(c => c.id !== 'backlog')?.id || 'todo';
        project.issues.forEach(i => { if (i.status === colId) i.status = fallbackId; });

        saveWorkspace();
        renderCurrentView();
    }
}

// Filters Populator
function updateFilterDropdowns() {
    const project = getActiveProject();
    const epicSelect = document.getElementById('filterEpic');
    const currentEpic = epicSelect.value;
    const allEpics = [...new Set([...(project.epics || []), ...project.issues.map(i => i.epic)])].filter(Boolean).sort();

    let epicHTML = '<option value="Todos">Todos</option>';
    allEpics.forEach(epic => epicHTML += `<option value="${escapeHTML(epic)}">${escapeHTML(epic)}</option>`);

    epicSelect.innerHTML = epicHTML;
    epicSelect.value = (currentEpic === "Todos" || allEpics.includes(currentEpic)) ? currentEpic : "Todos";

    // Sprint Filter
    const sprintSelect = document.getElementById('filterSprint');
    if (sprintSelect) {
        const currentSprint = sprintSelect.value;
        let sprintHTML = '<option value="Todos">Todos os Sprints</option>';
        sprintHTML += '<option value="none">Sem Sprint (Apenas Backlog)</option>';
        (project.sprints || []).forEach(s => {
            sprintHTML += `<option value="${s.id}">${escapeHTML(s.name)}</option>`;
        });
        sprintSelect.innerHTML = sprintHTML;
        sprintSelect.value = (currentSprint === "Todos" || currentSprint === "none" || (project.sprints || []).some(s => s.id === currentSprint)) ? currentSprint : "Todos";
    }

    // Update Backlog badge in tab
    const backlogCount = project.issues.filter(i => i.status === 'backlog' || !i.sprintId).length;
    const backlogBadge = document.getElementById('backlogCountBadge');
    if (backlogBadge) backlogBadge.innerText = backlogCount;
}

// Render Controller
function renderCurrentView() {
    updateFilterDropdowns();
    updateFilterBadgeCount();

    if (currentView === 'board') {
        renderBoard();
    } else {
        renderBacklogView();
    }
}

// Render Board (Kanban View)
function renderBoard() {
    const project = getActiveProject();
    const boardWrapper = document.getElementById('boardWrapper');
    boardWrapper.innerHTML = '';

    const filterEpic = document.getElementById('filterEpic').value;
    const filterSprint = document.getElementById('filterSprint')?.value || 'Todos';
    const filterPriority = document.getElementById('filterPriority').value;
    const filterType = document.getElementById('filterType').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

    // Check Active Sprints
    const activeSprints = (project.sprints || []).filter(s => s.status === 'active');

    // If no active sprint, display friendly empty state banner
    if (activeSprints.length === 0) {
        boardWrapper.innerHTML = `
            <div class="empty-board-banner" style="width:100%; max-width:640px; margin:40px auto; text-align:center; padding:48px 24px; background:var(--bg-card); border:2px dashed var(--border); border-radius:var(--radius); box-shadow:var(--shadow-sm);">
                <span style="font-size:48px; display:block; margin-bottom:12px;">🏃💨</span>
                <h3 style="font-size:20px; font-weight:800; margin:0 0 8px 0; color:var(--text-main);">Nenhum Sprint Ativo no Quadro</h3>
                <p style="color:var(--text-muted); font-size:14px; margin:0 0 20px 0; line-height:1.5;">
                    Vá ao Backlog para planear as suas tarefas num Sprint/Release e clique em <strong style="color:var(--primary);">"▶️ Iniciar Sprint"</strong> para ativar o quadro.
                </p>
                <button class="btn-primary" onclick="switchView('backlog')" style="font-size:14px; padding:10px 20px;">📋 Ir para o Backlog & Planear Sprint</button>
            </div>
        `;
        return;
    }

    // Render Working Columns Only (exclude Backlog column)
    const activeBoardColumns = project.columns.filter(c => c.id !== 'backlog');

    activeBoardColumns.forEach(col => {
        const colElem = document.createElement('div');
        colElem.className = 'column';
        colElem.id = col.id;
        colElem.ondragenter = dragEnter;
        colElem.ondragover = dragOver;
        colElem.ondragleave = dragLeave;
        colElem.ondrop = drop;

        colElem.innerHTML = `
            <div class="column-header">
                <div class="column-title-group">
                    <span>${escapeHTML(col.title)}</span>
                    <span class="issue-count" id="count-${col.id}">0</span>
                </div>
                <button class="icon-btn" onclick="deleteColumn('${col.id}')" title="Eliminar Coluna">🗑️</button>
            </div>
            <div class="tickets-container" id="container-${col.id}"></div>
        `;
        boardWrapper.appendChild(colElem);
    });

    // Add Column Button
    const addColBtn = document.createElement('button');
    addColBtn.className = 'add-column-btn';
    addColBtn.onclick = openAddColumnModal;
    addColBtn.innerHTML = `<span>➕ Adicionar Coluna</span>`;
    boardWrapper.appendChild(addColBtn);

    let counts = {};
    activeBoardColumns.forEach(c => counts[c.id] = 0);

    // Filter & Render Issues for Active Sprints Only
    project.issues.forEach(issue => {
        // Only display issue if it belongs to an active sprint
        const isIssueInActiveSprint = activeSprints.some(s => s.id === issue.sprintId);
        if (!isIssueInActiveSprint) return;

        if (filterEpic !== "Todos" && issue.epic !== filterEpic) return;
        if (filterSprint !== "Todos") {
            if (filterSprint === "none" && issue.sprintId) return;
            if (filterSprint !== "none" && issue.sprintId !== filterSprint) return;
        }
        if (filterPriority !== "Todos" && issue.priority !== filterPriority) return;
        if (filterType !== "Todos" && issue.type !== filterType) return;
        if (searchText && !issue.title.toLowerCase().includes(searchText) && 
            !issue.id.toLowerCase().includes(searchText) && 
            !(issue.description || '').toLowerCase().includes(searchText)) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'ticket';
        card.draggable = true;
        card.id = issue.id;

        card.ondragstart = dragStart;
        card.ondragend = dragEnd;

        card.onclick = (e) => {
            if (e.target.closest('.ticket-actions')) return;
            openEditModal(issue.id);
        };

        const typeIcon = ISSUE_TYPE_ICONS[issue.type] || '📑';
        const priorityEmoji = { 'Alta': '🔴', 'Média': '🟡', 'Baixa': '🟢' }[issue.priority] || '🟡';
        
        const subtasks = issue.subtasks || [];
        const completedSubtasks = subtasks.filter(s => s.completed).length;
        const totalSubtasks = subtasks.length;
        const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        const assignedSprint = (project.sprints || []).find(s => s.id === issue.sprintId);

        card.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-type-id">
                    <span>${typeIcon}</span>
                    <span class="ticket-id">${issue.id}</span>
                </div>
                <div class="ticket-actions">
                    <button class="icon-btn" onclick="openEditModal('${issue.id}')" title="Editar">✏️</button>
                    <button class="icon-btn" onclick="deleteTicket('${issue.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
            <h4 class="ticket-title">${escapeHTML(issue.title)}</h4>
            ${issue.description ? `<p class="ticket-description">${escapeHTML(issue.description)}</p>` : ''}
            
            ${totalSubtasks > 0 ? `
                <div class="subtasks-progress">
                    <span>Subtarefas (${completedSubtasks}/${totalSubtasks})</span>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>
            ` : ''}

            <div class="ticket-footer">
                ${assignedSprint ? `<span class="sprint-badge" title="Sprint">🏃 ${escapeHTML(assignedSprint.name.split('-')[0].trim())}</span>` : ''}
                <span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>
                <span class="badge priority-${issue.priority}">${priorityEmoji} ${issue.priority}</span>
                ${issue.storyPoints ? `<span class="story-points-badge">${issue.storyPoints} pt</span>` : ''}
                ${issue.assignee ? `<span class="assignee-avatar" title="Atribuído a: ${escapeHTML(issue.assignee)}">${escapeHTML(issue.assignee.substring(0,2).toUpperCase())}</span>` : ''}
            </div>
        `;

        const container = document.getElementById(`container-${issue.status}`) || document.getElementById(`container-${activeBoardColumns[0].id}`);
        if (container) {
            container.appendChild(card);
            if (counts[issue.status] !== undefined) counts[issue.status]++;
        }
    });

    Object.keys(counts).forEach(colId => {
        const countElem = document.getElementById(`count-${colId}`);
        if (countElem) countElem.innerText = counts[colId];
    });
}

// Render Backlog View with 2-Box Split Layout (Left: Sprints/Releases, Right: Issues Pool)
function renderBacklogView() {
    const project = getActiveProject();
    const backlogContainer = document.getElementById('backlogViewContainer');
    backlogContainer.innerHTML = '';

    const filterEpic = document.getElementById('filterEpic').value;
    const filterPriority = document.getElementById('filterPriority').value;
    const filterType = document.getElementById('filterType').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

    // Filter Issues
    const filteredIssues = project.issues.filter(issue => {
        if (filterEpic !== "Todos" && issue.epic !== filterEpic) return false;
        if (filterPriority !== "Todos" && issue.priority !== filterPriority) return false;
        if (filterType !== "Todos" && issue.type !== filterType) return false;
        if (searchText && !issue.title.toLowerCase().includes(searchText) && 
            !issue.id.toLowerCase().includes(searchText) && 
            !(issue.description || '').toLowerCase().includes(searchText)) {
            return false;
        }
        return true;
    });

    const splitLayout = document.createElement('div');
    splitLayout.className = 'backlog-split-layout';

    // LEFT BOX: Sprints & Releases Planning
    const leftBox = document.createElement('div');
    leftBox.className = 'backlog-box';

    const inlineCreateHTML = `
        <div class="backlog-section-header">
            <h3 class="backlog-section-title">🏃 Sprints & Releases</h3>
        </div>
        <div class="inline-create-sprint">
            <input type="text" id="inlineSprintName" placeholder="Ex: Sprint 1 - Lançamento MVP..." onkeydown="if(event.key==='Enter') createInlineSprint()">
            <input type="text" id="inlineSprintGoal" placeholder="Objetivo do Sprint (opcional)..." onkeydown="if(event.key==='Enter') createInlineSprint()">
            <button class="btn-primary" style="align-self:flex-end; font-size:13px;" onclick="createInlineSprint()">+ Criar Sprint / Release</button>
        </div>
        <div id="leftSprintsList" style="display:flex; flex-direction:column; gap:16px; margin-top:8px;"></div>
    `;
    leftBox.innerHTML = inlineCreateHTML;
    splitLayout.appendChild(leftBox);

    // RIGHT BOX: Issues to Solve (Unassigned Backlog Pool)
    const rightBox = document.createElement('div');
    rightBox.className = 'backlog-box';

    const backlogPoolIssues = filteredIssues.filter(i => !i.sprintId || i.status === 'backlog');

    const poolDropzoneId = 'backlog-pool-dropzone';
    rightBox.innerHTML = `
        <div class="backlog-section-header">
            <h3 class="backlog-section-title">
                📋 Tarefas a Resolver
                <span class="backlog-section-count">${backlogPoolIssues.length} tarefas</span>
            </h3>
            <button class="btn-primary" onclick="openCreateModalWithStatus('backlog')">+ Nova Tarefa</button>
        </div>
        <div class="sprint-dropzone" id="${poolDropzoneId}" 
             style="min-height:380px; flex:1;"
             ondragover="sprintDragOver(event)" 
             ondragleave="sprintDragLeave(event)" 
             ondrop="sprintDrop(event, null)">
        </div>
    `;
    splitLayout.appendChild(rightBox);

    backlogContainer.appendChild(splitLayout);

    // Populate Left Box Sprints
    const leftSprintsList = document.getElementById('leftSprintsList');
    const sprints = project.sprints || [];

    if (sprints.length === 0) {
        leftSprintsList.innerHTML = `<p style="color:var(--text-muted); font-size:13px; font-style:italic;">Nenhum Sprint criado. Crie um Sprint acima para começar a planear.</p>`;
    } else {
        sprints.forEach(sprint => {
            const sprintContainer = document.createElement('div');
            const isActive = sprint.status === 'active';
            sprintContainer.className = `sprint-container ${isActive ? 'sprint-active-border' : ''}`;

            const sprintIssues = filteredIssues.filter(i => i.sprintId === sprint.id);
            const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

            const statusTagClass = {
                'active': 'sprint-status-active',
                'planned': 'sprint-status-planned',
                'completed': 'sprint-status-completed'
            }[sprint.status] || 'sprint-status-planned';

            const statusText = {
                'active': '🟢 Sprint Ativo',
                'planned': '🔵 Planeado',
                'completed': '⚪ Concluído'
            }[sprint.status] || 'Planeado';

            const dropzoneId = `sprint-dropzone-${sprint.id}`;

            let actionBtnHTML = '';
            if (sprint.status === 'planned') {
                actionBtnHTML = `<button class="btn-start-sprint" onclick="startSprint('${sprint.id}')">▶️ Iniciar Sprint</button>`;
            } else if (sprint.status === 'active') {
                actionBtnHTML = `<button class="btn-secondary" style="font-size:12px; padding:4px 8px;" onclick="setSprintStatus('${sprint.id}', 'completed')">✅ Concluir</button>`;
            } else {
                actionBtnHTML = `<button class="btn-secondary" style="font-size:12px; padding:4px 8px;" onclick="setSprintStatus('${sprint.id}', 'planned')">↩️ Reabrir</button>`;
            }

            sprintContainer.innerHTML = `
                <div class="sprint-header">
                    <div class="sprint-title-group">
                        <h4 class="sprint-name">🏃 ${escapeHTML(sprint.name)}</h4>
                        <span class="sprint-status-tag ${statusTagClass}">${statusText}</span>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${actionBtnHTML}
                        <button class="icon-btn" onclick="deleteSprint('${sprint.id}')" title="Eliminar Sprint">🗑️</button>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                    <span>${sprint.goal ? `🎯 ${escapeHTML(sprint.goal)}` : ''}</span>
                    <span>📊 ${sprintIssues.length} tarefas (${totalPoints} pts)</span>
                </div>
                
                <div class="sprint-dropzone" id="${dropzoneId}" 
                     ondragover="sprintDragOver(event)" 
                     ondragleave="sprintDragLeave(event)" 
                     ondrop="sprintDrop(event, '${sprint.id}')">
                </div>
            `;

            leftSprintsList.appendChild(sprintContainer);

            const dropzone = document.getElementById(dropzoneId);
            sprintIssues.forEach(issue => {
                dropzone.appendChild(createBacklogItemElement(issue, project));
            });
        });
    }

    // Populate Right Box Pool Items
    const poolDropzone = document.getElementById(poolDropzoneId);
    if (backlogPoolIssues.length === 0) {
        poolDropzone.innerHTML = `
            <div class="empty-backlog-state">
                <span>🎉</span>
                <p>Nenhuma tarefa pendente no Backlog Geral!</p>
            </div>
        `;
    } else {
        backlogPoolIssues.forEach(issue => {
            poolDropzone.appendChild(createBacklogItemElement(issue, project));
        });
    }
}

function startSprint(sprintId) {
    const project = getActiveProject();
    const sprint = (project.sprints || []).find(s => s.id === sprintId);
    if (!sprint) return;

    const currentActive = (project.sprints || []).find(s => s.status === 'active' && s.id !== sprintId);
    if (currentActive) {
        alert(`Já existe um Sprint ativo ("${currentActive.name}"). Conclua o Sprint ativo antes de iniciar um novo.`);
        return;
    }

    sprint.status = 'active';

    // Move all sprint issues from backlog status to todo status
    project.issues.forEach(i => {
        if (i.sprintId === sprintId && i.status === 'backlog') {
            i.status = 'todo';
        }
    });

    saveWorkspace();

    // Automatically transition user to active board!
    switchView('board');
}

function createInlineSprint() {
    const nameInput = document.getElementById('inlineSprintName');
    const goalInput = document.getElementById('inlineSprintGoal');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    const goal = goalInput ? goalInput.value.trim() : '';

    if (!name) {
        alert('Insira um nome para o Sprint ou Release.');
        return;
    }

    const project = getActiveProject();
    if (!project.sprints) project.sprints = [];

    project.sprints.push({
        id: `sprint-${Date.now()}`,
        name: name,
        goal: goal,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        status: 'planned'
    });

    saveWorkspace();
    renderCurrentView();
}

function createBacklogItemElement(issue, project) {
    const card = document.createElement('div');
    card.className = 'backlog-item-card';
    card.draggable = true;
    card.id = `backlog-card-${issue.id}`;
    card.ondragstart = (ev) => {
        draggedTicketId = issue.id;
        ev.dataTransfer.setData("text/plain", issue.id);
        ev.dataTransfer.effectAllowed = "move";
    };

    const typeIcon = ISSUE_TYPE_ICONS[issue.type] || '📑';
    const priorityEmoji = { 'Alta': '🔴', 'Média': '🟡', 'Baixa': '🟢' }[issue.priority] || '🟡';
    const colTitle = project.columns.find(c => c.id === issue.status)?.title || issue.status;

    let moveSprintOptions = `<option value="" disabled selected>🏃 Atribuir Sprint...</option>`;
    moveSprintOptions += `<option value="none">Nenhum (Backlog Geral)</option>`;
    (project.sprints || []).forEach(s => {
        moveSprintOptions += `<option value="${s.id}" ${issue.sprintId === s.id ? 'disabled' : ''}>${escapeHTML(s.name)}</option>`;
    });

    card.innerHTML = `
        <div class="backlog-item-main">
            <span style="font-size:18px;">${typeIcon}</span>
            <div class="backlog-item-title-group">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="ticket-id">${issue.id}</span>
                    <span class="backlog-item-title">${escapeHTML(issue.title)}</span>
                </div>
                <div class="backlog-item-meta">
                    <span class="badge" style="background:var(--primary-light); color:var(--primary); font-weight:700;">📍 ${escapeHTML(colTitle)}</span>
                    <span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>
                    <span class="badge priority-${issue.priority}">${priorityEmoji} ${issue.priority}</span>
                    ${issue.storyPoints ? `<span class="story-points-badge">${issue.storyPoints} pt</span>` : ''}
                    ${issue.assignee ? `<span style="font-size:12px; color:var(--text-muted);">👤 ${escapeHTML(issue.assignee)}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="backlog-item-actions">
            <select class="move-to-select" onchange="moveTicketToSprint('${issue.id}', this.value); this.value='';">
                ${moveSprintOptions}
            </select>
            <button class="icon-btn" onclick="openEditModal('${issue.id}')" title="Editar Tarefa">✏️</button>
            <button class="icon-btn" onclick="deleteTicket('${issue.id}')" title="Eliminar Tarefa">🗑️</button>
        </div>
    `;

    card.onclick = (e) => {
        if (!e.target.closest('.backlog-item-actions')) {
            openEditModal(issue.id);
        }
    };

    return card;
}

// Sprint Drag and Drop Handlers
function sprintDragOver(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    const dropzone = ev.currentTarget;
    dropzone.classList.add('sprint-drag-over');
}

function sprintDragLeave(ev) {
    const dropzone = ev.currentTarget;
    dropzone.classList.remove('sprint-drag-over');
}

function sprintDrop(ev, targetSprintId) {
    ev.preventDefault();
    const dropzone = ev.currentTarget;
    dropzone.classList.remove('sprint-drag-over');

    if (draggedTicketId) {
        moveTicketToSprint(draggedTicketId, targetSprintId === 'null' ? null : targetSprintId);
        draggedTicketId = null;
    }
}

function moveTicketToSprint(ticketId, sprintId) {
    const project = getActiveProject();
    const issue = project.issues.find(i => i.id === ticketId);
    if (issue) {
        issue.sprintId = (!sprintId || sprintId === 'none' || sprintId === 'null') ? null : sprintId;
        // If moving to a sprint from backlog status, update status to To Do automatically
        if (issue.sprintId && issue.status === 'backlog') {
            issue.status = 'todo';
        }
        saveWorkspace();
        renderCurrentView();
    }
}

function moveToStatus(issueId, newStatus) {
    if (!newStatus) return;
    const project = getActiveProject();
    const issue = project.issues.find(i => i.id === issueId);
    if (issue) {
        issue.status = newStatus;
        saveWorkspace();
        renderCurrentView();
    }
}

function openCreateModalWithStatus(status) {
    openCreateModal();
    if (status) {
        document.getElementById('taskStatus').value = status;
    }
}

function generateNextId() {
    const project = getActiveProject();
    if (project.issues.length === 0) return `${project.key}-1`;
    const maxId = Math.max(...project.issues.map(i => parseInt(i.id.replace(/\D/g, '')) || 0));
    return `${project.key}-${maxId + 1}`;
}

// Unified Task Modal Handlers
function openCreateModal() {
    const project = getActiveProject();
    currentEditingId = null;
    document.getElementById('taskModalTitle').innerText = 'Criar Nova Tarefa';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskType').value = 'Task';
    document.getElementById('taskPriority').value = 'Média';
    document.getElementById('taskStoryPoints').value = '3';
    document.getElementById('taskAssignee').value = 'Marcelo';
    document.getElementById('deleteTaskModalBtn').style.display = 'none';

    populateTaskEpicDropdown(project.epics?.[0] || '');
    populateTaskStatusDropdown();
    populateTaskSprintDropdown();
    renderModalSubtasks([]);
    document.getElementById('taskModalOverlay').classList.add('active');
}

function openEditModal(id) {
    const project = getActiveProject();
    const issue = project.issues.find(i => i.id === id);
    if (!issue) return;

    currentEditingId = id;
    document.getElementById('taskModalTitle').innerText = `Editar Tarefa (${issue.id})`;
    document.getElementById('taskTitle').value = issue.title;
    document.getElementById('taskDescription').value = issue.description || '';
    document.getElementById('taskType').value = issue.type || 'Task';
    document.getElementById('taskPriority').value = issue.priority || 'Média';
    document.getElementById('taskStoryPoints').value = issue.storyPoints || 1;
    document.getElementById('taskAssignee').value = issue.assignee || '';
    document.getElementById('deleteTaskModalBtn').style.display = 'block';

    populateTaskEpicDropdown(issue.epic || project.epics?.[0]);
    populateTaskStatusDropdown(issue.status);
    populateTaskSprintDropdown(issue.sprintId);
    renderModalSubtasks(issue.subtasks || []);
    document.getElementById('taskModalOverlay').classList.add('active');
}

function populateTaskEpicDropdown(selectedEpic) {
    const project = getActiveProject();
    const epicSelect = document.getElementById('taskEpic');
    if (!epicSelect) return;

    epicSelect.innerHTML = '';
    const epics = project.epics || [];

    if (epics.length === 0) {
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = 'Sem Épico (Clique em + Criar Épico)';
        epicSelect.appendChild(emptyOpt);
    } else {
        const noneOpt = document.createElement('option');
        noneOpt.value = '';
        noneOpt.textContent = 'Sem Épico';
        if (!selectedEpic) noneOpt.selected = true;
        epicSelect.appendChild(noneOpt);

        epics.forEach(epic => {
            const option = document.createElement('option');
            option.value = epic;
            option.textContent = epic;
            if (epic === selectedEpic) option.selected = true;
            epicSelect.appendChild(option);
        });
    }

    const createOpt = document.createElement('option');
    createOpt.value = '__new_epic__';
    createOpt.textContent = '➕ Criar Novo Épico...';
    epicSelect.appendChild(createOpt);
}

function handleTaskEpicChange(value) {
    if (value === '__new_epic__') {
        openCreateEpicPrompt();
    }
}

function openCreateEpicPrompt() {
    const name = prompt('Nome do novo Épico (ex: Design System, Checkout, Infraestrutura):');
    if (name && name.trim()) {
        createNewEpic(name.trim());
    } else {
        const project = getActiveProject();
        const currentVal = document.getElementById('taskEpic').value;
        if (currentVal === '__new_epic__') {
            populateTaskEpicDropdown(project.epics?.[0] || '');
        }
    }
}

function createNewEpic(epicName) {
    const project = getActiveProject();
    if (!project.epics) project.epics = [];

    if (!project.epics.includes(epicName)) {
        project.epics.push(epicName);
        saveWorkspace();
    }

    populateTaskEpicDropdown(epicName);
    updateFilterDropdowns();
}

function populateTaskStatusDropdown(selectedStatus) {
    const project = getActiveProject();
    const statusSelect = document.getElementById('taskStatus');
    statusSelect.innerHTML = '';
    project.columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col.id;
        const icon = col.id === 'backlog' ? '📋 ' : '';
        option.textContent = `${icon}${col.title}`;
        if (col.id === (selectedStatus || project.columns[0].id)) option.selected = true;
        statusSelect.appendChild(option);
    });
}

function populateTaskSprintDropdown(selectedSprintId) {
    const project = getActiveProject();
    const sprintSelect = document.getElementById('taskSprint');
    if (!sprintSelect) return;

    sprintSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Sem Sprint (Backlog)';
    if (!selectedSprintId) defaultOpt.selected = true;
    sprintSelect.appendChild(defaultOpt);

    (project.sprints || []).forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `🏃 ${s.name}`;
        if (s.id === selectedSprintId) option.selected = true;
        sprintSelect.appendChild(option);
    });
}

function saveTaskModal() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        document.getElementById('taskTitle').focus();
        return;
    }

    const project = getActiveProject();
    const type = document.getElementById('taskType').value;
    const desc = document.getElementById('taskDescription').value.trim();
    const epic = document.getElementById('taskEpic').value;
    const sprintId = document.getElementById('taskSprint').value || null;
    const priority = document.getElementById('taskPriority').value;
    const points = parseInt(document.getElementById('taskStoryPoints').value) || 1;
    const assignee = document.getElementById('taskAssignee').value.trim();
    const status = document.getElementById('taskStatus').value;

    if (currentEditingId) {
        // Edit existing issue
        const issue = project.issues.find(i => i.id === currentEditingId);
        if (issue) {
            issue.title = title;
            issue.description = desc;
            issue.type = type;
            issue.epic = epic;
            issue.sprintId = sprintId;
            issue.priority = priority;
            issue.storyPoints = points;
            issue.assignee = assignee;
            issue.status = status;
        }
    } else {
        // Create new issue
        const newIssue = {
            id: generateNextId(),
            title: title,
            description: desc,
            type: type,
            epic: epic,
            sprintId: sprintId,
            priority: priority,
            storyPoints: points,
            assignee: assignee,
            status: status,
            subtasks: currentModalSubtasks
        };
        project.issues.push(newIssue);
    }

    saveWorkspace();
    renderCurrentView();
    closeTaskModal();
}

function closeTaskModal() {
    document.getElementById('taskModalOverlay').classList.remove('active');
    currentEditingId = null;
}

function deleteCurrentTask() {
    if (currentEditingId) {
        deleteTicket(currentEditingId);
        closeTaskModal();
    }
}

// Modal Subtask Checklist
let currentModalSubtasks = [];

function renderModalSubtasks(subtasks) {
    if (currentEditingId) {
        const project = getActiveProject();
        const issue = project.issues.find(i => i.id === currentEditingId);
        if (issue) currentModalSubtasks = issue.subtasks || [];
    } else {
        currentModalSubtasks = subtasks || [];
    }

    const container = document.getElementById('modalSubtasksList');
    container.innerHTML = '';
    currentModalSubtasks.forEach((st, idx) => {
        const div = document.createElement('div');
        div.className = `subtask-item ${st.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtask(${idx})">
            <span style="flex:1;">${escapeHTML(st.text)}</span>
            <button class="icon-btn" onclick="removeSubtask(${idx})" title="Remover">✖️</button>
        `;
        container.appendChild(div);
    });
}

function addSubtaskFromModal() {
    const input = document.getElementById('newSubtaskInput');
    const text = input.value.trim();
    if (!text) return;

    currentModalSubtasks.push({ id: Date.now(), text: text, completed: false });
    renderModalSubtasks(currentModalSubtasks);
    input.value = '';
}

function toggleSubtask(idx) {
    if (currentModalSubtasks[idx]) {
        currentModalSubtasks[idx].completed = !currentModalSubtasks[idx].completed;
        renderModalSubtasks(currentModalSubtasks);
    }
}

function removeSubtask(idx) {
    currentModalSubtasks.splice(idx, 1);
    renderModalSubtasks(currentModalSubtasks);
}

function deleteTicket(id) {
    const project = getActiveProject();
    if (confirm(`Eliminar a tarefa ${id}?`)) {
        project.issues = project.issues.filter(i => i.id !== id);
        saveWorkspace();
        renderCurrentView();
    }
}

// Drag & Drop for Board
function dragStart(ev) {
    draggedTicketId = ev.target.id;
    ev.dataTransfer.setData("text/plain", ev.target.id);
    ev.dataTransfer.effectAllowed = "move";
    setTimeout(() => ev.target.classList.add('dragging'), 0);
}

function dragEnd(ev) {
    ev.target.classList.remove('dragging');
    draggedTicketId = null;
    document.querySelectorAll('.column').forEach(col => col.classList.remove('drag-over'));
}

function dragEnter(ev) {
    ev.preventDefault();
    const column = ev.target.closest('.column');
    if (column) column.classList.add('drag-over');
}

function dragOver(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function dragLeave(ev) {
    const column = ev.target.closest('.column');
    if (column && !column.contains(ev.relatedTarget)) {
        column.classList.remove('drag-over');
    }
}

function drop(ev) {
    ev.preventDefault();
    const targetCol = ev.target.closest('.column');
    if (targetCol && draggedTicketId) {
        targetCol.classList.remove('drag-over');
        const project = getActiveProject();
        const issue = project.issues.find(i => i.id === draggedTicketId);
        if (issue && issue.status !== targetCol.id) {
            issue.status = targetCol.id;
            saveWorkspace();
            renderCurrentView();
        }
    }
}

// CSV Export / Import
function exportCSV() {
    const project = getActiveProject();
    let csvContent = "data:text/csv;charset=utf-8,ID,Tipo,Titulo,Descricao,Epico,Sprint,Prioridade,Pontos,Atribuido,Status\n";
    project.issues.forEach(i => {
        const title = `"${(i.title || '').replace(/"/g, '""')}"`;
        const desc = `"${(i.description || '').replace(/"/g, '""')}"`;
        const epic = `"${(i.epic || '').replace(/"/g, '""')}"`;
        const sprintName = (project.sprints || []).find(s => s.id === i.sprintId)?.name || '';
        csvContent += `${i.id},${i.type || 'Task'},${title},${desc},${epic},"${sprintName}",${i.priority || 'Média'},${i.storyPoints || 1},"${i.assignee || ''}",${i.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.key}_issues_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const project = getActiveProject();
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length < 3) continue;

            const id = cols[0] || generateNextId();
            const type = cols[1] || "Task";
            const title = cols[2] || "Sem Título";
            const description = cols[3] || "";
            const epic = cols[4] || "Outro";
            const priority = ["Alta", "Média", "Baixa"].includes(cols[6]) ? cols[6] : "Média";
            const points = parseInt(cols[7]) || 1;
            const assignee = cols[8] || "Marcelo";
            let status = (cols[9] || project.columns[0].id).toLowerCase();

            const existingIndex = project.issues.findIndex(iss => iss.id === id);
            const issueData = { id, type, title, description, epic, priority, storyPoints: points, assignee, status, sprintId: null, subtasks: [] };
            
            if (existingIndex > -1) {
                project.issues[existingIndex] = issueData;
            } else {
                project.issues.push(issueData);
            }
        }
        saveWorkspace();
        renderCurrentView();
        event.target.value = '';
    };
    reader.readAsText(file);
}

function clearBoard() {
    const project = getActiveProject();
    if (confirm(`Apagar TODAS as tarefas do projeto ${project.name}?`)) {
        project.issues = [];
        saveWorkspace();
        renderCurrentView();
    }
}

function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Initial Initialization
renderProjectSelector();
renderCurrentView();
