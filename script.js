document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let tasks = [
        {
            id: 'task-' + Date.now(),
            title: 'Finalize Q3 Marketing Strategy',
            description: 'Review the latest user engagement metrics and update the Q3 marketing strategy accordingly. Make sure to compile the slide deck for the executive review meeting happening next Wednesday.',
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)).toISOString(),
            tags: ['work', 'urgent', 'marketing']
        },
        {
            id: 'task-' + (Date.now() + 1),
            title: 'Feed my cat',
            description: 'Give the cat its evening wet food serving and refill the water bowl.',
            priority: 'medium',
            status: 'pending',
            dueDate: new Date(Date.now() + (4 * 60 * 60 * 1000)).toISOString(),
            tags: ['home', 'pets']
        },
        {
            id: 'task-' + (Date.now() + 2),
            title: 'Watch JJK',
            description: 'Catch up on the newest Jujutsu Kaisen episode.',
            priority: 'low',
            status: 'pending',
            dueDate: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
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
    function formatTimeRemaining(dueDateStr) {
        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diffMs = dueDate - now;
        const isOverdue = diffMs < 0;
        const absDiff = Math.abs(diffMs);
        
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (absDiff < 60 * 1000) {
           return isOverdue ? "Overdue, due now!" : "Due now!";
        } else if (isOverdue) {
           if (days > 0) return `Overdue by ${days} day${days > 1 ? 's' : ''}`;
           if (hours > 0) return `Overdue by ${hours} hour${hours > 1 ? 's' : ''}`;
           return `Overdue by ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            if (days > 1) return `Due in ${days} days`;
            if (days === 1) return `Due tomorrow`;
            if (hours > 0) return `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
            return `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
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
            const timeHint = formatTimeRemaining(task.dueDate);
            const isDone = task.status === 'done';
            
            const capPriority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            const capStatus = task.status.charAt(0).toUpperCase() + task.status.slice(1);

            // Generate tags HTML
            const tagsHtml = task.tags.map(tag => {
                const cleanTag = tag.trim().toLowerCase();
                const testIdAttr = ['work', 'urgent'].includes(cleanTag) ? `data-testid="test-todo-tag-${cleanTag}"` : '';
                return `<li class="tag tag-${cleanTag}" ${testIdAttr}>${tag.trim()}</li>`;
            }).join('');

            const cardHTML = `
                <article class="todo-card ${isDone ? 'completed' : ''}" data-testid="test-todo-card" aria-labelledby="title-${task.id}">
                    <div class="flower-decor top-right" aria-hidden="true">🌸</div>
                    <div class="flower-decor bottom-left" aria-hidden="true">🌼</div>
                    <header class="todo-header">
                        <div class="todo-badges">
                            <span class="badge priority-${task.priority}" data-testid="test-todo-priority" aria-label="Priority: ${capPriority}">
                                <i class="fa-solid ${task.priority === 'high' ? 'fa-fire' : task.priority === 'medium' ? 'fa-bolt' : 'fa-leaf'}" aria-hidden="true"></i> ${capPriority}
                            </span>
                            <span class="badge status-${task.status}" data-testid="test-todo-status" aria-label="Status: ${capStatus}">
                                ${capStatus}
                            </span>
                        </div>

                        <div class="todo-title-row">
                            <div class="checkbox-container">
                                <input type="checkbox" id="check-${task.id}" class="todo-checkbox" data-testid="test-todo-complete-toggle" aria-label="Mark task as complete" ${isDone ? 'checked' : ''} data-id="${task.id}">
                                <label for="check-${task.id}" class="checkbox-custom" aria-hidden="true"></label>
                            </div>
                            <h2 class="todo-title" id="title-${task.id}" data-testid="test-todo-title">
                                ${task.title}
                            </h2>
                        </div>
                    </header>

                    <div class="todo-body">
                        <p class="todo-description" data-testid="test-todo-description">
                            ${task.description}
                        </p>

                        <div class="todo-meta">
                            <div class="meta-row">
                                <i class="fa-regular fa-calendar meta-icon" aria-hidden="true"></i>
                                <time class="meta-text" data-testid="test-todo-due-date" datetime="${task.dueDate}">
                                    ${formattedDate}
                                </time>
                            </div>
                            
                            <div class="meta-row ${task.priority === 'high' ? 'meta-highlight' : ''}">
                                <i class="fa-regular fa-clock meta-icon" aria-hidden="true"></i>
                                <time class="meta-text time-remaining" data-testid="test-todo-time-remaining" aria-live="polite">
                                    ${timeHint}
                                </time>
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

    // Keep times updated dynamically on all rendered cards
    setInterval(() => {
        document.querySelectorAll('[data-testid="test-todo-time-remaining"]').forEach(el => {
            const card = el.closest('article');
            const timeEl = card.querySelector('time');
            if (timeEl) {
                const newTimeText = formatTimeRemaining(timeEl.getAttribute('datetime'));
                if (el.textContent.trim() !== newTimeText) {
                    el.textContent = newTimeText;
                }
            }
        });
    }, 60000); // 1 minute

    // --- Modal & Form Logic ---
    function openModalForAdd() {
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
    }

    btnOpenModal.addEventListener('click', openModalForAdd);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelTask.addEventListener('click', closeModal);
    
    // Close modal on outside click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
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
        } else {
            tasks.unshift(newTask); // Add to top
        }

        closeModal();
        renderTasks();
    });

    // Initialize Initial Render
    renderTasks();
});
