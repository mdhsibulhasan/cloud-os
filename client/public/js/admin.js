// Admin Panel JavaScript - MD.Hasibul Hasan Personal Cloud OS

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
  initAdminNavigation();
});

// Initialize admin navigation
function initAdminNavigation() {
  const navLinks = document.querySelectorAll('.admin-nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      loadAdminView(view);
    });
  });
}

// Load admin view
async function loadAdminView(view) {
  currentView = view;
  
  const views = {
    dashboard: loadAdminDashboard,
    users: loadUsersView,
    files: loadFilesView,
    subjects: loadSubjectsView,
    pending: loadPendingView,
    broadcasts: loadBroadcastsView,
    settings: loadSettingsView
  };
  
  if (views[view]) {
    await views[view]();
  }
}

// Load admin dashboard
async function loadAdminDashboard() {
  try {
    const response = await app.apiRequest('/admin/stats');
    const stats = response.stats;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <h2>Admin Dashboard</h2>
      
      <div class="grid grid-3 mt-lg">
        <div class="stat-card glass-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${stats.users.total}</div>
          <div class="stat-label">Total Users</div>
          <div class="stat-meta text-muted">${stats.users.pending} pending</div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">📁</div>
          <div class="stat-value">${stats.files.total}</div>
          <div class="stat-label">Total Files</div>
          <div class="stat-meta text-muted">${stats.files.pending} pending</div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">💾</div>
          <div class="stat-value">${stats.storage.usedMB}</div>
          <div class="stat-label">Storage (MB)</div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">${stats.subjects}</div>
          <div class="stat-label">Subjects</div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">📖</div>
          <div class="stat-value">${stats.chapters}</div>
          <div class="stat-label">Chapters</div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">📢</div>
          <div class="stat-value">${stats.broadcasts}</div>
          <div class="stat-label">Broadcasts</div>
        </div>
      </div>
    `;
  } catch (error) {
    app.showNotification('Failed to load dashboard', 'error');
  }
}

// Load users view
async function loadUsersView() {
  try {
    const response = await app.apiRequest('/users');
    const users = response.users;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="flex-between mb-lg">
        <h2>User Management</h2>
      </div>
      
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td data-label="User">
                  <div class="flex" style="align-items: center; gap: 0.5rem;">
                    <img src="${user.profilePicture}" alt="${user.username}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    ${user.username}
                  </div>
                </td>
                <td data-label="Email">${user.email}</td>
                <td data-label="Role"><span class="badge">${user.role}</span></td>
                <td data-label="Status">
                  <span class="badge ${user.status === 'approved' ? 'badge-success' : user.status === 'pending' ? 'badge-warning' : 'badge-danger'}">
                    ${user.status}
                  </span>
                </td>
                <td data-label="Joined">${app.formatDate(user.createdAt)}</td>
                <td data-label="Actions">
                  ${user.role !== 'admin' ? `
                    ${user.status === 'pending' ? `
                      <button onclick="approveUser('${user.id}')" class="btn btn-sm btn-primary">Approve</button>
                    ` : ''}
                    <button onclick="editUser('${user.id}')" class="btn btn-sm btn-secondary">Edit</button>
                    <button onclick="deleteUser('${user.id}')" class="btn btn-sm btn-danger">Delete</button>
                  ` : '<span class="text-muted">Admin</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    app.showNotification('Failed to load users', 'error');
  }
}

// Load files view
async function loadFilesView() {
  try {
    const response = await app.apiRequest('/files');
    const files = response.files;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="flex-between mb-lg">
        <h2>File Management</h2>
        <button onclick="app.openModal('upload-modal')" class="btn btn-primary">Upload File</button>
      </div>
      
      <div class="grid grid-3">
        ${files.map(file => `
          <div class="file-card glass-card">
            <img src="${file.thumbnailPath}" alt="${file.filename}" class="file-card-thumb">
            <div class="file-card-info">
              <div class="file-card-name">${file.filename}</div>
              <div class="file-card-meta text-muted">${app.formatFileSize(file.size)}</div>
              <div class="file-card-actions mt-sm">
                <button onclick="deleteFile('${file.id}')" class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    app.showNotification('Failed to load files', 'error');
  }
}

// Load subjects view
async function loadSubjectsView() {
  try {
    const response = await app.apiRequest('/subjects');
    const subjects = response.subjects;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="flex-between mb-lg">
        <h2>Subject Management</h2>
        <button onclick="showCreateSubjectModal()" class="btn btn-primary">Create Subject</button>
      </div>
      
      <div class="grid grid-2">
        ${subjects.map(subject => `
          <div class="subject-card glass-card">
            <h3>${subject.name}</h3>
            <div class="subject-stats text-muted">
              ${subject.chapterCount} chapters • ${subject.fileCount} files
            </div>
            <div class="subject-actions mt-md">
              <button onclick="viewSubject('${subject.id}')" class="btn btn-sm btn-primary">View</button>
              <button onclick="editSubject('${subject.id}', '${subject.name}')" class="btn btn-sm btn-secondary">Edit</button>
              <button onclick="deleteSubject('${subject.id}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    app.showNotification('Failed to load subjects', 'error');
  }
}

// Load pending view
async function loadPendingView() {
  try {
    const response = await app.apiRequest('/files/pending');
    const files = response.files;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <h2>Pending Approvals</h2>
      
      ${files.length === 0 ? '<p class="text-muted mt-lg">No pending files</p>' : `
        <div class="grid grid-3 mt-lg">
          ${files.map(file => `
            <div class="file-card glass-card">
              <img src="${file.thumbnailPath}" alt="${file.filename}" class="file-card-thumb">
              <div class="file-card-info">
                <div class="file-card-name">${file.filename}</div>
                <div class="file-card-meta text-muted">
                  By ${file.uploadedBy}<br>
                  ${app.formatFileSize(file.size)}
                </div>
                <div class="file-card-actions mt-sm">
                  <button onclick="approveFile('${file.id}')" class="btn btn-sm btn-primary">Approve</button>
                  <button onclick="rejectFile('${file.id}')" class="btn btn-sm btn-danger">Reject</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  } catch (error) {
    app.showNotification('Failed to load pending files', 'error');
  }
}

// Load broadcasts view
async function loadBroadcastsView() {
  try {
    const response = await app.apiRequest('/broadcasts');
    const broadcasts = response.broadcasts;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="flex-between mb-lg">
        <h2>Broadcasts</h2>
        <button onclick="showCreateBroadcastModal()" class="btn btn-primary">Create Broadcast</button>
      </div>
      
      <div class="broadcasts-list">
        ${broadcasts.map(broadcast => `
          <div class="broadcast-card glass-card ${broadcast.pinned ? 'pinned' : ''}">
            ${broadcast.pinned ? '<span class="badge">Pinned</span>' : ''}
            <div class="broadcast-message">${broadcast.message}</div>
            <div class="broadcast-meta text-muted mt-sm">${app.formatDate(broadcast.createdAt)}</div>
            <div class="broadcast-actions mt-md">
              <button onclick="togglePin('${broadcast.id}', ${!broadcast.pinned})" class="btn btn-sm btn-secondary">
                ${broadcast.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button onclick="deleteBroadcast('${broadcast.id}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    app.showNotification('Failed to load broadcasts', 'error');
  }
}

// Load settings view
async function loadSettingsView() {
  try {
    const response = await app.apiRequest('/admin/settings');
    const settings = response.settings;
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <h2>Site Settings</h2>
      
      <form id="settings-form" class="mt-lg" style="max-width: 600px;">
        <div class="form-group">
          <label class="form-label">Tagline</label>
          <input type="text" name="tagline" class="form-input" value="${settings.tagline || ''}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Bio (Home Page)</label>
          <textarea name="bio" class="form-textarea" rows="4">${settings.bio || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">About Text</label>
          <textarea name="aboutText" class="form-textarea" rows="6">${settings.aboutText || ''}</textarea>
        </div>
        
        <button type="submit" class="btn btn-primary">Save Settings</button>
      </form>
    `;
    
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
  } catch (error) {
    app.showNotification('Failed to load settings', 'error');
  }
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await app.apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    app.showNotification('Settings saved successfully', 'success');
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Approve user
async function approveUser(userId) {
  try {
    await app.apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
    
    app.showNotification('User approved', 'success');
    loadUsersView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Delete user
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  try {
    await app.apiRequest(`/users/${userId}`, { method: 'DELETE' });
    app.showNotification('User deleted', 'success');
    loadUsersView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Approve file
async function approveFile(fileId) {
  try {
    await app.apiRequest(`/files/approve/${fileId}`, { method: 'PUT' });
    app.showNotification('File approved', 'success');
    loadPendingView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Reject file
async function rejectFile(fileId) {
  if (!confirm('Are you sure you want to reject this file?')) return;
  
  try {
    await app.apiRequest(`/files/reject/${fileId}`, { method: 'PUT' });
    app.showNotification('File rejected', 'success');
    loadPendingView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Show create subject modal
function showCreateSubjectModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3>Create Subject</h3>
      <form id="create-subject-form">
        <div class="form-group">
          <label class="form-label">Subject Name</label>
          <input type="text" name="name" class="form-input" required>
        </div>
        <div class="flex gap-sm">
          <button type="submit" class="btn btn-primary">Create</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await app.apiRequest('/subjects', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      app.showNotification('Subject created', 'success');
      modal.remove();
      loadSubjectsView();
    } catch (error) {
      app.showNotification(error.message, 'error');
    }
  });
}

// Delete subject
async function deleteSubject(subjectId) {
  if (!confirm('This will delete all chapters and files in this subject. Continue?')) return;
  
  try {
    await app.apiRequest(`/subjects/${subjectId}`, { method: 'DELETE' });
    app.showNotification('Subject deleted', 'success');
    loadSubjectsView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Show create broadcast modal
function showCreateBroadcastModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3>Create Broadcast</h3>
      <form id="create-broadcast-form">
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea name="message" class="form-textarea" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" name="pinned" value="true">
            Pin this broadcast
          </label>
        </div>
        <div class="flex gap-sm">
          <button type="submit" class="btn btn-primary">Create</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await app.apiRequest('/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          message: formData.get('message'),
          pinned: formData.get('pinned') === 'true'
        })
      });
      
      app.showNotification('Broadcast created', 'success');
      modal.remove();
      loadBroadcastsView();
    } catch (error) {
      app.showNotification(error.message, 'error');
    }
  });
}

// Delete broadcast
async function deleteBroadcast(broadcastId) {
  if (!confirm('Delete this broadcast?')) return;
  
  try {
    await app.apiRequest(`/broadcasts/${broadcastId}`, { method: 'DELETE' });
    app.showNotification('Broadcast deleted', 'success');
    loadBroadcastsView();
  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Make functions global
window.approveUser = approveUser;
window.deleteUser = deleteUser;
window.approveFile = approveFile;
window.rejectFile = rejectFile;
window.deleteSubject = deleteSubject;
window.showCreateSubjectModal = showCreateSubjectModal;
window.showCreateBroadcastModal = showCreateBroadcastModal;
window.deleteBroadcast = deleteBroadcast;
