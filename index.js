let db = null;

// ============================================
// DATABASE SETUP
// ============================================

function openDatabase() {
    const request = indexedDB.open('lwsDB', 1);

    request.onerror = function () {
        console.error('Database failed to open');
        showNotification('Database error', 'error');
    };

    request.onsuccess = function () {
        db = request.result;
        console.log('Database opened successfully');
        displayAllUsers();
    };
}

// ============================================
// UI Handler Functions
// ============================================

function handleCreateForm(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const department = document.getElementById('department').value;

    console.log('Form submitted with:', { name, email, role, department });

    // Clear form
    clearForm();

    // Show notification
    showNotification('User added successfully');
}

function handleSearchUser() {
    const email = document.getElementById('searchEmail').value.trim();

    if (!email) {
        showNotification('Please enter an email to search', 'error');
        return;
    }

    console.log('Searching for email:', email);

    // Show search results section
    const resultsDiv = document.getElementById('searchResults');
    const resultsContent = document.getElementById('searchResultContent');

    resultsContent.innerHTML = `
        <p class="text-gray-600">Searching for: <strong>${email}</strong></p>
    `;
    resultsDiv.classList.remove('hidden');
}

function handleClearSearch() {
    document.getElementById('searchEmail').value = '';
    document.getElementById('searchResults').classList.add('hidden');
    console.log('Search cleared');
}

function handleEditUser(userId) {
    console.log('Edit user with ID:', userId);

    // Open modal
    openEditModal();
}

function handleDeleteUser(userId) {
    console.log('Delete user with ID:', userId);

    if (confirm('Are you sure you want to delete this user?')) {
        showNotification('User deleted successfully');
    }
}

function handleUpdateUser(e) {
    e.preventDefault();

    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    const department = document.getElementById('editDepartment').value;

    console.log('User updated:', { name, email, role, department });

    closeEditModal();
    showNotification('User updated successfully');
}

// ============================================
// UI Utility Functions
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;

    if (type === 'error') {
        notification.classList.remove('bg-green-600');
        notification.classList.add('bg-red-600');
    } else {
        notification.classList.remove('bg-red-600');
        notification.classList.add('bg-green-600');
    }

    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function clearForm() {
    document.getElementById('createForm').reset();
    document.getElementById('name').focus();
    console.log('Form cleared');
}

function openEditModal() {
    document.getElementById('editModal').classList.remove('hidden');
    console.log('Edit modal opened');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editForm').reset();
    console.log('Edit modal closed');
}

// ============================================
// DOM Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Form submissions
    openDatabase()
    document.getElementById('createForm').addEventListener('submit', handleCreateForm);
    document.getElementById('editForm').addEventListener('submit', handleUpdateUser);

    // Search buttons
    document.getElementById('searchBtn').addEventListener('click', handleSearchUser);
    document.getElementById('clearSearchBtn').addEventListener('click', handleClearSearch);

    // Modal close button
    document.getElementById('closeEditBtn').addEventListener('click', closeEditModal);

    // Close modal when clicking outside
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    console.log('Application initialized - ready for IndexedDB implementation');
});
