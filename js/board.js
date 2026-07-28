// Active Kanban Board Controller

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
                <h3 style="font-size:20px; font-weight:800; margin:0 0 8px 0; color:var(--text-main);">${t('board_no_active_sprint_title')}</h3>
                <p style="color:var(--text-muted); font-size:14px; margin:0 0 20px 0; line-height:1.5;">
                    ${t('board_no_active_sprint_desc')}
                </p>
                <button class="btn-primary" onclick="switchView('backlog')" style="font-size:14px; padding:10px 20px;">${t('board_go_to_backlog_btn')}</button>
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
    addColBtn.innerHTML = `<span>${t('btn_add_column')}</span>`;
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
                ${issue.epic ? `<span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>` : ''}
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

// Drag & Drop Handlers for Board Columns
function dragStart(ev) {
    draggedTicketId = ev.currentTarget.id;
    ev.dataTransfer.setData("text/plain", ev.currentTarget.id);
    ev.currentTarget.classList.add('dragging');
}

function dragEnd(ev) {
    ev.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.column.drag-over').forEach(col => col.classList.remove('drag-over'));
}

function dragEnter(ev) {
    ev.preventDefault();
    const colElem = ev.target.closest('.column');
    if (colElem) {
        colElem.classList.add('drag-over');
    }
}

function dragOver(ev) {
    ev.preventDefault();
    const colElem = ev.target.closest('.column');
    if (colElem && !colElem.classList.contains('drag-over')) {
        colElem.classList.add('drag-over');
    }
}

function dragLeave(ev) {
    const colElem = ev.target.closest('.column');
    if (colElem && (!ev.relatedTarget || !colElem.contains(ev.relatedTarget))) {
        colElem.classList.remove('drag-over');
    }
}

function drop(ev) {
    ev.preventDefault();
    const colElem = ev.target.closest('.column');
    if (colElem) {
        colElem.classList.remove('drag-over');
        if (draggedTicketId) {
            moveToStatus(draggedTicketId, colElem.id);
            draggedTicketId = null;
        }
    }
    document.querySelectorAll('.column.drag-over').forEach(col => col.classList.remove('drag-over'));
}

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
