// This will select elements from HTML

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

//Now create an array to store todos

let todos = [];
let currentFilter = 'all';

console.log('JavaScript is loaded successfully!');
console.log('Todo Input:', todoInput);
console.log('Add Button:', addBtn);

//Function to add a new todo
function addTodo() {
    // get text from user input
    const todoText = todoInput.value.trim();

    //check if input is empty
    if(todoText === ''){
        alert('Please enter a task!');
        return;//stop function here
    }

    //Create todo Object
    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false
    };

    //Add to todos Array
    todos.push(todo);
    saveTodos();

    //clear input field
    todoInput.value = '';

    //Update the display
    renderTodos();
    updateCount();

    console.log('Todo added:', todo);
    console.log('All todos:', todos);
}

//Event Listener for Add Button
addBtn.addEventListener('click', addTodo);

//Event Listener for Enter Key
todoInput.addEventListener('keypress', function(e) {
    if(e.key === 'Enter'){
        addTodo();
    }
});

//Function to display to todos on screen 
function renderTodos() {
    // Clear List first 
    todoList.innerHTML = '';

    //Filter todos based on current filter
    let filteredTodos = todos;

    if (currentFilter === 'active'){
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    //If no todos, show empty state
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
        <div class="empty-state">
        <h3> No Tasks yet</h3>
        <p>Add a task to get started!</p>
        </div>
        `;
        return;
    }

    //Loop through todos and create HTML for each
    filteredTodos.forEach(todo => {
        //Create list item
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) {
        li.classList.add('completed');            
        }

        //Create HTML Content
     li.innerHTML = `
    <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(${todo.id})"
    >
    <span class="todo-text" ondblclick="editTodo(${todo.id})">${todo.text}</span>
    <div class="todo-actions">
        <button class="edit-btn" onclick="editTodo(${todo.id})" title="Edit">✏️</button>
        <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Delete">🗑️</button>
    </div>
`;
        //Add to List
        todoList.appendChild(li);
    });
}

//Function to update todo count
function updateCount() {
    const activeTodos = todos.filter(todo => !todo.completed);
    const count = activeTodos.length;
    todoCount.textContent = `${count} task${count !== 1 ? 's' : ''} remaining`; 
}

//Function to delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();

    //update display
    renderTodos();
    updateCount();

    console.log('🗑️ Todo deleted. Remaining:', todos);
}

//Function to toggle todo completion
function toggleTodo(id) {
    //Find the todo and toggle its completed status 
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
    }
    //Update display
    renderTodos();
    updateCount();
    console.log('✓ Todo toggled:', todo);
}

//Function to clear all completed todos
clearCompleted.addEventListener('click', function () {
    todos = todos.filter(todo => !todo.completed);
    renderTodos();
    updateCount();
    console.log('🧹 Completed todos cleared');
    
});

// Handle filter button clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update current filter
        currentFilter = this.dataset.filter;
        
        // Re-render todos
        renderTodos();
        
        console.log('🔍 Filter changed to:', currentFilter);
    });
});

//Local storage (data persistence)
//Now  save todos to browser storage

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    console.log('💾 Todos saved to storage')
}
//Load todos from browser storage
function loadTodos() {
    const saveTodos = localStorage.getItem('todos');
    if (saveTodos) {
        todos = JSON.parse(saveTodos);
        renderTodos();
        updateCount();
        console.log('📂 Loaded todos from storage:', todos);
    }
}

//Function to Edit todo

function editTodo(id) {
    //Find the todo
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    //Find the list item
    const todoItems = document.querySelectorAll('.todo-item');
    let todoElement = null;

    todoItems.forEach(item => {
        const checkbox = item.querySelector('.todo-checkbox');
        if (checkbox && checkbox.getAttribute('onchange').includes(id)) {
        todoElement = item;            
        }
    });   

    if (!todoElement) return;

    //Add editing class
    todoElement.classList.add('editing');

    //store original text , if user cancels
    todoElement.dataset.originalText = todo.text;

    //create edit input and buttons
    todoElement.innerHTML = `
    <input
        type="text"
        class="edit-input"
        value="${todo.text}"
        id="editInput-${id}"
    >
    <button class="save-btn" onclick="saveEdit(${id})">💾 Save</button>
    <button class="cancel-btn" onclick="cancelEdit(${id})">❌ Cancel</button>
    `;
    //Focus the input
    const editInput = document.getElementById(`editInput-${id}`);
    editInput.focus();
    editInput.select();

    //save on enter key or cancel on escape
    editInput.addEventListener('keypress', function(e){
        if (e.key === 'Enter') {
            saveEdit(id);           
        }  
    });
    editInput.addEventListener('keydown', function(e){
        if (e.key === 'Escape') {
            cancelEdit(id);
        }
    });

    console.log('Editing todo:', id);
}
    //Function to save edited todo
    function saveEdit(id) {
        const editInput = document.getElementById(`editInput-${id}`);
        const newText = editInput.value.trim();

        //Validate Input
        if(newText === ''){
            alert('Task cannot be empty!');
            editInput.focus();
            return;
        }
        //Update the todo
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            saveTodos();
            renderTodos();
            updateCount();
            console.log('✅ Todo Completed:', todo);
        }
    }
        //Function for cancel editing
        function cancelEdit(id) {
            renderTodos();
            console.log('❌ Edit Cancelled');
            
        }

// KEYBOARD SHORTCUTS
// Global keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: Focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        todoInput.focus();
        console.log('⌨️ Keyboard shortcut: Focus input');
    }
    
    // Ctrl/Cmd + Shift + C: Clear completed
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        const completedCount = todos.filter(t => t.completed).length;
        if (completedCount > 0) {
            if (confirm(`Delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
                todos = todos.filter(todo => !todo.completed);
                saveTodos();
                renderTodos();
                updateCount();
                console.log('🧹 Cleared via keyboard shortcut');
            }
        }
    }
    
    // Escape: Clear input
    if (e.key === 'Escape' && document.activeElement === todoInput) {
        todoInput.value = '';
        todoInput.blur();
        console.log('⌨️ Input cleared and unfocused');
    }
});

console.log('⌨️ Keyboard shortcuts enabled:');
console.log('  • Ctrl/Cmd + K: Focus input');
console.log('  • Ctrl/Cmd + Shift + C: Clear completed');
console.log('  • Escape: Clear input field');

// HELP MODAL
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');

// Show help modal
helpBtn.addEventListener('click', function() {
    helpModal.classList.add('show');
    console.log('📖 Help modal opened');
});

// Close help modal
function closeHelp() {
    helpModal.classList.remove('show');
    console.log('📖 Help modal closed');
}

// Close on outside click
helpModal.addEventListener('click', function(e) {
    if (e.target === helpModal) {
        closeHelp();
    }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && helpModal.classList.contains('show')) {
        closeHelp();
    }
});

// Celebration effect when task is completed
function celebrateCompletion() {
    // Create confetti elements
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.backgroundColor = ['#667eea', '#764ba2', '#ffc107', '#28a745', '#dc3545'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Update toggleTodo to add celebration
// Find your toggleTodo function and modify it:
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        
        // Celebrate if completing (not uncompleting)
        if (todo.completed) {
            celebrateCompletion();
            console.log('🎉 Task completed! Celebration!');
        }
        
        saveTodos();
        renderTodos();
        updateCount();
    }
}

function updateCount() {
    const activeTodos = todos.filter(todo => !todo.completed);
    const count = activeTodos.length;
    todoCount.textContent = `${count} task${count !== 1 ? 's' : ''} remaining`;
    
    // Add animation class
    todoCount.classList.add('updated');
    setTimeout(() => {
        todoCount.classList.remove('updated');
    }, 300);
}

//Load todos when page loads
loadTodos();