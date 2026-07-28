// Sprint Lifecycle & Sprint Planning Rules

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
    switchView('board');
}

function setSprintStatus(sprintId, status) {
    const project = getActiveProject();
    const sprint = (project.sprints || []).find(s => s.id === sprintId);
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
    const sprint = (project.sprints || []).find(s => s.id === sprintId);
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
