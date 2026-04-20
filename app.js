// ========== SWIPE NAVIGATION (4 PAGES) ==========
let currentPage = 0;
const track = document.getElementById('swipeTrack');
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');

function goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    currentPage = pageIndex;
    if (track) track.style.transform = `translateX(-${currentPage * 100}%)`;
    
    navItems.forEach((item, i) => {
        if (i === currentPage) item.classList.add('active');
        else item.classList.remove('active');
    });
    
    // Refresh content when page changes
    if (currentPage === 0) {
        if (typeof renderHomeFeed === 'function') renderHomeFeed();
        if (typeof renderStories === 'function') renderStories();
    }
    if (currentPage === 1 && typeof renderAnnouncements === 'function') renderAnnouncements();
    if (currentPage === 2) {
        if (typeof renderDM === 'function') renderDM();
        if (typeof renderGroup === 'function') renderGroup();
    }
    if (currentPage === 3 && typeof renderProfile === 'function') renderProfile();
}

// Bottom nav click
navItems.forEach((item, idx) => {
    item.addEventListener('click', () => goToPage(idx));
});

// Touch swipe
let touchStartX = 0;
let touchEndX = 0;
const container = document.getElementById('swipeContainer');

if (container) {
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentPage > 0) goToPage(currentPage - 1);
            else if (diff < 0 && currentPage < pages.length - 1) goToPage(currentPage + 1);
        }
    });
}

// Pull to refresh with spinner
let refreshStartY = 0;
let isRefreshing = false;
const swipeArea = document.getElementById('swipeContainer');

if (swipeArea) {
    swipeArea.addEventListener('touchstart', (e) => {
        if (swipeArea.scrollTop === 0) refreshStartY = e.touches[0].clientY;
    });
    
    swipeArea.addEventListener('touchmove', (e) => {
        if (swipeArea.scrollTop === 0 && e.touches[0].clientY - refreshStartY > 60 && !isRefreshing && currentPage === 0) {
            isRefreshing = true;
            let loader = document.createElement('div');
            loader.className = 'refresh-loader';
            loader.innerHTML = '⟳ Refreshing...';
            document.querySelector('.page-home').prepend(loader);
            
            setTimeout(() => {
                if (typeof renderHomeFeed === 'function') renderHomeFeed();
                if (typeof renderStories === 'function') renderStories();
                if (typeof renderProfile === 'function') renderProfile();
                loader.remove();
                isRefreshing = false;
                showToast("✨ Updated!");
            }, 800);
        }
    });
}

// Floating create post button
let fab = document.createElement('div');
fab.innerHTML = '✚';
fab.style.cssText = 'position:fixed; bottom:80px; right:16px; background:#0095f6; color:white; width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 4px 12px rgba(0,0,0,0.2); cursor:pointer; z-index:200;';
fab.onclick = () => {
    let caption = prompt("📝 Write caption (optional):");
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = (ev) => {
                let newPost = {
                    id: Date.now(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    text: caption || '',
                    image: ev.target.result,
                    likes: [],
                    comments: [],
                    timestamp: Date.now(),
                    timeAgo: new Date().toLocaleString()
                };
                allPosts.unshift(newPost);
                saveAll();
                if (typeof renderHomeFeed === 'function') renderHomeFeed();
                if (typeof renderProfile === 'function') renderProfile();
                showToast("✅ Posted!");
            };
            reader.readAsDataURL(file);
        } else {
            let newPost = {
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                text: caption || '',
                image: null,
                likes: [],
                comments: [],
                timestamp: Date.now(),
                timeAgo: new Date().toLocaleString()
            };
            allPosts.unshift(newPost);
            saveAll();
            if (typeof renderHomeFeed === 'function') renderHomeFeed();
            if (typeof renderProfile === 'function') renderProfile();
            showToast("✅ Posted!");
        }
    };
    fileInput.click();
};
document.querySelector('.app').appendChild(fab);

// Initialize first page
goToPage(0);