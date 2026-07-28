// State Management & LocalStorage Persistence

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

function saveWorkspace() {
    localStorage.setItem('trilhosWorkspace', JSON.stringify(workspace));
}

function getActiveProject() {
    let proj = workspace.projects.find(p => p.key === workspace.activeProjectId);
    if (!proj && workspace.projects.length > 0) {
        proj = workspace.projects[0];
        workspace.activeProjectId = proj.key;
        saveWorkspace();
    }
    return proj;
}

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
