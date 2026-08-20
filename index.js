let db = null;

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

    request.onupgradeneeded = function (e) {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('users')) {
            const objectStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('emailIndex', 'email', { unique: true });
        }
    };
}

function addUser(userData) {
    const transaction = db.transaction(['users'], 'readwrite');
    const objectStore = transaction.objectStore('users');

    const user = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        createdAt: new Date().toISOString()
    };

    const request = objectStore.add(user);

    request.onsuccess = function () {
        console.log('User added with ID:', request.result);
        showNotification('User added successfully');
        clearForm();
        displayAllUsers();
    };

    request.onerror = function () {
        console.error('Error adding user:', request.error);
        showNotification('Error adding user: ' + request.error, 'error');
    };
}

function getAllUsers() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const objectStore = transaction.objectStore('users');
        const request = objectStore.getAll();

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

function getUser(userId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const objectStore = transaction.objectStore('users');
        const request = objectStore.get(userId);

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

function updateUser(userId, userData) {
    const transaction = db.transaction(['users'], 'readwrite');
    const objectStore = transaction.objectStore('users');

    const updatedUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        updatedAt: new Date().toISOString()
    };

    const request = objectStore.put(updatedUser);

    request.onsuccess = function () {
        console.log('User updated:', userId);
        showNotification('User updated successfully');
        closeEditModal();
        displayAllUsers();
    };

    request.onerror = function () {
        console.error('Error updating user:', request.error);
        showNotification('Error updating user: ' + request.error, 'error');
    };
}

function deleteUser(userId) {
    const transaction = db.transaction(['users'], 'readwrite');
    const objectStore = transaction.objectStore('users');
    const request = objectStore.delete(userId);

    request.onsuccess = function () {
        console.log('User deleted:', userId);
        showNotification('User deleted successfully');
        displayAllUsers();
    };

    request.onerror = function () {
        console.error('Error deleting user:', request.error);
        showNotification('Error deleting user: ' + request.error, 'error');
    };
}

function searchByEmail(email) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const objectStore = transaction.objectStore('users');
        const index = objectStore.index('emailIndex');
        const request = index.get(email);

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

// ============================================
// UI HANDLER FUNCTIONS
// ============================================

function handleCreateForm(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value
    };

    addUser(formData);
}

function handleSearchUser() {
    const email = document.getElementById('searchEmail').value.trim();

    if (!email) {
        showNotification('Please enter an email to search', 'error');
        return;
    }

    searchByEmail(email).then(user => {
        const resultsDiv = document.getElementById('searchResults');
        const resultsContent = document.getElementById('searchResultContent');

        if (user) {
            resultsContent.innerHTML = `
                <div class="bg-white p-4 rounded border border-green-200">
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Department:</strong> ${user.department}</p>
                </div>
            `;
            resultsDiv.classList.remove('hidden');
            console.log('User found:', user);
        } else {
            resultsContent.innerHTML = '<p class="text-gray-600">No user found with that email.</p>';
            resultsDiv.classList.remove('hidden');
            console.log('No user found for email:', email);
        }
    }).catch(err => {
        console.error('Search error:', err);
        showNotification('Error searching user', 'error');
    });
}

function handleClearSearch() {
    document.getElementById('searchEmail').value = '';
    document.getElementById('searchResults').classList.add('hidden');
    console.log('Search cleared');
}

function handleEditUser(userId) {
    getUser(userId).then(user => {
        if (user) {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editName').value = user.name;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editRole').value = user.role;
            document.getElementById('editDepartment').value = user.department;

            openEditModal();
        }
    }).catch(err => {
        console.error('Error loading user:', err);
        showNotification('Error loading user', 'error');
    });
}

function handleDeleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        deleteUser(userId);
    }
}

function handleUpdateUser(e) {
    e.preventDefault();

    const userId = parseInt(document.getElementById('editUserId').value);
    const userData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value,
        department: document.getElementById('editDepartment').value
    };

    updateUser(userId, userData);
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayAllUsers() {
    getAllUsers().then(users => {
        const usersList = document.getElementById('usersList');

        if (users.length === 0) {
            usersList.innerHTML = '<p class="text-gray-500 text-center py-8">No users yet. Add one to get started!</p>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-gray-900">${user.name}</h3>
                    <p class="text-sm text-gray-600">Email: ${user.email}</p>
                    <p class="text-sm text-gray-600">Role: ${user.role}</p>
                    <p class="text-sm text-gray-600">Department: ${user.department}</p>
                </div>
                <div class="flex gap-2">
                    <button 
                        onclick="handleEditUser(${user.id})"
                        class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="handleDeleteUser(${user.id})"
                        class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        console.log('Displayed', users.length, 'users');
    }).catch(err => {
        console.error('Error fetching users:', err);
        showNotification('Error loading users', 'error');
    });
}

// ============================================
// UTILITY FUNCTIONS
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
}

function openEditModal() {
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editForm').reset();
    console.log('Edit modal closed');
}

// ============================================
// DOM EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize database
    openDatabase();

    // Form submissions
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

    console.log('Application initialized - IndexedDB ready');
});
