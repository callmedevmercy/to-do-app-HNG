document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let expandedTaskIds = new Set();
    let lastEditedTaskId = null;

    let tasks = [
        {
            id: 'task-1',
            title: 'Finalize Q3 Marketing Strategy',
            description: 'Review the latest user engagement metrics and update the Q3 marketing strategy accordingly. Make sure to compile the slide deck for the executive review meeting happening next Wednesday.',
            priority: 'high',
            status: 'pending',
            dueDate: '2026-04-18T10:00:00.000Z',
            tags: ['work', 'urgent', 'marketing']
        },
        {
            id: 'task-2',
            title: 'Feed my cat',
            description: 'Give the cat its evening wet food serving and refill the water bowl.',
            priority: 'medium',
            status: 'pending',
            dueDate: '2026-04-19T14:30:00.000Z',
            tags: ['home', 'pets']
        },
        {
            id: 'task-3',
            title: 'Watch JJK',
            description: 'Catch up on the newest Jujutsu Kaisen episode.',
            priority: 'low',
            status: 'pending',
            dueDate: '2026-04-20T20:00:00.000Z',
            tags: ['leisure', 'anime']
        }
    ];

    // --- DOM Elements ---
    const todoListEl = document.getElementById('todo-list');
    const modalOverlay = document.getElementById('task-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');

    // Form Inputs
    const inputId = document.getElementById('task-id');
    const inputTitle = document.getElementById('task-title');
    const inputDesc = document.getElementById('task-desc');
    const inputPriority = document.getElementById('task-priority');
    const inputDue = document.getElementById('task-due');
    const inputTags = document.getElementById('task-tags');

    // --- Core Logic ---
    function formatTimeRemaining(dueDateStr, status) {
        if (status === 'done') {
            return { text: "Completed", isOverdue: false };
        }

        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diffMs = dueDate - now;
        const isOverdue = diffMs < 0;
        const absDiff = Math.abs(diffMs);
        
        let text = "";
        if (absDiff < 60 * 1000) {
            text = isOverdue ? "Overdue, due now!" : "Due now!";
        } else if (absDiff >= 24 * 60 * 60 * 1000) {
            const days = Math.round(absDiff / (1000 * 60 * 60 * 24));
            text = isOverdue ? `Overdue by ${days} day${days > 1 ? 's' : ''}` : `Due in ${days} day${days > 1 ? 's' : ''}`;
        } else if (absDiff >= 60 * 60 * 1000) {
            const hours = Math.round(absDiff / (1000 * 60 * 60));
            text = isOverdue ? `Overdue by ${hours} hour${hours > 1 ? 's' : ''}` : `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            const minutes = Math.round(absDiff / (1000 * 60));
            text = isOverdue ? `Overdue by ${minutes} minute${minutes > 1 ? 's' : ''}` : `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        return { text, isOverdue };
    }

    function renderTasks() {
        todoListEl.innerHTML = '';
        
        if (tasks.length === 0) {
            todoListEl.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Click "Add Task" to create your first todo.</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const dueDateObj = new Date(task.dueDate);
            const formattedDate = `Due ${dueDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
            const { text: timeHint, isOverdue } = formatTimeRemaining(task.dueDate, task.status);
            const isDone = task.status === 'done';
            const isExpanded = expandedTaskIds.has(task.id);
            const isLong = task.description.length > 80;
            
            const capPriority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            let capStatus = task.status;
            if (capStatus === 'in progress') capStatus = 'In Progress';
            else capStatus = capStatus.charAt(0).toUpperCase() + capStatus.slice(1);

            // Generate tags HTML
            const tagsHtml = task.tags.map(tag => {
                const cleanTag = tag.trim().toLowerCase();
                const testIdAttr = ['work', 'urgent'].includes(cleanTag) ? `data-testid="test-todo-tag-${cleanTag}"` : '';
                return `<li class="tag tag-${cleanTag}" ${testIdAttr}>${tag.trim()}</li>`;
            }).join('');

            const cardHTML = `
                <article class="todo-card ${isDone ? 'completed' : ''} ${task.status === 'in progress' ? 'in-progress' : ''} ${isOverdue ? 'overdue' : ''}" data-testid="test-todo-card" aria-labelledby="title-${task.id}">
                    <div class="priority-indicator priority-${task.priority}" data-testid="test-todo-priority-indicator"></div>
                    <div class="flower-decor top-right" aria-hidden="true">🌸</div>
                    <div class="flower-decor bottom-left" aria-hidden="true">🌼</div>
                    <header class="todo-header">
                        <div class="todo-title-row">
                            <div class="checkbox-container">
                                <input type="checkbox" id="check-${task.id}" class="todo-checkbox" data-testid="test-todo-complete-toggle" aria-label="Mark task as complete" ${isDone ? 'checked' : ''} data-id="${task.id}">
                                <label for="check-${task.id}" class="checkbox-custom" aria-hidden="true"></label>
                            </div>
                            <h2 class="todo-title" id="title-${task.id}" data-testid="test-todo-title">
                                ${task.title}
                            </h2>
                        </div>

                        <div class="todo-badges">
                            <span class="badge priority-${task.priority}" data-testid="test-todo-priority" aria-label="Priority: ${capPriority}">
                                <i class="fa-solid ${task.priority === 'high' ? 'fa-fire' : task.priority === 'medium' ? 'fa-bolt' : 'fa-leaf'}" aria-hidden="true"></i> ${capPriority}
                            </span>
                            <select class="status-dropdown status-${task.status.replace(' ', '-')}" data-testid="test-todo-status-control" data-id="${task.id}" aria-label="Change status">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>In Progress</option>
                                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                            </select>
                        </div>
                    </header>

                    <div class="todo-body">
                        ${isLong ? `
                        <button type="button" class="btn-expand" data-testid="test-todo-expand-toggle" aria-expanded="${isExpanded}" aria-controls="collapse-${task.id}" data-id="${task.id}">
                            ${isExpanded ? 'Hide Details' : 'Show Details'} <i class="fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}" aria-hidden="true"></i>
                        </button>
                        ` : ''}

                        <div id="collapse-${task.id}" class="collapsible-section ${!isLong || isExpanded ? '' : 'hidden'}" data-testid="test-todo-collapsible-section">
                            <p class="todo-description" data-testid="test-todo-description">
                                ${task.description}
                            </p>
                        </div>

                        <div class="todo-meta">
                            <div class="meta-row">
                                <i class="fa-regular fa-calendar meta-icon" aria-hidden="true"></i>
                                <time class="meta-text" data-testid="test-todo-due-date" datetime="${task.dueDate}">
                                    ${formattedDate}
                                </time>
                            </div>
                            
                            <div class="meta-row ${task.priority === 'high' ? 'meta-highlight' : ''} ${isOverdue ? 'overdue-text' : ''}">
                                <i class="fa-regular fa-clock meta-icon" aria-hidden="true"></i>
                                <time class="meta-text time-remaining" data-testid="test-todo-time-remaining" aria-live="polite" datetime="${task.dueDate}">
                                    ${timeHint}
                                </time>
                                ${isOverdue ? `<span class="overdue-badge" data-testid="test-todo-overdue-indicator">Overdue!</span>` : ''}
                            </div>
                        </div>

                        <ul class="todo-tags" role="list" data-testid="test-todo-tags">
                            ${tagsHtml}
                        </ul>
                    </div>

                    <footer class="todo-footer">
                        <button type="button" class="btn btn-edit edit-btn" data-testid="test-todo-edit-button" data-id="${task.id}">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                        </button>
                        <button type="button" class="btn btn-delete delete-btn" data-testid="test-todo-delete-button" data-id="${task.id}">
                            <i class="fa-solid fa-trash" aria-hidden="true"></i> Delete
                        </button>
                    </footer>
                </article>
            `;

            todoListEl.insertAdjacentHTML('beforeend', cardHTML);
        });

        attachEventListeners();
    }

    // --- Interaction Listeners ---
    function attachEventListeners() {
        // Toggle Checkboxes
        document.querySelectorAll('.todo-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.status = e.target.checked ? 'done' : 'pending';
                    renderTasks(); 
                }
            });
        });

        // Status Dropdown
        document.querySelectorAll('.status-dropdown').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.status = e.target.value;
                    renderTasks();
                }
            });
        });

        // Expand Toggle
        document.querySelectorAll('[data-testid="test-todo-expand-toggle"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (expandedTaskIds.has(id)) {
                    expandedTaskIds.delete(id);
                } else {
                    expandedTaskIds.add(id);
                }
                renderTasks();
            });
        });

        // Edit Buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Delete Buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(t => t.id !== id);
                    renderTasks();
                }
            });
        });
    }

    // Keep times updated dynamically (without killing form focus)
    setInterval(() => {
        document.querySelectorAll('[data-testid="test-todo-time-remaining"]').forEach(el => {
            const card = el.closest('article');
            const metaRow = el.closest('.meta-row');
            const dueDateStr = el.getAttribute('datetime');
            
            const isDone = card.classList.contains('completed');
            const status = isDone ? 'done' : 'pending'; // In-progress is fine as 'pending' for time calculation
            
            const { text: newTimeText, isOverdue } = formatTimeRemaining(dueDateStr, status);
            
            if (el.textContent.trim() !== newTimeText) {
                el.textContent = newTimeText;
            }
            
            if (isOverdue && !isDone) {
                if (!card.classList.contains('overdue')) {
                    card.classList.add('overdue');
                    metaRow.classList.add('overdue-text');
                    metaRow.insertAdjacentHTML('beforeend', '<span class="overdue-badge" data-testid="test-todo-overdue-indicator">Overdue!</span>');
                }
            } else {
                if (card.classList.contains('overdue')) {
                    card.classList.remove('overdue');
                    metaRow.classList.remove('overdue-text');
                    const badge = metaRow.querySelector('.overdue-badge');
                    if (badge) badge.remove();
                }
            }
        });
    }, 60000); // 1 minute

    // --- Modal & Form Logic ---
    function openModalForAdd() {
        lastEditedTaskId = null;
        modalTitle.textContent = "Add New Task";
        taskForm.reset();
        inputId.value = '';
        
        // Default Due Date safely into datetime-local format
        const defaultDue = new Date(Date.now() + 24 * 60 * 60 * 1000);
        defaultDue.setMinutes(defaultDue.getMinutes() - defaultDue.getTimezoneOffset());
        inputDue.value = defaultDue.toISOString().slice(0, 16);
        
        modalOverlay.classList.add('active');
    }

    function openEditModal(id) {
        lastEditedTaskId = id;
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        modalTitle.textContent = "Edit Task";
        inputId.value = task.id;
        inputTitle.value = task.title;
        inputDesc.value = task.description;
        inputPriority.value = task.priority;
        
        const localDate = new Date(task.dueDate);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
        inputDue.value = localDate.toISOString().slice(0, 16);
        
        inputTags.value = task.tags.join(', ');
        
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        if (lastEditedTaskId) {
            setTimeout(() => {
                const editBtn = document.querySelector(`.edit-btn[data-id="${lastEditedTaskId}"]`);
                if (editBtn) editBtn.focus();
                lastEditedTaskId = null;
            }, 0);
        } else {
            setTimeout(() => {
                const addBtn = document.getElementById('btn-open-modal');
                if (addBtn) addBtn.focus();
            }, 0);
        }
    }

    btnOpenModal.addEventListener('click', openModalForAdd);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelTask.addEventListener('click', closeModal);
    
    // Close modal on outside click or Escape
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    modalOverlay.addEventListener('keydown', function(e) {
        if (!modalOverlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }
        
        if (e.key === 'Tab') {
            const focusableContent = modalOverlay.querySelectorAll(focusableElements);
            const firstElement = focusableContent[0];
            const lastElement = focusableContent[focusableContent.length - 1];

            if (e.shiftKey) { 
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // Form Submit
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isEditing = inputId.value !== '';
        
        const newTask = {
            id: isEditing ? inputId.value : 'task-' + Date.now(),
            title: inputTitle.value.trim(),
            description: inputDesc.value.trim(),
            priority: inputPriority.value,
            status: isEditing ? tasks.find(t=>t.id === inputId.value).status : 'pending',
            dueDate: new Date(inputDue.value).toISOString(),
            tags: inputTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (isEditing) {
            tasks = tasks.map(t => t.id === newTask.id ? newTask : t);
            lastEditedTaskId = newTask.id;
        } else {
            tasks.unshift(newTask); // Add to top
            lastEditedTaskId = null;
        }

        renderTasks();
        closeModal();
    });

    // Initialize Initial Render
    renderTasks();
});
