// Task Modal, Project Creation & Settings Modals Controller

function openCreateModalWithStatus(status) {
    openCreateModal();
    if (status) {
        document.getElementById('taskStatus').value = status;
    }
}

// Unified Task Modal Handlers
function openCreateModal() {
    const project = getActiveProject();
    currentEditingId = null;
    document.getElementById('taskModalTitle').innerText = t('modal_create_task_title');
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
    document.getElementById('taskModalTitle').innerText = `${t('modal_edit_task_title')} (${issue.id})`;
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

function closeTaskModal() {
    document.getElementById('taskModalOverlay').classList.remove('active');
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

// Modal Subtask Operations
let currentModalSubtasks = [];

function renderModalSubtasks(subtasks) {
    currentModalSubtasks = JSON.parse(JSON.stringify(subtasks || []));
    const container = document.getElementById('modalSubtasksList');
    container.innerHTML = '';

    currentModalSubtasks.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'subtask-item';
        item.innerHTML = `
            <input type="checkbox" ${sub.completed ? 'checked' : ''} onchange="toggleModalSubtask(${sub.id})">
            <span class="subtask-text ${sub.completed ? 'completed' : ''}">${escapeHTML(sub.text)}</span>
            <button class="icon-btn" onclick="deleteModalSubtask(${sub.id})" title="Eliminar Subtarefa">🗑️</button>
        `;
        container.appendChild(item);
    });
}

function addSubtaskFromModal() {
    const input = document.getElementById('newSubtaskInput');
    const text = input.value.trim();
    if (!text) return;

    const newId = currentModalSubtasks.length > 0 ? Math.max(...currentModalSubtasks.map(s => s.id)) + 1 : 1;
    currentModalSubtasks.push({ id: newId, text: text, completed: false });
    input.value = '';
    renderModalSubtasks(currentModalSubtasks);
}

function toggleModalSubtask(subId) {
    const sub = currentModalSubtasks.find(s => s.id === subId);
    if (sub) {
        sub.completed = !sub.completed;
        renderModalSubtasks(currentModalSubtasks);
    }
}

function deleteModalSubtask(subId) {
    currentModalSubtasks = currentModalSubtasks.filter(s => s.id !== subId);
    renderModalSubtasks(currentModalSubtasks);
}

function saveTaskModal() {
    const project = getActiveProject();
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const type = document.getElementById('taskType').value;
    const epic = document.getElementById('taskEpic').value;
    const priority = document.getElementById('taskPriority').value;
    const storyPoints = parseInt(document.getElementById('taskStoryPoints').value) || 1;
    const assignee = document.getElementById('taskAssignee').value.trim();
    const status = document.getElementById('taskStatus').value;
    const sprintId = document.getElementById('taskSprint').value || null;

    if (!title) {
        alert('Insira um título para a tarefa.');
        return;
    }

    if (currentEditingId) {
        // Update existing task
        const issue = project.issues.find(i => i.id === currentEditingId);
        if (issue) {
            issue.title = title;
            issue.description = description;
            issue.type = type;
            issue.epic = epic;
            issue.priority = priority;
            issue.storyPoints = storyPoints;
            issue.assignee = assignee;
            issue.status = status;
            issue.sprintId = sprintId;
            issue.subtasks = currentModalSubtasks;
        }
    } else {
        // Create new task
        const newIssue = {
            id: generateNextId(),
            title: title,
            description: description,
            type: type,
            epic: epic,
            priority: priority,
            storyPoints: storyPoints,
            assignee: assignee,
            status: status,
            sprintId: sprintId,
            subtasks: currentModalSubtasks
        };
        project.issues.push(newIssue);
    }

    saveWorkspace();
    closeTaskModal();
    renderCurrentView();
}

function deleteCurrentTask() {
    if (!currentEditingId) return;
    deleteTicket(currentEditingId);
    closeTaskModal();
}

function deleteTicket(id) {
    const project = getActiveProject();
    if (confirm(`Eliminar definitivamente a tarefa ${id}?`)) {
        project.issues = project.issues.filter(i => i.id !== id);
        saveWorkspace();
        renderCurrentView();
    }
}

// Project Creation & Settings Modals
function openNewProjectModal() {
    document.getElementById('newProjectKey').value = '';
    document.getElementById('newProjectName').value = '';
    document.getElementById('newProjectDesc').value = '';
    document.getElementById('newProjectModalOverlay').classList.add('active');
}

function closeNewProjectModal() {
    document.getElementById('newProjectModalOverlay').classList.remove('active');
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
