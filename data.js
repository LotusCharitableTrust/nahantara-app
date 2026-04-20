// ========== DATA & AUTH ==========
let allUsers = JSON.parse(localStorage.getItem('nahantara_users')) || [];
let currentUserId = localStorage.getItem('nahantara_currentId');

if (!allUsers.length || !currentUserId) {
    let defaultUser = { 
        id: 'user_' + Date.now(), 
        username: 'Villager', 
        bio: '🌾 My Pride', 
        avatar: null, 
        followers: [], 
        following: [], 
        role: 'user' 
    };
    allUsers = [defaultUser];
    currentUserId = defaultUser.id;
    localStorage.setItem('nahantara_users', JSON.stringify(allUsers));
    localStorage.setItem('nahantara_currentId', currentUserId);
}

let currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0];
if (!currentUser.role) currentUser.role = 'user';

let allPosts = JSON.parse(localStorage.getItem('nahantara_posts')) || [];
let storiesData = JSON.parse(localStorage.getItem('nahantara_stories')) || [];
let announcements = JSON.parse(localStorage.getItem('nahantara_announcements')) || [];
let dmMessages = JSON.parse(localStorage.getItem('nahantara_dm')) || [];
let groupMessages = JSON.parse(localStorage.getItem('nahantara_group')) || [];

function saveAll() {
    localStorage.setItem('nahantara_users', JSON.stringify(allUsers));
    localStorage.setItem('nahantara_posts', JSON.stringify(allPosts));
    localStorage.setItem('nahantara_stories', JSON.stringify(storiesData));
    localStorage.setItem('nahantara_announcements', JSON.stringify(announcements));
    localStorage.setItem('nahantara_dm', JSON.stringify(dmMessages));
    localStorage.setItem('nahantara_group', JSON.stringify(groupMessages));
    localStorage.setItem('nahantara_currentId', currentUserId);
}

function showToast(msg) {
    let t = document.getElementById('toastMsg');
    if (!t) return;
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); 
}

function hasStory(userId) { 
    return storiesData.some(s => s.userId === userId); 
}

// Clean expired stories (24 hours)
function cleanExpiredStories() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let changed = false;
    storiesData = storiesData.filter(story => {
        if (now - story.timestamp > oneDay) { changed = true; return false; }
        return true;
    });
    if (changed) { saveAll(); }
}

// Auto clean every hour
setInterval(cleanExpiredStories, 60 * 60 * 1000);
cleanExpiredStories();