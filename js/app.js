// Application Main Entry Point, Navigation & Filter Bar Controller

function switchView(viewName) {
    currentView = viewName;
    
    const navBoard = document.getElementById('sidebarTabBoard') || document.getElementById('navItemBoard');
    const navBacklog = document.getElementById('sidebarTabBacklog') || document.getElementById('navItemBacklog');
    const boardWrapper = document.getElementById('boardWrapper');
    const backlogContainer = document.getElementById('backlogViewContainer');

    if (viewName === 'board') {
        if (navBoard) navBoard.classList.add('active');
        if (navBacklog) navBacklog.classList.remove('active');
        if (boardWrapper) boardWrapper.style.display = 'flex';
        if (backlogContainer) backlogContainer.style.display = 'none';
    } else {
        if (navBoard) navBoard.classList.remove('active');
        if (navBacklog) navBacklog.classList.add('active');
        if (boardWrapper) boardWrapper.style.display = 'none';
        if (backlogContainer) backlogContainer.style.display = 'flex';
    }

    renderCurrentView();
}

function toggleProjectTitleDropdown() {
    const dropdown = document.getElementById('projectTitleDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function toggleActionsDropdown() {
    const dropdown = document.getElementById('actionsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdown menus when clicking outside
window.addEventListener('click', function(e) {
    if (!e.target.closest('#projectTitleBtn') && !e.target.closest('#projectTitleDropdown')) {
        const dropdown = document.getElementById('projectTitleDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
    if (!e.target.closest('.dropdown')) {
        const dropdown = document.getElementById('actionsDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

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

// Filter Toolbar Controller
function toggleFilterBar() {
    const toolbar = document.getElementById('filterToolbar');
    if (toolbar) toolbar.classList.toggle('open');
}

function updateFilterBadgeCount() {
    const epic = document.getElementById('filterEpic')?.value || 'Todos';
    const sprint = document.getElementById('filterSprint')?.value || 'Todos';
    const priority = document.getElementById('filterPriority')?.value || 'Todos';
    const type = document.getElementById('filterType')?.value || 'Todos';
    const search = document.getElementById('searchInput')?.value.trim() || '';

    let activeCount = 0;
    if (epic !== 'Todos') activeCount++;
    if (sprint !== 'Todos') activeCount++;
    if (priority !== 'Todos') activeCount++;
    if (type !== 'Todos') activeCount++;
    if (search !== '') activeCount++;

    const badge = document.getElementById('filterActiveBadge');
    if (badge) {
        if (activeCount > 0) {
            badge.innerText = activeCount;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function clearFilters() {
    document.getElementById('filterEpic').value = 'Todos';
    if (document.getElementById('filterSprint')) document.getElementById('filterSprint').value = 'Todos';
    document.getElementById('filterPriority').value = 'Todos';
    document.getElementById('filterType').value = 'Todos';
    document.getElementById('searchInput').value = '';
    onFilterChange();
}

function onFilterChange() {
    renderCurrentView();
}

function updateFilterDropdowns() {
    const project = getActiveProject();
    const epicSelect = document.getElementById('filterEpic');
    if (epicSelect) {
        const currentEpic = epicSelect.value;
        const allEpics = [...new Set([...(project.epics || []), ...project.issues.map(i => i.epic)])].filter(Boolean).sort();

        let epicHTML = '<option value="Todos">Todos</option>';
        allEpics.forEach(epic => epicHTML += `<option value="${escapeHTML(epic)}">${escapeHTML(epic)}</option>`);

        epicSelect.innerHTML = epicHTML;
        epicSelect.value = (currentEpic === "Todos" || allEpics.includes(currentEpic)) ? currentEpic : "Todos";
    }

    // Sprint Filter
    const sprintSelect = document.getElementById('filterSprint');
    if (sprintSelect) {
        const currentSprint = sprintSelect.value;
        let sprintHTML = '<option value="Todos">Todos os Sprints</option>';
        sprintHTML += '<option value="none">Sem Sprint (Apenas Backlog)</option>';
        (project.sprints || []).forEach(s => {
            sprintHTML += `<option value="${escapeHTML(s.name)}">${escapeHTML(s.name)}</option>`;
        });
        sprintSelect.innerHTML = sprintHTML;
        sprintSelect.value = (currentSprint === "Todos" || currentSprint === "none" || (project.sprints || []).some(s => s.id === currentSprint)) ? currentSprint : "Todos";
    }

    // Update Backlog badge in tab
    const backlogCount = project.issues.filter(i => i.status === 'backlog' || !i.sprintId).length;
    const backlogBadge = document.getElementById('backlogCountBadge');
    if (backlogBadge) backlogBadge.innerText = backlogCount;
}

// Main Render Controller
function renderCurrentView() {
    updateFilterDropdowns();
    updateFilterBadgeCount();

    if (currentView === 'board') {
        renderBoard();
    } else {
        renderBacklogView();
    }
}

// Application Initialization
renderProjectSelector();
renderCurrentView();
