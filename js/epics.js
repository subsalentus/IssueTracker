// Dynamic Epic Management per Project

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
