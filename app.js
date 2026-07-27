// Default Sample Data if LocalStorage is empty
const SAMPLE_ISSUES = [
    {
        id: "TRL-1",
        title: "Integrar Mapa de Trilhos com Mapbox GL",
        description: "Adicionar camada de mapa interativo com ficheiros GPX para navegação de percursos.",
        epic: "Epic 1: Geoespacial",
        priority: "Alta",
        status: "in-progress"
    },
    {
        id: "TRL-2",
        title: "Autenticação OAuth com Google e Apple",
        description: "Implementar login social para os utilizadores guardarem trilhos favoritos na cloud.",
        epic: "Epic 2: Backend",
        priority: "Alta",
        status: "todo"
    },
    {
        id: "TRL-3",
        title: "Otimizar Consumo de Bateria com GPS Offline",
        description: "Registar localização em background utilizando throttling de coordenadas.",
        epic: "Epic 3: Hardware/Navegação",
        priority: "Média",
        status: "todo"
    },
    {
        id: "TRL-4",
        title: "Exportação de Dados para formato KML/GPX",
        description: "Permitir ao utilizador descarregar os seus registos de caminhada.",
        epic: "Epic 1: Geoespacial",
        priority: "Baixa",
        status: "done"
    }
];

let issues = JSON.parse(localStorage.getItem('trilhosIssues'));
if (!issues || !Array.isArray(issues) || issues.length === 0) {
    issues = SAMPLE_ISSUES;
    localStorage.setItem('trilhosIssues', JSON.stringify(issues));
}

let draggedTicketId = null;
let currentEditingId = null;

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
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    }
}

// Update Filter Options Dynamically
function updateFilterDropdowns() {
    const epicSelect = document.getElementById('filterEpic');
    const currentEpic = epicSelect.value;
    const uniqueEpics = [...new Set(issues.map(i => i.epic))].sort();

    let epicHTML = '<option value="Todos">Todos os Épicos</option>';
    uniqueEpics.forEach(epic => {
        epicHTML += `<option value="${epic}">${epic}</option>`;
    });

    epicSelect.innerHTML = epicHTML;
    if (currentEpic === "Todos" || uniqueEpics.includes(currentEpic)) {
        epicSelect.value = currentEpic;
    } else {
        epicSelect.value = "Todos";
    }
}

// Render Board
function renderBoard() {
    const filterEpic = document.getElementById('filterEpic').value;
    const filterPriority = document.getElementById('filterPriority').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

    const columns = {
        'todo': document.getElementById('container-todo'),
        'in-progress': document.getElementById('container-in-progress'),
        'done': document.getElementById('container-done')
    };

    // Reset containers
    Object.values(columns).forEach(col => col.innerHTML = '');

    let counts = { 'todo': 0, 'in-progress': 0, 'done': 0 };

    issues.forEach(issue => {
        // Priority defaults to Média if missing
        if (!issue.priority) issue.priority = 'Média';
        if (!issue.description) issue.description = '';

        // Apply filters
        if (filterEpic !== "Todos" && issue.epic !== filterEpic) return;
        if (filterPriority !== "Todos" && issue.priority !== filterPriority) return;
        if (searchText && !issue.title.toLowerCase().includes(searchText) && 
            !issue.id.toLowerCase().includes(searchText) && 
            !issue.description.toLowerCase().includes(searchText)) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'ticket';
        card.draggable = true;
        card.id = issue.id;

        // Drag events
        card.ondragstart = dragStart;
        card.ondragend = dragEnd;

        // Click event to open edit modal
        card.onclick = (e) => {
            if (e.target.closest('.ticket-actions')) return; // Ignore if clicking action buttons
            openEditModal(issue.id);
        };

        const priorityEmoji = {
            'Alta': '🔴',
            'Média': '🟡',
            'Baixa': '🟢'
        }[issue.priority] || '🟡';

        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-id">${issue.id}</span>
                <div class="ticket-actions">
                    <button class="icon-btn" onclick="openEditModal('${issue.id}')" title="Editar">✏️</button>
                    <button class="icon-btn" onclick="deleteTicket('${issue.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
            <h4 class="ticket-title">${escapeHTML(issue.title)}</h4>
            ${issue.description ? `<p class="ticket-description">${escapeHTML(issue.description)}</p>` : ''}
            <div class="ticket-footer">
                <span class="badge ticket-epic">${escapeHTML(issue.epic)}</span>
                <span class="badge priority-${issue.priority}">${priorityEmoji} ${issue.priority}</span>
            </div>
        `;

        const targetCol = columns[issue.status] || columns['todo'];
        targetCol.appendChild(card);

        if (counts[issue.status] !== undefined) counts[issue.status]++;
    });

    document.getElementById('count-todo').innerText = counts['todo'];
    document.getElementById('count-in-progress').innerText = counts['in-progress'];
    document.getElementById('count-done').innerText = counts['done'];
}

// Generate Next Ticket ID
function generateNextId() {
    if (issues.length === 0) return "TRL-1";
    const maxId = Math.max(...issues.map(i => parseInt(i.id.replace(/\D/g, '')) || 0));
    return "TRL-" + (maxId + 1);
}

// Add New Ticket
function addTicket() {
    const titleInput = document.getElementById('newTitle');
    const epicSelect = document.getElementById('newEpic');
    const prioritySelect = document.getElementById('newPriority');

    const title = titleInput.value.trim();
    if (!title) {
        titleInput.focus();
        return;
    }

    const newIssue = {
        id: generateNextId(),
        title: title,
        description: '',
        epic: epicSelect.value,
        priority: prioritySelect.value,
        status: "todo"
    };

    issues.push(newIssue);
    saveAndRender();
    titleInput.value = '';
}

// Modal Handlers
function openEditModal(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    currentEditingId = id;
    document.getElementById('modalId').innerText = issue.id;
    document.getElementById('editTitle').value = issue.title;
    document.getElementById('editDescription').value = issue.description || '';
    document.getElementById('editEpic').value = issue.epic;
    document.getElementById('editPriority').value = issue.priority || 'Média';
    document.getElementById('editStatus').value = issue.status;

    document.getElementById('editModalOverlay').classList.add('active');
}

function saveEditModal() {
    if (!currentEditingId) return;

    const issueIndex = issues.findIndex(i => i.id === currentEditingId);
    if (issueIndex > -1) {
        issues[issueIndex].title = document.getElementById('editTitle').value.trim();
        issues[issueIndex].description = document.getElementById('editDescription').value.trim();
        issues[issueIndex].epic = document.getElementById('editEpic').value;
        issues[issueIndex].priority = document.getElementById('editPriority').value;
        issues[issueIndex].status = document.getElementById('editStatus').value;

        saveAndRender();
    }
    closeModal();
}

function closeModal() {
    document.getElementById('editModalOverlay').classList.remove('active');
    currentEditingId = null;
}

function deleteTicket(id) {
    if (confirm(`Tem a certeza que deseja eliminar a tarefa ${id}?`)) {
        issues = issues.filter(i => i.id !== id);
        saveAndRender();
        if (currentEditingId === id) closeModal();
    }
}

// Drag and Drop Logic
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
        const issueIndex = issues.findIndex(i => i.id === draggedTicketId);
        if (issueIndex > -1 && issues[issueIndex].status !== targetCol.id) {
            issues[issueIndex].status = targetCol.id;
            saveAndRender();
        }
    }
}

// CSV Export / Import
function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Titulo,Descricao,Epico,Prioridade,Status\n";
    issues.forEach(i => {
        const title = `"${(i.title || '').replace(/"/g, '""')}"`;
        const desc = `"${(i.description || '').replace(/"/g, '""')}"`;
        const epic = `"${(i.epic || '').replace(/"/g, '""')}"`;
        csvContent += `${i.id},${title},${desc},${epic},${i.priority || 'Média'},${i.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trilhos_issues_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length < 2) continue;

            const id = cols[0] || generateNextId();
            const title = cols[1] || "Sem Título";
            const description = cols[2] || "";
            const epic = cols[3] || "Outro";
            const priority = ["Alta", "Média", "Baixa"].includes(cols[4]) ? cols[4] : "Média";
            let status = (cols[5] || "todo").toLowerCase();
            if (!["todo", "in-progress", "done"].includes(status)) status = "todo";

            const existingIndex = issues.findIndex(iss => iss.id === id);
            if (existingIndex > -1) {
                issues[existingIndex] = { id, title, description, epic, priority, status };
            } else {
                issues.push({ id, title, description, epic, priority, status });
            }
        }
        saveAndRender();
        event.target.value = '';
    };
    reader.readAsText(file);
}

function saveAndRender() {
    localStorage.setItem('trilhosIssues', JSON.stringify(issues));
    updateFilterDropdowns();
    renderBoard();
}

function clearBoard() {
    if (confirm('Tem a certeza que deseja apagar TODOS os tickets do quadro?')) {
        issues = [];
        saveAndRender();
    }
}

function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Initial Load
updateFilterDropdowns();
renderBoard();
