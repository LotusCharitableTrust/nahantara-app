function renderProfile() {
    let container = document.getElementById('profileArea');
    if (!container) return;
    
    let userPosts = allPosts.filter(p => p.userId === currentUser.id);
    let hasUserStory = hasStory(currentUser.id);
    
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-lg ${hasUserStory ? 'has-story-ring' : ''}" onclick="viewOwnStory()">
                <div class="inner-avatar" onclick="event.stopPropagation(); uploadProfilePicture()">
                    ${currentUser.avatar ? `<img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover;">` : currentUser.username.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="profile-stats">
                <div><div class="stat-num">${userPosts.length}</div><div>posts</div></div>
                <div><div class="stat-num">${currentUser.followers.length}</div><div>followers</div></div>
                <div><div class="stat-num">${currentUser.following.length}</div><div>following</div></div>
            </div>
        </div>
        <div class="edit-btn" onclick="openEditModal()">✏️ Edit Profile & Role</div>
        <div style="padding:0 16px 12px;">
            <strong>${escapeHtml(currentUser.username)}</strong> ${currentUser.role === 'admin' ? '👑 Admin' : '🌾 User'}<br>
            ${escapeHtml(currentUser.bio)}
        </div>
        <div class="grid-3" id="userPostGrid"></div>
    `;
    
    let grid = document.getElementById('userPostGrid');
    if (grid) {
        let userImages = userPosts.filter(p => p.image);
        if (!userImages.length) {
            grid.innerHTML = '<div style="grid-column:span3; text-align:center; padding:20px;">No posts yet</div>';
        } else {
            grid.innerHTML = userImages.map(p => `
                <div class="grid-item" onclick="openFullImage('${p.image}')">
                    <img src="${p.image}">
                </div>
            `).join('');
        }
    }
}

window.openEditModal = () => {
    let modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3>Edit Profile</h3>
            <input id="editName" placeholder="Username" value="${escapeHtml(currentUser.username)}" style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:10px;">
            <input id="editBio" placeholder="Bio" value="${escapeHtml(currentUser.bio)}" style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:10px;">
            <select id="editRole" style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:10px;">
                <option value="user" ${currentUser.role === 'user' ? 'selected' : ''}>🌾 Normal User</option>
                <option value="admin" ${currentUser.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
            </select>
            <div id="codeDiv" style="display:${currentUser.role === 'admin' ? 'block' : 'none'}; margin-bottom:10px;">
                <input id="adminCode" type="password" placeholder="Admin Code (7)" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:10px;">
                <small style="color:gray;">Enter code "7" to become admin</small>
            </div>
            <button onclick="saveProfileEdit()" style="width:100%; padding:10px; background:#0095f6; color:white; border:none; border-radius:10px;">Save</button>
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%; margin-top:8px; padding:10px; background:#efefef; border:none; border-radius:10px;">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    let roleSelect = document.getElementById('editRole');
    let codeDiv = document.getElementById('codeDiv');
    roleSelect.onchange = () => {
        codeDiv.style.display = roleSelect.value === 'admin' ? 'block' : 'none';
    };
};

window.saveProfileEdit = () => {
    let newName = document.getElementById('editName').value.trim();
    let newBio = document.getElementById('editBio').value.trim();
    let newRole = document.getElementById('editRole').value;
    let code = document.getElementById('adminCode')?.value;
    
    if (newRole === 'admin' && code !== '7') {
        showToast("Invalid admin code! Use '7'");
        return;
    }
    
    if (newName) currentUser.username = newName;
    if (newBio) currentUser.bio = newBio;
    currentUser.role = newRole;
    
    let idx = allUsers.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) allUsers[idx] = currentUser;
    saveAll();
    
    document.querySelector('.modal-overlay')?.remove();
    renderProfile();
    if (typeof renderHomeFeed === 'function') renderHomeFeed();
    if (typeof renderStories === 'function') renderStories();
    if (typeof renderAnnouncements === 'function') renderAnnouncements();
    showToast(`Profile updated! Role: ${newRole === 'admin' ? 'Admin' : 'User'}`);
};

window.uploadProfilePicture = () => {
    let inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = (e) => {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = (ev) => {
                currentUser.avatar = ev.target.result;
                let idx = allUsers.findIndex(u => u.id === currentUser.id);
                if (idx !== -1) allUsers[idx] = currentUser;
                saveAll();
                renderProfile();
                if (typeof renderStories === 'function') renderStories();
                if (typeof renderHomeFeed === 'function') renderHomeFeed();
                showToast("Profile picture updated");
            };
            reader.readAsDataURL(file);
        }
    };
    inp.click();
};

window.viewOwnStory = () => {
    if (hasStory(currentUser.id)) {
        viewStory(currentUser.id);
    } else {
        showToast("No story uploaded");
    }
};

renderProfile();