// Default Initial State
const DEFAULT_WORKSPACE = {
    activeProjectId: "TRL",
    projects: [
        {
            key: "TRL",
            name: "App Trilhos Portugal",
            description: "Gestão e desenvolvimento da aplicação Trilhos Portugal",
            columns: [
                { id: "todo", title: "To Do" },
                { id: "in-progress", title: "In Progress" },
                { id: "review", title: "In Review" },
                { id: "done", title: "Done" }
            ],
            issues: [
                {
                    id: "TRL-1",
                    title: "Integrar Mapa de Trilhos com Mapbox GL",
                    description: "Adicionar camada de mapa interativo com ficheiros GPX para navegação de percursos.",
                    type: "Feature",
                    epic: "Epic 1: Geoespacial",
                    priority: "Alta",
                    storyPoints: 5,
                    assignee: "Marcelo",
                    status: "in-progress",
                    subtasks: [
                        { id: 1, text: "Configurar API key Mapbox", completed: true },
                        { id: 2, text: "Carregar ficheiro GPX de teste", completed: false }
                    ]
                },
                {
                    id: "TRL-2",
                    title: "Autenticação OAuth com Google e Apple",
                    description: "Implementar login social para os utilizadores guardarem trilhos favoritos.",
                    type: "Story",
                    epic: "Epic 2: Backend",
                    priority: "Alta",
                    storyPoints: 3,
                    assignee: "Ana",
                    status: "todo",
                    subtasks: []
                },
                {
                    id: "TRL-3",
                    title: "Otimizar Consumo de Bateria no GPS Offline",
                    description: "Registar localização em background com throttling de coordenadas.",
                    type: "Task",
                    epic: "Epic 3: Hardware/Navegação",
                    priority: "Média",
                    storyPoints: 8,
                    assignee: "Pedro",
                    status: "todo",
                    subtasks: []
                },
                {
                    id: "TRL-4",
                    title: "Exportação de Dados em KML/GPX",
                    description: "Permitir ao utilizador descarregar os seus registos de caminhada.",
                    type: "Story",
                    epic: "Epic 1: Geoespacial",
                    priority: "Baixa",
                    storyPoints: 2,
                    assignee: "Sofia",
                    status: "done",
                    subtasks: [
                        { id: 1, text: "Validar formato XML KML", completed: true },
                        { id: 2, text: "Testar download no Safari iOS", completed: true }
                    ]
                }
            ]
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
let draggedTicketId = null;
let currentEditingId = null; // null if creating new ticket, string ID if editing

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

// UI Toggles
function toggleFilterBar() {
    const filterToolbar = document.getElementById('filterToolbar');
    filterToolbar.classList.toggle('show');
}

function toggleActionsDropdown() {
    const menu = document.getElementById('actionsDropdown');
    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        const menu = document.getElementById('actionsDropdown');
        if (menu) menu.classList.remove('show');
    }
});

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterEpic').value = 'Todos';
    document.getElementById('filterType').value = 'Todos';
    document.getElementById('filterPriority').value = 'Todos';
    renderBoard();
}

// Project Selector
function renderProjectSelector() {
    const select = document.getElementById('projectSelect');
    select.innerHTML = '';
    workspace.projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.key;
        option.textContent = `${p.name} (${p.key})`;
        if (p.key === workspace.activeProjectId) option.selected = true;
        select.appendChild(option);
    });
}

function switchProject(key) {
    workspace.activeProjectId = key;
    saveWorkspace();
    updateFilterDropdowns();
    renderBoard();
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
            { id: "todo", title: "To Do" },
            { id: "in-progress", title: "In Progress" },
            { id: "review", title: "In Review" },
            { id: "done", title: "Done" }
        ],
        issues: []
    });

    workspace.activeProjectId = key;
    saveWorkspace();

    closeNewProjectModal();
    renderProjectSelector();
    updateFilterDropdowns();
    renderBoard();
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
        renderBoard();
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
    renderBoard();
}

function deleteColumn(colId) {
    const project = getActiveProject();
    if (project.columns.length <= 1) {
        alert('O quadro tem de ter pelo menos 1 coluna!');
        return;
    }

    const col = project.columns.find(c => c.id === colId);
    if (confirm(`Eliminar coluna "${col.title}"? Tarefas existentes serão movidas para a primeira coluna.`)) {
        project.columns = project.columns.filter(c => c.id !== colId);
        const fallbackId = project.columns[0].id;
        project.issues.forEach(i => { if (i.status === colId) i.status = fallbackId; });

        saveWorkspace();
        renderBoard();
    }
}

// Filters Populator
function updateFilterDropdowns() {
    const project = getActiveProject();
    const epicSelect = document.getElementById('filterEpic');
    const currentEpic = epicSelect.value;
    const uniqueEpics = [...new Set(project.issues.map(i => i.epic))].sort();

    let epicHTML = '<option value="Todos">Todos</option>';
    uniqueEpics.forEach(epic => epicHTML += `<option value="${epic}">${epic}</option>`);

    epicSelect.innerHTML = epicHTML;
    epicSelect.value = (currentEpic === "Todos" || uniqueEpics.includes(currentEpic)) ? currentEpic : "Todos";
}

// Render Board
function renderBoard() {
    const project = getActiveProject();
    const boardWrapper = document.getElementById('boardWrapper');
    boardWrapper.innerHTML = '';

    const filterEpic = document.getElementById('filterEpic').value;
    const filterPriority = document.getElementById('filterPriority').value;
    const filterType = document.getElementById('filterType').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

    // Render Columns
    project.columns.forEach(col => {
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
    project.columns.forEach(c => counts[c.id] = 0);

    // Filter Issues
    project.issues.forEach(issue => {
        if (filterEpic !== "Todos" && issue.epic !== filterEpic) return;
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
                <span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>
                <span class="badge priority-${issue.priority}">${priorityEmoji} ${issue.priority}</span>
                ${issue.storyPoints ? `<span class="story-points-badge">${issue.storyPoints} pt</span>` : ''}
                ${issue.assignee ? `<span class="assignee-avatar" title="Atribuído a: ${escapeHTML(issue.assignee)}">${escapeHTML(issue.assignee.substring(0,2).toUpperCase())}</span>` : ''}
            </div>
        `;

        const container = document.getElementById(`container-${issue.status}`) || document.getElementById(`container-${project.columns[0].id}`);
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

function generateNextId() {
    const project = getActiveProject();
    if (project.issues.length === 0) return `${project.key}-1`;
    const maxId = Math.max(...project.issues.map(i => parseInt(i.id.replace(/\D/g, '')) || 0));
    return `${project.key}-${maxId + 1}`;
}

// Unified Task Modal Handlers
function openCreateModal() {
    currentEditingId = null;
    document.getElementById('taskModalTitle').innerText = 'Criar Nova Tarefa';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskType').value = 'Task';
    document.getElementById('taskEpic').value = 'Epic 1: Geoespacial';
    document.getElementById('taskPriority').value = 'Média';
    document.getElementById('taskStoryPoints').value = '3';
    document.getElementById('taskAssignee').value = 'Marcelo';
    document.getElementById('deleteTaskModalBtn').style.display = 'none';

    populateTaskStatusDropdown();
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
    document.getElementById('taskEpic').value = issue.epic || 'Outro';
    document.getElementById('taskPriority').value = issue.priority || 'Média';
    document.getElementById('taskStoryPoints').value = issue.storyPoints || 1;
    document.getElementById('taskAssignee').value = issue.assignee || '';
    document.getElementById('deleteTaskModalBtn').style.display = 'block';

    populateTaskStatusDropdown(issue.status);
    renderModalSubtasks(issue.subtasks || []);
    document.getElementById('taskModalOverlay').classList.add('active');
}

function populateTaskStatusDropdown(selectedStatus) {
    const project = getActiveProject();
    const statusSelect = document.getElementById('taskStatus');
    statusSelect.innerHTML = '';
    project.columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col.id;
        option.textContent = col.title;
        if (col.id === (selectedStatus || project.columns[0].id)) option.selected = true;
        statusSelect.appendChild(option);
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
            priority: priority,
            storyPoints: points,
            assignee: assignee,
            status: status,
            subtasks: currentModalSubtasks
        };
        project.issues.push(newIssue);
    }

    saveWorkspace();
    updateFilterDropdowns();
    renderBoard();
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
        updateFilterDropdowns();
        renderBoard();
    }
}

// Drag & Drop
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
            renderBoard();
        }
    }
}

// CSV Export / Import
function exportCSV() {
    const project = getActiveProject();
    let csvContent = "data:text/csv;charset=utf-8,ID,Tipo,Titulo,Descricao,Epico,Prioridade,Pontos,Atribuido,Status\n";
    project.issues.forEach(i => {
        const title = `"${(i.title || '').replace(/"/g, '""')}"`;
        const desc = `"${(i.description || '').replace(/"/g, '""')}"`;
        const epic = `"${(i.epic || '').replace(/"/g, '""')}"`;
        csvContent += `${i.id},${i.type || 'Task'},${title},${desc},${epic},${i.priority || 'Média'},${i.storyPoints || 1},"${i.assignee || ''}",${i.status}\n`;
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
            const priority = ["Alta", "Média", "Baixa"].includes(cols[5]) ? cols[5] : "Média";
            const points = parseInt(cols[6]) || 1;
            const assignee = cols[7] || "Marcelo";
            let status = (cols[8] || project.columns[0].id).toLowerCase();

            const existingIndex = project.issues.findIndex(iss => iss.id === id);
            const issueData = { id, type, title, description, epic, priority, storyPoints: points, assignee, status, subtasks: [] };
            
            if (existingIndex > -1) {
                project.issues[existingIndex] = issueData;
            } else {
                project.issues.push(issueData);
            }
        }
        saveWorkspace();
        updateFilterDropdowns();
        renderBoard();
        event.target.value = '';
    };
    reader.readAsText(file);
}

function clearBoard() {
    const project = getActiveProject();
    if (confirm(`Apagar TODAS as tarefas do projeto ${project.name}?`)) {
        project.issues = [];
        saveWorkspace();
        updateFilterDropdowns();
        renderBoard();
    }
}

function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Initial Initialization
renderProjectSelector();
updateFilterDropdowns();
renderBoard();
