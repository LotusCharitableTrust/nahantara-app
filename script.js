// ============ DATA STORAGE ============
let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let messages = JSON.parse(localStorage.getItem('messages') || '{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"ନହନ୍ତରା ବାସୀ","village":"","role":"user"}');
let currentGroup = 'gaon';
let helpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');

// Initialize messages for groups
if (!messages['gaon']) messages['gaon'] = [];
if (!messages['yuva']) messages['yuva'] = [];
if (!messages['mahila']) messages['mahila'] = [];
if (!messages['sabhya']) messages['sabhya'] = [];

// ============ TOAST FUNCTION ============
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ============ TAB NAVIGATION ============
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');
    
    if (tabName === 'gallery') loadGallery();
    if (tabName === 'chat') loadChat();
    if (tabName === 'help') loadHelpRequests();
    updatePostCount();
}

function toggleMenu() {
    showToast("🌾 ନହନ୍ତରା ଗାଁ ଆପ୍ - ମୋ ସ୍ବାଭିମାନ");
}

// ============ POSTS / NEWS FEED ============
function addPost() {
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!content && !imageFile) {
        showToast("⚠️ ଦୟାକରି କିଛି ଲେଖନ୍ତୁ କିମ୍ବା ଫଟୋ ଦିଅନ୍ତୁ");
        return;
    }
    
    const post = {
        id: Date.now(),
        content: content,
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('or-IN'),
        likes: 0,
        comments: []
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            post.media = e.target.result;
            post.mediaType = imageFile.type.startsWith('video') ? 'video' : 'image';
            posts.unshift(post);
            savePosts();
            loadPosts();
            showToast("✅ ପୋଷ୍ଟ ସଫଳତାର ସହ ସେୟାର ହେଲା");
        };
        reader.readAsDataURL(imageFile);
    } else {
        posts.unshift(post);
        savePosts();
        loadPosts();
        showToast("✅ ପୋଷ୍ଟ ସଫଳତାର ସହ ସେୟାର ହେଲା");
    }
    
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
}

function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
    const galleryItems = posts.filter(p => p.media).map(p => p.media);
    localStorage.setItem('gallery', JSON.stringify(galleryItems));
    updatePostCount();
}

function updatePostCount() {
    const countSpan = document.getElementById('postCount');
    if (countSpan) {
        countSpan.textContent = posts.length + " ଟି ପୋଷ୍ଟ";
    }
}

function loadPosts() {
    const feed = document.getElementById('postsFeed');
    if (posts.length === 0) {
        feed.innerHTML = '<div class="empty-state">🌾 କୌଣସି ପୋଷ୍ଟ ନାହିଁ। ପ୍ରଥମେ ପୋଷ୍ଟ କରନ୍ତୁ!</div>';
        return;
    }
    
    feed.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-avatar">${post.userName.charAt(0)}</div>
                <div>
                    <div class="post-name">${post.userName} ${post.userRole === 'admin' ? '👑' : ''}</div>
                    <div class="post-time">${post.timestamp}</div>
                </div>
            </div>
            <div class="post-content">${post.content || ''}</div>
            ${post.media ? (post.mediaType === 'video' ? 
                `<video src="${post.media}" controls class="post-media"></video>` : 
                `<img src="${post.media}" class="post-media" onclick="viewMedia('${post.media}')">`) : ''}
            <div class="post-actions-feed">
                <span onclick="likePost(${post.id})">❤️ ${post.likes}</span>
                <span>💬 ${post.comments.length}</span>
                ${currentUser.role === 'admin' ? `<span onclick="deletePost(${post.id})">🗑️ ଲିଭାନ୍ତୁ</span>` : ''}
            </div>
        </div>
    `).join('');
}

function likePost(postId) {
    posts = posts.map(p => {
        if (p.id === postId) {
            p.likes++;
        }
        return p;
    });
    savePosts();
    loadPosts();
}

function deletePost(postId) {
    if (currentUser.role === 'admin') {
        posts = posts.filter(p => p.id !== postId);
        savePosts();
        loadPosts();
        showToast("🗑️ ପୋଷ୍ଟ ଲିଭାଗଲା");
    }
}

// ============ GALLERY ============
function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryItems = JSON.parse(localStorage.getItem('gallery') || '[]');
    
    if (galleryItems.length === 0) {
        galleryGrid.innerHTML = '<div class="empty-gallery">📸 କୌଣସି ଫଟୋ ନାହିଁ। ପ୍ରଥମେ ପୋଷ୍ଟ କରନ୍ତୁ!</div>';
        return;
    }
    
    galleryGrid.innerHTML = galleryItems.map(item => `
        <img src="${item}" class="gallery-item" onclick="viewMedia('${item}')">
    `).join('');
}

function viewMedia(src) {
    window.open(src, '_blank');
}

// ============ CHAT SYSTEM ============
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
        text: text,
        time: new Date().toLocaleTimeString('or-IN'),
        isAdmin: currentUser.role === 'admin'
    };
    
    messages[currentGroup].push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    input.value = '';
    loadChat();
    showToast("💬 ସନ୍ଦେଶ ପଠାଗଲା");
}

function loadChat() {
    const chatDiv = document.getElementById('chatMessages');
    const groupMessages = messages[currentGroup] || [];
    
    if (groupMessages.length === 0) {
        chatDiv.innerHTML = '<div class="chat-placeholder">💬 ଏଠାରେ ଚାଟ୍ ଆରମ୍ଭ କରନ୍ତୁ...</div>';
        return;
    }
    
    chatDiv.innerHTML = groupMessages.map(msg => `
        <div class="message ${msg.user === currentUser.name ? 'message-self' : ''}">
            <div class="message-user">${msg.user} ${msg.isAdmin ? '👑' : ''}</div>
            <div class="message-text">${msg.text}</div>
            <div style="font-size:10px;color:#888;">${msg.time}</div>
        </div>
    `).join('');
    
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// ============ HELP / SOS ============
function sendSOS() {
    const sosMessage = {
        id: Date.now(),
        type: 'SOS',
        description: '🚨 SOS - ଜରୁରୀକାଳୀନ ସହାୟତା ଆବଶ୍ୟକ!',
        user: currentUser.name,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    };
    helpRequests.unshift(sosMessage);
    saveHelpRequests();
    showToast("🚨 SOS ପଠାଗଲା! ପ୍ରଶାସକଙ୍କୁ ସୂଚନା ଦିଆଗଲା");
    if (currentUser.role === 'admin') {
        loadHelpRequests();
    }
}

function reportCorruption() {
    const desc = document.getElementById('corruptionDesc').value;
    if (!desc) {
        showToast("⚠️ ଦୟାକରି ଦୁର୍ନୀତି ବିଷୟରେ ଲେଖନ୍ତୁ");
        return;
    }
    
    const report = {
        id: Date.now(),
        type: 'ଦୁର୍ନୀତି',
        description: desc,
        user: currentUser.name,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    };
    helpRequests.unshift(report);
    saveHelpRequests();
    document.getElementById('corruptionDesc').value = '';
    showToast("📢 ରିପୋର୍ଟ ଦାଖଲ ହେଲା। ପ୍ରଶାସକ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ନେବେ");
    loadHelpRequests();
}

function requestHelp() {
    const desc = document.getElementById('helpDesc').value;
    if (!desc) {
        showToast("⚠️ ଦୟାକରି ସମସ୍ୟା ବିଷୟରେ ଲେଖନ୍ତୁ");
        return;
    }
    
    const request = {
        id: Date.now(),
        type: 'ସହାୟତା',
        description: desc,
        user: currentUser.name,
        timestamp: new Date().toLocaleString('or-IN'),
        status: 'pending'
    };
    helpRequests.unshift(request);
    saveHelpRequests();
    document.getElementById('helpDesc').value = '';
    showToast("🙏 ସହାୟତା ଅନୁରୋଧ ପଠାଗଲା");
    loadHelpRequests();
}

function saveHelpRequests() {
    localStorage.setItem('helpRequests', JSON.stringify(helpRequests));
}

function loadHelpRequests() {
    const container = document.getElementById('helpRequests');
    if (!container) return;
    
    if (helpRequests.length === 0) {
        container.innerHTML = '<h4>📋 ସହାୟତା ଅନୁରୋଧ</h4><div class="empty-state">କୌଣସି ଅନୁରୋଧ ନାହିଁ</div>';
        return;
    }
    
    container.innerHTML = `
        <h4>📋 ସହାୟତା ଅନୁରୋଧ</h4>
        ${helpRequests.map(req => `
            <div style="background:white;border:1px solid var(--border);padding:14px;margin-bottom:10px;border-radius:12px;">
                <div><strong>${req.type}</strong> <span style="font-size:11px;color:gray;">🕐 ${req.timestamp}</span></div>
                <div style="font-size:13px;color:var(--primary-dark);">👤 ${req.user}</div>
                <div style="margin:8px 0;font-size:13px;">📝 ${req.description}</div>
                <div style="color:${req.status === 'resolved' ? 'green' : 'orange'};font-size:12px;">
                    ${req.status === 'pending' ? '⏳ ଅପେକ୍ଷାରେ' : '✅ ସମାଧାନ ହେଲା'}
                </div>
                ${currentUser.role === 'admin' && req.status === 'pending' ? `
                    <button onclick="resolveHelp(${req.id})" style="margin-top:10px;background:green;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;">✅ ସମାଧାନ କରନ୍ତୁ</button>
                ` : ''}
            </div>
        `).join('')}
    `;
}

function resolveHelp(requestId) {
    if (currentUser.role === 'admin') {
        helpRequests = helpRequests.map(req => 
            req.id === requestId ? {...req, status: 'resolved'} : req
        );
        saveHelpRequests();
        loadHelpRequests();
        showToast("✅ ସହାୟତା ଅନୁରୋଧ ସମାଧାନ ହେଲା");
    }
}

// ============ PROFILE ============
function saveProfile() {
    const name = document.getElementById('userName').value;
    const village = document.getElementById('userVillage').value;
    const role = document.getElementById('userRole').value;
    
    if (name) currentUser.name = name;
    if (village) currentUser.village = village;
    currentUser.role = role;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadProfile();
    showToast("💾 ପ୍ରୋଫାଇଲ୍ ସେଭ୍ ହେଲା");
}

function loadProfile() {
    const nameInput = document.getElementById('userName');
    const villageInput = document.getElementById('userVillage');
    const roleSelect = document.getElementById('userRole');
    
    if (nameInput) nameInput.value = currentUser.name;
    if (villageInput) villageInput.value = currentUser.village || '';
    if (roleSelect) roleSelect.value = currentUser.role;
}

function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'ନହନ୍ତରା ଗାଁ',
            text: 'ମୋ ନହନ୍ତରା - ମୋ ସ୍ବାଭିମାନ ଆପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
            url: window.location.href
        });
    } else {
        showToast("📤 ଏହି ପେଜ୍ ର ଲିଙ୍କ୍ କପି କରି ସେୟାର କରନ୍ତୁ");
    }
}

function clearData() {
    if (confirm("ସମସ୍ତ ଡାଟା ଲିଭିଯିବ! ଆପଣ ନିଶ୍ଚିତ?")) {
        localStorage.clear();
        location.reload();
    }
}

// ============ ANNOUNCEMENT ============
let currentAnnouncement = localStorage.getItem('announcement') || "🌾 ନହନ୍ତରା ଗାଁ ଆପ୍ ରେ ସ୍ଵାଗତମ୍";

function loadAnnouncement() {
    const textDiv = document.getElementById('announcementText');
    if (textDiv) {
        textDiv.innerHTML = currentAnnouncement;
    }
}

function closeAnnouncement() {
    document.getElementById('announcementBanner').style.display = 'none';
}

// ============ INITIALIZATION ============
function init() {
    loadPosts();
    loadProfile();
    loadAnnouncement();
    loadHelpRequests();
    updatePostCount();
    
    // Update time
    setInterval(() => {
        const timeSpan = document.getElementById('time');
        if (timeSpan) {
            timeSpan.innerText = new Date().toLocaleTimeString('or-IN');
        }
    }, 1000);
    
    // Network status
    window.addEventListener('online', () => {
        const statusSpan = document.getElementById('networkStatus');
        if (statusSpan) {
            statusSpan.innerHTML = "📶 ଅନଲାଇନ୍";
            statusSpan.style.color = "#4caf50";
        }
    });
    window.addEventListener('offline', () => {
        const statusSpan = document.getElementById('networkStatus');
        if (statusSpan) {
            statusSpan.innerHTML = "⚠️ ଅଫଲାଇନ୍";
            statusSpan.style.color = "#ff9800";
        }
    });
}

init();