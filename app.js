// ===================================
// Family Investment Tracker - Application Logic
// ===================================

// ===================================
// Data Models & Constants
// ===================================

const INVESTMENT_CATEGORIES = [
    'Equity',
    'Stocks',
    'US Stock',
    'Mutual Funds',
    'Fixed Deposits',
    'RD (Recurring Deposit)',
    'Bonds',
    'Real Estate',
    'Gold/Commodities',
    'PPF/NPS',
    'Post Office',
    'Other'
];

const FAMILY_MEMBERS = [
    { id: 'self', name: 'Self', username: 'self', avatar: '👤' },
    { id: 'spouse', name: 'Spouse', username: 'spouse', avatar: '💑' }
];

// ===================================
// State Management
// ===================================

let currentUser = null;
let currentView = 'dashboard';
let selectedMember = null;

// ===================================
// Utility Functions
// ===================================

// Simple password hashing (for demo - use proper hashing in production)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Calculate gain/loss percentage
function calculateGainLoss(invested, current) {
    if (invested === 0) return 0;
    return ((current - invested) / invested) * 100;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===================================
// Local Storage Management
// ===================================

function initializeStorage() {
    // Initialize or Update Users
    let users = JSON.parse(localStorage.getItem('investmentTrackerUsers') || 'null');

    if (!users) {
        // First time initialization
        users = FAMILY_MEMBERS.map(member => ({
            id: member.id,
            username: member.username,
            password: hashPassword('password123'), // Default password
            name: member.name,
            avatar: member.avatar
        }));
        localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));
    } else {
        // Remove default users that are no longer in FAMILY_MEMBERS (e.g. daughters)
        // But keep custom added users (who won't be in FAMILY_MEMBERS anyway)
        // And keep Self/Spouse updates

        // List of default IDs that should exist
        const defaultIds = FAMILY_MEMBERS.map(m => m.id);

        // List of default IDs that were removed (hardcoded for this migration)
        const removedIds = ['daughter1', 'daughter2'];

        // Filter out the removed default users
        users = users.filter(user => !removedIds.includes(user.id));

        localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));
    }

    if (!localStorage.getItem('investmentTrackerData')) {
        const defaultData = {};
        FAMILY_MEMBERS.forEach(member => {
            defaultData[member.id] = [];
        });
        localStorage.setItem('investmentTrackerData', JSON.stringify(defaultData));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('investmentTrackerUsers') || '[]');
}

function getInvestments(userId = null) {
    const allData = JSON.parse(localStorage.getItem('investmentTrackerData') || '{}');
    return userId ? (allData[userId] || []) : allData;
}

function saveInvestments(userId, investments) {
    const allData = getInvestments();
    allData[userId] = investments;
    localStorage.setItem('investmentTrackerData', JSON.stringify(allData));
}

function addInvestment(userId, investment) {
    const investments = getInvestments(userId);
    investment.id = generateId();
    investment.createdAt = new Date().toISOString();
    investments.push(investment);
    saveInvestments(userId, investments);
}

function updateInvestment(userId, investmentId, updatedData) {
    const investments = getInvestments(userId);
    const index = investments.findIndex(inv => inv.id === investmentId);
    if (index !== -1) {
        investments[index] = { ...investments[index], ...updatedData };
        saveInvestments(userId, investments);
    }
}

function deleteInvestment(userId, investmentId) {
    const investments = getInvestments(userId);
    const filtered = investments.filter(inv => inv.id !== investmentId);
    saveInvestments(userId, filtered);
}

// ===================================
// Authentication
// ===================================

function login(username, password) {
    const users = getUsers();
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.username === username && u.password === hashedPassword);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('app-header').classList.add('hidden');
    showPage('login');
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

// ===================================
// UI Navigation
// ===================================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    currentView = pageName;

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===================================
// Dashboard Functions
// ===================================

function renderDashboard() {
    const allInvestments = getInvestments();
    const users = getUsers(); // Get updated users from localStorage

    // Calculate total stats
    let totalInvested = 0;
    let totalCurrent = 0;

    Object.values(allInvestments).forEach(userInvestments => {
        userInvestments.forEach(inv => {
            totalInvested += parseFloat(inv.investedAmount || 0);
            totalCurrent += parseFloat(inv.currentValue || 0);
        });
    });

    const totalGain = totalCurrent - totalInvested;
    const totalGainPercent = calculateGainLoss(totalInvested, totalCurrent);

    // Update stats display
    document.getElementById('total-portfolio').textContent = formatCurrency(totalCurrent);
    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('total-gain').textContent = formatCurrency(totalGain);
    document.getElementById('total-gain-percent').textContent =
        `${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`;
    document.getElementById('total-gain-percent').className = totalGain >= 0 ? 'text-success' : 'text-danger';
    document.getElementById('total-investments').textContent = users.length; // Display number of users

    // Render member cards
    const memberGrid = document.getElementById('member-grid');
    memberGrid.innerHTML = '';

    users.forEach(member => {
        const investments = allInvestments[member.id] || [];
        let memberInvested = 0;
        let memberCurrent = 0;

        investments.forEach(inv => {
            memberInvested += parseFloat(inv.investedAmount || 0);
            memberCurrent += parseFloat(inv.currentValue || 0);
        });

        const memberGain = memberCurrent - memberInvested;
        const memberGainPercent = calculateGainLoss(memberInvested, memberCurrent);

        const card = document.createElement('div');
        card.className = 'glass-card member-card';
        card.onclick = () => viewMemberDetails(member.id);
        card.innerHTML = `
      <div class="member-avatar">${member.avatar}</div>
      <div class="member-name">${member.name}</div>
      <div class="member-stats">
        <div class="member-stat-item">
          <div class="member-stat-label">Investments</div>
          <div class="member-stat-value">${investments.length}</div>
        </div>
        <div class="member-stat-item">
          <div class="member-stat-label">Portfolio</div>
          <div class="member-stat-value">${formatCurrency(memberCurrent)}</div>
        </div>
        <div class="member-stat-item">
          <div class="member-stat-label">Gain/Loss</div>
          <div class="member-stat-value ${memberGain >= 0 ? 'text-success' : 'text-danger'}">
            ${formatCurrency(memberGain)}
          </div>
        </div>
      </div>
    `;
        memberGrid.appendChild(card);
    });
}

// ===================================
// Member Details Functions
// ===================================

function viewMemberDetails(memberId) {
    const users = getUsers();
    selectedMember = users.find(m => m.id === memberId);
    if (!selectedMember) return;

    showPage('member-details');
    renderMemberDetails();
}

function renderMemberDetails() {
    if (!selectedMember) return;

    document.getElementById('member-detail-name').textContent = selectedMember.name;
    document.getElementById('member-detail-avatar').textContent = selectedMember.avatar;

    const investments = getInvestments(selectedMember.id);

    // Calculate stats
    let totalInvested = 0;
    let totalCurrent = 0;

    investments.forEach(inv => {
        totalInvested += parseFloat(inv.investedAmount || 0);
        totalCurrent += parseFloat(inv.currentValue || 0);
    });

    const totalGain = totalCurrent - totalInvested;
    const totalGainPercent = calculateGainLoss(totalInvested, totalCurrent);

    document.getElementById('member-total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('member-total-current').textContent = formatCurrency(totalCurrent);
    document.getElementById('member-total-gain').textContent = formatCurrency(totalGain);
    document.getElementById('member-gain-percent').textContent =
        `${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`;

    // Render investments table
    const tbody = document.getElementById('investments-tbody');
    tbody.innerHTML = '';

    if (investments.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-secondary" style="padding: 2rem;">
          No investments yet. Click "Add Investment" to get started.
        </td>
      </tr>
    `;
    } else {
        investments.forEach(inv => {
            const invested = parseFloat(inv.investedAmount || 0);
            const current = parseFloat(inv.currentValue || 0);
            const gain = current - invested;
            const gainPercent = calculateGainLoss(invested, current);

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${inv.name}</td>
        <td><span class="badge" style="background: rgba(147, 51, 234, 0.2); color: var(--primary-light);">${inv.category}</span></td>
        <td>${formatCurrency(invested)}</td>
        <td>${formatCurrency(current)}</td>
        <td class="${gain >= 0 ? 'text-success' : 'text-danger'}">
          ${formatCurrency(gain)}
        </td>
        <td>
          <span class="badge ${gain >= 0 ? 'badge-success' : 'badge-danger'}">
            ${gain >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%
          </span>
        </td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-sm btn-secondary" onclick="editInvestment('${inv.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteInvestment('${inv.id}')">Delete</button>
          </div>
        </td>
      `;
            tbody.appendChild(row);
        });
    }
}

// ===================================
// Investment CRUD Operations
// ===================================

function openAddInvestmentModal() {
    document.getElementById('investment-form').reset();
    document.getElementById('investment-id').value = '';
    document.getElementById('investment-modal-title').textContent = 'Add Investment';
    populateCategorySelect();
    showModal('investment-modal');
}

function populateCategorySelect() {
    const select = document.getElementById('investment-category');
    select.innerHTML = INVESTMENT_CATEGORIES.map(cat =>
        `<option value="${cat}">${cat}</option>`
    ).join('');
}

function saveInvestmentForm(event) {
    event.preventDefault();

    const investmentId = document.getElementById('investment-id').value;
    const investmentData = {
        name: document.getElementById('investment-name').value,
        category: document.getElementById('investment-category').value,
        investedAmount: parseFloat(document.getElementById('investment-amount').value),
        currentValue: parseFloat(document.getElementById('investment-current').value),
        purchaseDate: document.getElementById('investment-date').value,
        notes: document.getElementById('investment-notes').value
    };

    if (investmentId) {
        updateInvestment(selectedMember.id, investmentId, investmentData);
    } else {
        addInvestment(selectedMember.id, investmentData);
    }

    hideModal('investment-modal');
    renderMemberDetails();
}

function editInvestment(investmentId) {
    const investments = getInvestments(selectedMember.id);
    const investment = investments.find(inv => inv.id === investmentId);

    if (!investment) return;

    document.getElementById('investment-id').value = investment.id;
    document.getElementById('investment-name').value = investment.name;
    document.getElementById('investment-category').value = investment.category;
    document.getElementById('investment-amount').value = investment.investedAmount;
    document.getElementById('investment-current').value = investment.currentValue;
    document.getElementById('investment-date').value = investment.purchaseDate;
    document.getElementById('investment-notes').value = investment.notes || '';

    document.getElementById('investment-modal-title').textContent = 'Edit Investment';
    populateCategorySelect();
    showModal('investment-modal');
}

function confirmDeleteInvestment(investmentId) {
    if (confirm('Are you sure you want to delete this investment?')) {
        deleteInvestment(selectedMember.id, investmentId);
        renderMemberDetails();
    }
}

// ===================================
// Data Export/Import
// ===================================

function exportData() {
    const data = {
        users: getUsers(),
        investments: getInvestments(),
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `investment-tracker-backup-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.users && data.investments) {
                    if (confirm('This will replace all existing data. Are you sure?')) {
                        localStorage.setItem('investmentTrackerUsers', JSON.stringify(data.users));
                        localStorage.setItem('investmentTrackerData', JSON.stringify(data.investments));
                        alert('Data imported successfully! Please refresh the page.');
                        location.reload();
                    }
                } else {
                    alert('Invalid data format!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// ===================================
// Event Handlers
// ===================================

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (login(username, password)) {
        // Clear the form fields for security
        document.getElementById('login-form').reset();

        document.getElementById('app-header').classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUser.name;
        showPage('dashboard');
        renderDashboard();
    } else {
        alert('Invalid username or password!');
    }
}

function handleLogout() {
    logout();
}

// ===================================
// Profile Management Functions
// ===================================

function renderProfile() {
    if (!currentUser) return;

    // Get current user data from storage
    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id);

    if (!user) return;

    // Update profile display
    document.getElementById('profile-avatar').textContent = user.avatar || '👤';
    document.getElementById('profile-display-name').textContent = user.name;
    document.getElementById('profile-username').textContent = user.username;

    // Populate form fields
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-avatar-select').value = user.avatar || '👤';

    // Render family members list
    renderFamilyMembers();
}

function saveProfile(event) {
    event.preventDefault();

    const updatedProfile = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        avatar: document.getElementById('profile-avatar-select').value
    };

    // Update user in storage
    updateUserProfile(currentUser.id, updatedProfile);

    // Update current user object
    currentUser = { ...currentUser, ...updatedProfile };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update header display
    document.getElementById('user-name').textContent = currentUser.name;

    // Update profile display
    document.getElementById('profile-display-name').textContent = currentUser.name;
    document.getElementById('profile-avatar').textContent = currentUser.avatar;

    // Refresh family members and dashboard
    renderFamilyMembers();
    renderDashboard();

    // Show success message with visual feedback
    const saveButton = event.target.querySelector('button[type="submit"]');
    const originalText = saveButton.textContent;
    saveButton.textContent = '✓ Profile Saved!';
    saveButton.style.background = 'var(--success)';

    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = '';
    }, 2000);
}

function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate current password
    const hashedCurrent = hashPassword(currentPassword);
    if (hashedCurrent !== currentUser.password) {
        alert('Current password is incorrect!');
        return;
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    // Update password
    const hashedNew = hashPassword(newPassword);
    updateUserProfile(currentUser.id, { password: hashedNew });

    // Update current user
    currentUser.password = hashedNew;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clear form
    document.getElementById('password-form').reset();

    // Show success message with visual feedback
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '✓ Password Changed!';
    submitButton.style.background = 'var(--success)';

    setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.style.background = '';
    }, 2000);
}

function updateUserProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));
    }
}

function renderFamilyMembers() {
    const users = getUsers();
    const allInvestments = getInvestments();
    const container = document.getElementById('family-members-list');

    container.innerHTML = '';

    users.forEach(user => {
        const investments = allInvestments[user.id] || [];
        let totalInvested = 0;
        let totalCurrent = 0;

        investments.forEach(inv => {
            totalInvested += parseFloat(inv.investedAmount || 0);
            totalCurrent += parseFloat(inv.currentValue || 0);
        });

        const isCurrentUser = user.id === currentUser.id;

        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = 'var(--spacing-md)';
        card.innerHTML = `
            <div class="flex-between" style="margin-bottom: var(--spacing-sm);">
                <div class="flex gap-1" style="align-items: center;">
                    <div style="font-size: 2rem;">${user.avatar}</div>
                    <div>
                        <div style="font-weight: 600; font-size: 1.125rem;">${user.name}</div>
                        <div class="text-secondary" style="font-size: 0.875rem;">@${user.username}</div>
                    </div>
                </div>
                ${isCurrentUser ? '<span class="badge" style="background: var(--primary); color: white;">You</span>' : ''}
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm); margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--glass-border);">
                <div>
                    <div class="text-secondary" style="font-size: 0.75rem;">Investments</div>
                    <div style="font-weight: 600; color: var(--primary);">${investments.length}</div>
                </div>
                <div>
                    <div class="text-secondary" style="font-size: 0.75rem;">Portfolio</div>
                    <div style="font-weight: 600; color: var(--secondary);">${formatCurrency(totalCurrent)}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ===================================
// Add Family Member Functions
// ===================================

function openAddFamilyMemberModal() {
    document.getElementById('add-family-form').reset();
    showModal('add-family-modal');
}

function addFamilyMember(event) {
    event.preventDefault();

    const username = document.getElementById('new-member-username').value.toLowerCase();
    const name = document.getElementById('new-member-name').value;
    const password = document.getElementById('new-member-password').value;
    const avatar = document.getElementById('new-member-avatar').value;

    // Check if username already exists
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        alert('Username already exists! Please choose a different username.');
        return;
    }

    // Create new user
    const newUser = {
        id: username,
        username: username,
        password: hashPassword(password),
        name: name,
        avatar: avatar,
        email: '',
        phone: ''
    };

    // Add to users list
    users.push(newUser);
    localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));

    // Initialize empty investments for new user
    const allInvestments = getInvestments();
    allInvestments[username] = [];
    localStorage.setItem('investmentTrackerData', JSON.stringify(allInvestments));

    // Close modal and refresh
    hideModal('add-family-modal');
    renderFamilyMembers();
    renderDashboard();

    alert(`Family member "${name}" added successfully! They can now login with username: ${username}`);
}

// ===================================
// Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();

    // Check if user is already logged in
    if (checkAuth()) {
        document.getElementById('app-header').classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUser.name;
        showPage('dashboard');
        renderDashboard();
    } else {
        document.getElementById('app-header').classList.add('hidden');
        showPage('login');
    }

    // Setup event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
