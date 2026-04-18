// ============ CURRENT USER ============
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '{}');
let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let messages = JSON.parse(localStorage.getItem('messages') || '{"gaon":[],"yuva":[],"mahila":[]}');
let helpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');

// ============ INITIALIZATION ============
function init() {
    // Check if user is logged in
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId && users[savedUserId]) {
        currentUser = users[savedUserId];
    } else {
        // Create new user
        const userId = 'user_' + Date.now();
        currentUser = {
            id: userId,
            name: 'ନହନ୍ତରା ବାସୀ',
            village: '',
            role: 'user',
            avatar: null,
            likedPosts: []
        };
        users[userId] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUserId', userId);
    }
    
    loadProfile();
    loadPosts();
    loadChat();
    loadHelpRequests();
    setupNavigation();
    updateStats();
}

// ============ NAVIGATION ============
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
        });
    });
}

// ============ PROFILE ============
function updateProfilePicture(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.avatar = e.target.result;
            users[currentUser.id] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            loadProfile();
            showToast('✅ ପ୍ରୋଫାଇଲ୍ ଫଟୋ ଅପଡେଟ୍ ହେଲା');
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const village = document.getElementById('profileVillage').value;
    const role = document.getElementById('profileRole').value;
    
    if (name) currentUser.name = name;
    if (village) currentUser.village = village;
    currentUser.role = role;
    
    users[currentUser.id] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    loadProfile();
    loadPosts();
    showToast('💾 ପ୍ରୋଫାଇଲ୍ ସେଭ୍ ହେଲା');
}

function loadProfile() {
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileVillage').value = currentUser.village || '';
    document.getElementById('profileRole').value = currentUser.role || 'user';
    
    const avatarImg = document.getElementById('profileAvatar');
    if (currentUser.avatar) {
        avatarImg.src = currentUser.avatar;
    }
    
    const smallAvatar = document.getElementById('currentUserAvatar');
    if (smallAvatar && currentUser.avatar) {
        smallAvatar.src = currentUser.avatar;
    }
}

function logout() {
    localStorage.removeItem('currentUserId');
    location.reload();
}

// ============ POSTS (with unique likes) ============
function createPost() {
    const content = document.getElementById('postInput').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!content && !imageFile) {
        showToast('⚠️ କିଛି ଲେଖନ୍ତୁ କିମ୍ବା ଫଟୋ ଦିଅନ୍ତୁ');
        return;
    }
    
    const post = {
        id: Date.now(),
        content: content,
        userName: currentUser.name,
        userId: currentUser.id,
        userAvatar: currentUser.avatar,
        timestamp: new Date().toLocaleString('or-IN'),
        likes: [],
        comments: []
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            post.media = e.target.result;
            post.mediaType = imageFile.type.startsWith('video') ? 'video' : 'image';
            posts.unshift(post);
            savePosts();
        };
        reader.readAsDataURL(imageFile);
    } else {
        posts.unshift(post);
        savePosts();
    }
    
    document.getElementById('postInput').value = '';
    document.getElementById('postImage').value = '';
    showToast('✅ ପୋଷ୍ଟ ହେଲା');
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const hasLiked = post.likes.includes(currentUser.id);
    
    if (hasLiked) {
        post.likes = post.likes.filter(id => id !== currentUser.id);
        showToast('❤️ ଲାଇକ୍ ହଟାଗଲା');
    } else {
        post.likes.push(currentUser.id);
        showToast('👍 ଲାଇକ୍ କଲେ');
        
        // Update user's liked posts count
        if (!currentUser.likedPosts) currentUser.likedPosts = [];
        currentUser.likedPosts.push(postId);
        users[currentUser.id] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    savePosts();
    loadPosts();
    updateStats();
}

function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
    updateStats();
}

function loadPosts() {
    const feed = document.getElementById('postsFeed');
    const grid = document.getElementById('allPostsGrid');
    
    if (posts.length === 0) {
        feed.innerHTML = '<div class="empty-state">🌾 କୌଣସି ପୋଷ୍ଟ ନାହିଁ</div>';
        if (grid) grid.innerHTML = '<div class="empty-state">🌾 କୌଣସି ପୋଷ୍ଟ ନାହିଁ</div>';
        return;
    }
    
    // Feed
    feed.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <img class="post-avatar" src="${post.userAvatar || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%231a8e3c%27%3E%3Cpath d=%27M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%27/%3E%3C/svg%3E'}">
                <div>
                    <div class="post-name">${post.userName} ${post.userId === currentUser.id ? '(ଆପଣ)' : ''}</div>
                    <div class="post-time">${post.timestamp}</div>
                </div>
            </div>
            <div class="post-content">${post.content || ''}</div>
            ${post.media ? (post.mediaType === 'video' ? 
                `<video src="${post.media}" controls class="post-media"></video>` : 
                `<img src="${post.media}" class="post-media">`) : ''}
            <div class="post-actions">
                <span onclick="toggleLike(${post.id})" class="${post.likes.includes(currentUser.id) ? 'active' : ''}">
                    ❤️ ${post.likes.length}
                </span>
                <span>💬 ${post.comments.length}</span>
                ${currentUser.role === 'admin' || post.userId === currentUser.id ? 
                    `<span onclick="deletePost(${post.id})">🗑️</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Grid view
    const mediaPosts = posts.filter(p => p.media);
    if (grid) {
        if (mediaPosts.length === 0) {
            grid.innerHTML = '<div class="empty-state">📸 କୌଣସି ଫଟୋ/ଭିଡିଓ ନାହିଁ</div>';
        } else {
            grid.innerHTML = mediaPosts.map(post => `
                <img src="${post.media}" class="post-grid-item" onclick="viewMedia('${post.media}')">
            `).join('');
        }
    }
}

function deletePost(postId) {
    if (currentUser.role === 'admin' || posts.find(p => p.id === postId)?.userId === currentUser.id) {
        posts = posts.filter(p => p.id !== postId);
        savePosts();
        loadPosts();
        showToast('🗑️ ପୋଷ୍ଟ ଲିଭାଗଲା');
    }
}

function viewMedia(src) {
    window.open(src, '_blank');
}

// ============ CHAT ============
let currentGroup = 'gaon';

function changeGroup() {
    currentGroup = document.getElementById('groupSelect').value;
    loadChat();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    const message = {
        id: Date.now(),
        user: currentUser.name,
        userId: currentUser.id,
        text: text,
        time: new Date().toLocaleTimeString('or-IN')
    };
    
    messages[currentGroup].push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    input.value = '';
    loadChat();
}

function loadChat() {
    const chatDiv = document.getElementById('chatMessages');
    const groupMessages = messages[currentGroup] || [];
    
    if (groupMessages.length === 0) {
        chatDiv.innerHTML = '<div class="empty-state">💬 ଚାଟ୍ ଆରମ୍ଭ କରନ୍ତୁ</div>';
        return;
    }
    
    chatDiv.innerHTML = groupMessages.map(msg => `
        <div class="message ${msg.userId === currentUser.id ? 'message-self' : ''}">
            <div class="message-user">${msg.user}</div>
            <div class="message-text">${msg.text}</div>
            <div style="font-size:10px;color:#888;">${msg.time}</div>
        </div>
    `).join('');
    
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// ============ SOS & HELP ============
function sendSOS() {
    const sos = {
        id: Date.now(),
        type: 'SOS',
        user: currentUser.name,
        userId: currentUser.id,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    };
    helpRequests.unshift(sos);
    saveHelpRequests();
    showToast('🚨 SOS ପଠାଗଲା! ପ୍ରଶାସକଙ୍କୁ ସୂଚନା ଦିଆଗଲା');
}

function reportCorruption() {
    const desc = document.getElementById('corruptionDesc').value;
    if (!desc) { showToast('⚠️ ବିବରଣୀ ଲେଖନ୍ତୁ'); return; }
    
    helpRequests.unshift({
        id: Date.now(),
        type: 'ଦୁର୍ନୀତି',
        description: desc,
        user: currentUser.name,
        userId: currentUser.id,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    });
    saveHelpRequests();
    document.getElementById('corruptionDesc').value = '';
    showToast('📢 ରିପୋର୍ଟ ଦାଖଲ ହେଲା');
}

function requestHelp() {
    const desc = document.getElementById('helpDesc').value;
    if (!desc) { showToast('⚠️ ସମସ୍ୟା ଲେଖନ୍ତୁ'); return; }
    
    helpRequests.unshift({
        id: Date.now(),
        type: 'ସହାୟତା',
        description: desc,
        user: currentUser.name,
        userId: currentUser.id,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    });
    saveHelpRequests();
    document.getElementById('helpDesc').value = '';
    showToast('🙏 ସହାୟତା ଅନୁରୋଧ ପଠାଗଲା');
}

function saveHelpRequests() {
    localStorage.setItem('helpRequests', JSON.stringify(helpRequests));
    loadHelpRequests();
}

function loadHelpRequests() {
    const container = document.getElementById('helpRequestsList');
    if (!container) return;
    
    const userRequests = helpRequests.filter(r => r.userId === currentUser.id || currentUser.role === 'admin');
    
    if (userRequests.length === 0) {
        container.innerHTML = '<div class="empty-state">📋 କୌଣସି ଅନୁରୋଧ ନାହିଁ</div>';
        return;
    }
    
    container.innerHTML = userRequests.map(req => `
        <div class="help-section" style="margin-bottom:10px;">
            <div><strong>${req.type}</strong> 🕐 ${req.timestamp}</div>
            <div>👤 ${req.user}</div>
            ${req.description ? `<div>📝 ${req.description}</div>` : ''}
            <div style="color:${req.status === 'resolved' ? 'green' : 'orange'}">
                ${req.status === 'pending' ? '⏳ ଅପେକ୍ଷାରେ' : '✅ ସମାଧାନ'}
            </div>
            ${currentUser.role === 'admin' && req.status === 'pending' ? 
                `<button onclick="resolveHelp(${req.id})" style="margin-top:8px;">✅ ସମାଧାନ</button>` : ''}
        </div>
    `).join('');
}

function resolveHelp(id) {
    helpRequests = helpRequests.map(r => r.id === id ? {...r, status: 'resolved'} : r);
    saveHelpRequests();
    showToast('✅ ସମାଧାନ ହେଲା');
}

// ============ UTILITIES ============
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function updateStats() {
    document.getElementById('postCount').textContent = posts.filter(p => p.userId === currentUser.id).length;
    document.getElementById('likesGivenCount').textContent = currentUser.likedPosts?.length || 0;
}

function closeAnnouncement() {
    document.getElementById('announcementBanner').style.display = 'none';
}

function showNotifications() {
    showToast('🔔 ନୋଟିଫିକେସନ୍: ଏବେ କୌଣସି ନୂଆ ନାହିଁ');
}

// Start the app
init();