// Global Utility Functions

function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function generateNextId() {
    const project = getActiveProject();
    if (!project.issues || project.issues.length === 0) return `${project.key}-1`;
    const maxId = Math.max(...project.issues.map(i => parseInt(i.id.replace(/\D/g, '')) || 0));
    return `${project.key}-${maxId + 1}`;
}

// Theme Management
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

// CSV Export & Import Services
function exportCSV() {
    const project = getActiveProject();
    if (!project.issues || project.issues.length === 0) {
        alert('Não existem tarefas no projeto para exportar.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID;Tipo;Título;Descrição;Épico;Sprint;Prioridade;StoryPoints;Atribuído;Coluna\n";

    project.issues.forEach(i => {
        const sprintName = (project.sprints || []).find(s => s.id === i.sprintId)?.name || '';
        const row = [
            i.id,
            i.type,
            `"${(i.title || '').replace(/"/g, '""')}"`,
            `"${(i.description || '').replace(/"/g, '""')}"`,
            `"${(i.epic || '').replace(/"/g, '""')}"`,
            `"${sprintName.replace(/"/g, '""')}"`,
            i.priority,
            i.storyPoints || 1,
            i.assignee || '',
            i.status
        ].join(";");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IssueTracker_${project.key}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        const project = getActiveProject();

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';').map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length < 3) continue;

            const id = cols[0] || generateNextId();
            const type = cols[1] || "Task";
            const title = cols[2] || "Sem Título";
            const description = cols[3] || "";
            const epic = cols[4] || "";
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
