function renderAnnouncements() {
    let cont = document.getElementById('announcementsList');
    if (!cont) return;
    
    if (!announcements.length) {
        cont.innerHTML = '<div style="padding:20px; text-align:center; color:gray;">📭 No announcements yet</div>';
    } else {
        cont.innerHTML = announcements.map(a => `
            <div class="announcement-card">
                <div class="admin-badge">👑 ${escapeHtml(a.adminName)} (Admin)</div>
                <div style="margin:8px 0;">${escapeHtml(a.text)}</div>
                <div style="font-size:10px; color:gray;">${new Date(a.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    let panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
}

window.postAnnouncement = () => {
    if (currentUser.role !== 'admin') {
        showToast("Only admin can post announcements");
        return;
    }
    let text = document.getElementById('announceText')?.value.trim();
    if (!text) {
        showToast("Write announcement first");
        return;
    }
    announcements.unshift({
        id: Date.now(),
        adminId: currentUser.id,
        adminName: currentUser.username,
        text: text,
        timestamp: Date.now()
    });
    saveAll();
    renderAnnouncements();
    document.getElementById('announceText').value = '';
    showToast("📢 Announcement posted!");
};

renderAnnouncements();