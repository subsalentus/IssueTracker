// Backlog 2-Box Split Layout Controller (Left: Sprints/Releases, Right: Issues Pool)

function renderBacklogView() {
    const project = getActiveProject();
    const backlogContainer = document.getElementById('backlogViewContainer');
    backlogContainer.innerHTML = '';

    const filterEpic = document.getElementById('filterEpic').value;
    const filterSprint = document.getElementById('filterSprint')?.value || 'Todos';
    const filterPriority = document.getElementById('filterPriority').value;
    const filterType = document.getElementById('filterType').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

    // Filter Issues
    const filteredIssues = project.issues.filter(issue => {
        if (filterEpic !== "Todos" && issue.epic !== filterEpic) return false;
        if (filterSprint !== "Todos") {
            if (filterSprint === "none" && issue.sprintId) return false;
            if (filterSprint !== "none" && issue.sprintId !== filterSprint) return false;
        }
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
            <h3 class="backlog-section-title">${t('backlog_sprints_header')}</h3>
        </div>
        <div class="inline-create-sprint">
            <input type="text" id="inlineSprintName" placeholder="${t('backlog_sprint_name_ph')}" onkeydown="if(event.key==='Enter') createInlineSprint()">
            <input type="text" id="inlineSprintGoal" placeholder="${t('backlog_sprint_goal_ph')}" onkeydown="if(event.key==='Enter') createInlineSprint()">
            <button class="btn-primary" style="align-self:flex-end; font-size:13px;" onclick="createInlineSprint()">${t('btn_create_sprint')}</button>
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
                ${t('backlog_pool_header')}
                <span class="backlog-section-count">${backlogPoolIssues.length}</span>
            </h3>
            <button class="btn-primary" onclick="openCreateModalWithStatus('backlog')">${t('btn_new_task')}</button>
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
        leftSprintsList.innerHTML = `<p style="color:var(--text-muted); font-size:13px; font-style:italic;">${t('no_sprints_created')}</p>`;
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
                'active': t('sprint_status_active'),
                'planned': t('sprint_status_planned'),
                'completed': t('sprint_status_completed')
            }[sprint.status] || t('sprint_status_planned');

            const dropzoneId = `sprint-dropzone-${sprint.id}`;

            let actionBtnHTML = '';
            if (sprint.status === 'planned') {
                actionBtnHTML = `<button class="btn-start-sprint" onclick="startSprint('${sprint.id}')">${t('btn_start_sprint')}</button>`;
            } else if (sprint.status === 'active') {
                actionBtnHTML = `<button class="btn-secondary" style="font-size:12px; padding:4px 8px;" onclick="setSprintStatus('${sprint.id}', 'completed')">${t('btn_conclude_sprint')}</button>`;
            } else {
                actionBtnHTML = `<button class="btn-secondary" style="font-size:12px; padding:4px 8px;" onclick="setSprintStatus('${sprint.id}', 'planned')">${t('btn_reopen_sprint')}</button>`;
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
                    ${issue.epic ? `<span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>` : ''}
                    <span class="badge priority-${issue.priority}">${priorityEmoji} ${issue.priority}</span>
                    ${issue.storyPoints ? `<span class="story-points-badge">${issue.storyPoints} pt</span>` : ''}
                    ${issue.assignee ? `<span style="font-size:12px; color:var(--text-muted);">👤 ${escapeHTML(issue.assignee)}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="backlog-item-actions" onclick="event.stopPropagation()">
            <select class="backlog-sprint-select" onchange="moveTicketToSprint('${issue.id}', this.value)">
                ${moveSprintOptions}
            </select>
            <button class="icon-btn" onclick="openEditModal('${issue.id}')" title="Editar Tarefa">✏️</button>
            <button class="icon-btn" onclick="deleteTicket('${issue.id}')" title="Eliminar Tarefa">🗑️</button>
        </div>
    `;

    card.onclick = (e) => {
        if (e.target.closest('.backlog-item-actions')) return;
        openEditModal(issue.id);
    };

    return card;
}

// Drag and Drop Event Handlers for Sprint Dropzones
function sprintDragOver(ev) {
    ev.preventDefault();
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
