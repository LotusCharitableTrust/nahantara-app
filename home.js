// ========== STORIES ==========
function renderStories() {
    let container = document.getElementById('storiesList');
    if (!container) return;
    let users = allUsers.filter(u => u.id !== currentUser.id);
    let ownStoryExist = hasStory(currentUser.id);
    
    let html = `<div class="story ${ownStoryExist ? 'has-story' : ''}" onclick="uploadStory()">
        <div class="story-ring"><div class="story-avatar">✚</div></div>
        <span>Your Story</span>
    </div>`;
    
    users.forEach(u => {
        let has = hasStory(u.id);
        let isFollowing = currentUser.following.includes(u.id);
        html += `<div class="story ${has ? 'has-story' : ''}" onclick="viewStory('${u.id}')">
            <div class="story-ring"><div class="story-avatar">${u.avatar ? `<img src="${u.avatar}">` : u.username.charAt(0).toUpperCase()}</div></div>
            <span>${u.username.slice(0, 10)}</span>
        </div>`;
    });
    container.innerHTML = html;
}

function uploadStory() {
    let inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = e => {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = ev => {
                storiesData.push({ 
                    id: Date.now(), 
                    userId: currentUser.id, 
                    username: currentUser.username, 
                    image: ev.target.result, 
                    timestamp: Date.now() 
                });
                saveAll();
                renderStories();
                if (typeof renderProfile === 'function') renderProfile();
                showToast("📸 Story uploaded! (24hr auto-delete)");
            };
            reader.readAsDataURL(file);
        }
    };
    inp.click();
}

function viewStory(userId) {
    let stories = storiesData.filter(s => s.userId === userId).sort((a, b) => a.timestamp - b.timestamp);
    if (!stories.length) { showToast("No stories"); return; }
    
    let idx = 0;
    let modal = document.createElement('div');
    modal.className = 'story-viewer';
    let img = document.createElement('img');
    img.className = 'story-img';
    
    let close = document.createElement('div');
    close.innerText = '✕';
    close.style.cssText = 'position:absolute; top:20px; right:20px; color:white; font-size:32px; cursor:pointer; z-index:2001;';
    close.onclick = () => modal.remove();
    
    let update = () => img.src = stories[idx].image;
    update();
    
    modal.append(img, close);
    document.body.appendChild(modal);
    modal.onclick = () => modal.remove();
}

// ========== POST FUNCTIONS ==========
function toggleLike(postId) {
    let post = allPosts.find(p => p.id == postId);
    if (post) {
        if (post.likes.includes(currentUser.id)) {
            post.likes = post.likes.filter(id => id !== currentUser.id);
        } else {
            post.likes.push(currentUser.id);
        }
        saveAll();
        renderHomeFeed();
    }
}

function addComment(postId, text) {
    if (!text.trim()) return;
    let post = allPosts.find(p => p.id == postId);
    if (post) {
        post.comments.push({ 
            userId: currentUser.id, 
            username: currentUser.username, 
            text: text,
            time: Date.now()
        });
        saveAll();
        renderHomeFeed();
    }
}

function showLikesModal(postId) {
    let post = allPosts.find(p => p.id == postId);
    if (!post || !post.likes.length) { showToast("No likes yet"); return; }
    let likers = post.likes.map(uid => allUsers.find(u => u.id === uid)).filter(u => u);
    let modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal-card">
        <h3>❤️ Likes (${post.likes.length})</h3>
        ${likers.map(u => `<div style="padding:8px; display:flex; align-items:center; gap:10px;">
            <div class="post-avatar" style="width:32px;height:32px;">${u.avatar ? `<img src="${u.avatar}" style="width:100%;">` : u.username.charAt(0)}</div>
            <span>${escapeHtml(u.username)}</span>
        </div>`).join('')}
        <button onclick="this.parentElement.parentElement.remove()" style="margin-top:12px; width:100%; padding:8px; background:#efefef; border:none; border-radius:10px;">Close</button>
    </div>`;
    document.body.appendChild(modal);
}

function editPost(postId) {
    let post = allPosts.find(p => p.id == postId);
    if (post && post.userId === currentUser.id) {
        let newText = prompt("Edit caption:", post.text);
        if (newText !== null) {
            post.text = newText;
            saveAll();
            renderHomeFeed();
            showToast("Post updated");
        }
    }
}

function deletePost(postId) {
    if (confirm("Delete this post?")) {
        allPosts = allPosts.filter(p => p.id !== postId);
        saveAll();
        renderHomeFeed();
        if (typeof renderProfile === 'function') renderProfile();
        if (typeof renderExploreGrid === 'function') renderExploreGrid();
        showToast("Post deleted");
    }
}

function showPostMenu(postId, event) {
    event.stopPropagation();
    let post = allPosts.find(p => p.id == postId);
    if (!post || post.userId !== currentUser.id) return;
    
    let menu = document.createElement('div');
    menu.className = 'modal-overlay';
    menu.innerHTML = `<div class="modal-card">
        <h3>Post Options</h3>
        <button onclick="editPost(${postId}); this.parentElement.parentElement.remove();" style="width:100%; padding:10px; margin:5px 0; border:none; border-radius:10px;">✏️ Edit</button>
        <button onclick="deletePost(${postId}); this.parentElement.parentElement.remove();" style="width:100%; padding:10px; margin:5px 0; border:none; border-radius:10px; color:#ed4956;">🗑️ Delete</button>
        <button onclick="this.parentElement.parentElement.remove()" style="width:100%; padding:10px; margin:5px 0; background:#efefef; border:none; border-radius:10px;">Cancel</button>
    </div>`;
    document.body.appendChild(menu);
}

function renderHomeFeed() {
    let feedDiv = document.getElementById('feedContainer');
    if (!feedDiv) return;
    
    if (!allPosts.length) {
        feedDiv.innerHTML = '<div style="text-align:center;padding:40px;">🌾 No posts yet. Create first post!</div>';
        return;
    }
    
    feedDiv.innerHTML = allPosts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-user" onclick="viewUserProfile('${post.userId}')">
                    <div class="post-avatar">${post.username.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="post-name">${escapeHtml(post.username)}${post.userId === currentUser.id ? ' (you)' : ''}</div>
                        <div class="post-time">${post.timeAgo || new Date(post.timestamp).toLocaleString()}</div>
                    </div>
                </div>
                ${post.userId === currentUser.id ? `<div class="menu-dots" style="cursor:pointer; font-size:20px; padding:0 8px;" onclick="showPostMenu(${post.id}, event)">⋯</div>` : ''}
            </div>
            ${post.image ? `<img src="${post.image}" class="post-image" onclick="openFullImage('${post.image}')">` : ''}
            <div class="post-actions">
                <div class="action-btn ${post.likes.includes(currentUser.id) ? 'liked' : ''}" onclick="toggleLike(${post.id})">❤️</div>
                <div class="action-btn" onclick="toggleCommentBox(${post.id})">💬</div>
            </div>
            <div class="post-likes" onclick="showLikesModal(${post.id})">❤️ ${post.likes.length} likes</div>
            <div class="post-caption"><strong>${escapeHtml(post.username)}</strong> ${escapeHtml(post.text || '')}</div>
            <div id="commentBox-${post.id}" style="display:none; padding:8px 12px;">
                <div>${post.comments.map(c => `<div><strong>${escapeHtml(c.username)}</strong> ${escapeHtml(c.text)}</div>`).join('')}</div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <input id="commentInput-${post.id}" placeholder="Add comment..." style="flex:1; padding:8px; border-radius:20px; border:0.5px solid #ccc;">
                    <button onclick="submitComment(${post.id})">Post</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.submitComment = (postId) => {
    let inp = document.getElementById(`commentInput-${postId}`);
    if (inp && inp.value.trim()) {
        addComment(postId, inp.value);
        inp.value = '';
    }
};

window.toggleCommentBox = (id) => {
    let box = document.getElementById(`commentBox-${id}`);
    if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
};

window.openFullImage = (src) => {
    let modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); z-index:2000; display:flex; align-items:center; justify-content:center;';
    modal.innerHTML = `<img src="${src}" style="max-width:90%; max-height:80%;"><div style="position:absolute; top:30px; right:30px; color:white; font-size:40px; cursor:pointer;" onclick="this.parentElement.remove()">✕</div>`;
    document.body.appendChild(modal);
};

// ========== PULL TO REFRESH WITH SPINNER ==========
let refreshStartY = 0;
let isRefreshing = false;
const swipeArea = document.getElementById('swipeArea');

if (swipeArea) {
    swipeArea.addEventListener('touchstart', (e) => {
        if (swipeArea.scrollTop === 0) refreshStartY = e.touches[0].clientY;
    });
    
    swipeArea.addEventListener('touchmove', (e) => {
        if (swipeArea.scrollTop === 0 && e.touches[0].clientY - refreshStartY > 60 && !isRefreshing) {
            isRefreshing = true;
            let loader = document.createElement('div');
            loader.className = 'refresh-loader';
            loader.innerHTML = '⟳ Refreshing...';
            loader.style.cssText = 'text-align:center; padding:10px; color:#0095f6; font-size:14px;';
            swipeArea.prepend(loader);
            
            setTimeout(() => {
                renderHomeFeed();
                renderStories();
                if (typeof renderProfile === 'function') renderProfile();
                if (typeof renderAnnouncements === 'function') renderAnnouncements();
                if (typeof renderExploreGrid === 'function') renderExploreGrid();
                loader.remove();
                isRefreshing = false;
                showToast("✨ Updated!");
            }, 800);
        }
    });
}

// ========== VIEW USER PROFILE (Follow/Unfollow) ==========
window.viewUserProfile = (userId) => {
    let targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser || targetUser.id === currentUser.id) return;
    
    let isFollowing = currentUser.following.includes(targetUser.id);
    let action = confirm(`${targetUser.username}\n${isFollowing ? 'Unfollow?' : 'Follow?'}`);
    
    if (action) {
        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id !== targetUser.id);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
            showToast(`Unfollowed ${targetUser.username}`);
        } else {
            currentUser.following.push(targetUser.id);
            targetUser.followers.push(currentUser.id);
            showToast(`Following ${targetUser.username}`);
        }
        let idx = allUsers.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) allUsers[idx] = currentUser;
        let tIdx = allUsers.findIndex(u => u.id === targetUser.id);
        if (tIdx !== -1) allUsers[tIdx] = targetUser;
        saveAll();
        renderHomeFeed();
        if (typeof renderProfile === 'function') renderProfile();
        renderStories();
    }
};

// ========== EXPLORE GRID ==========
window.renderExploreGrid = () => {
    let gridDiv = document.getElementById('exploreGrid');
    if (gridDiv) {
        let imgPosts = allPosts.filter(p => p.image);
        if (!imgPosts.length) {
            gridDiv.innerHTML = '<div style="grid-column:span3; text-align:center; padding:40px;">📸 No media yet</div>';
        } else {
            gridDiv.innerHTML = imgPosts.map(p => `<div class="grid-item" onclick="openFullImage('${p.image}')"><img src="${p.image}"></div>`).join('');
        }
    }
};

// Initial render
renderHomeFeed();
renderStories();