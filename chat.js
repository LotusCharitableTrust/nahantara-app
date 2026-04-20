function renderDM() {
    let d = document.getElementById('dmMessages');
    if (!d) return;
    d.innerHTML = dmMessages.map(m => `
        <div class="message-bubble ${m.senderId === currentUser.id ? 'message-right' : 'message-left'}">
            ${escapeHtml(m.text)}
            <div style="font-size:10px;">${m.time}</div>
        </div>
    `).join('');
    d.scrollTo(0, d.scrollHeight);
}

function renderGroup() {
    let g = document.getElementById('groupMessages');
    if (!g) return;
    g.innerHTML = groupMessages.map(m => `
        <div class="message-bubble ${m.senderId === currentUser.id ? 'message-right' : 'message-left'}">
            <strong>${escapeHtml(m.senderName)}</strong> ${escapeHtml(m.text)}
            <div style="font-size:9px;">${m.time}</div>
        </div>
    `).join('');
    g.scrollTo(0, g.scrollHeight);
}

window.sendDM = () => {
    let inp = document.getElementById('dmInput');
    if (inp && inp.value.trim()) {
        dmMessages.push({
            senderId: currentUser.id,
            senderName: currentUser.username,
            text: inp.value,
            time: new Date().toLocaleTimeString()
        });
        saveAll();
        renderDM();
        inp.value = '';
    }
};

window.sendGroupMsg = () => {
    let inp = document.getElementById('groupInput');
    if (inp && inp.value.trim()) {
        groupMessages.push({
            senderId: currentUser.id,
            senderName: currentUser.username,
            text: inp.value,
            time: new Date().toLocaleTimeString()
        });
        saveAll();
        renderGroup();
        inp.value = '';
    }
};

function initChatTabs() {
    let dmBtn = document.getElementById('dmTab');
    let grpBtn = document.getElementById('groupTab');
    if (dmBtn && grpBtn) {
        dmBtn.onclick = () => {
            document.getElementById('dmPanel').style.display = 'block';
            document.getElementById('groupPanel').style.display = 'none';
            renderDM();
        };
        grpBtn.onclick = () => {
            document.getElementById('dmPanel').style.display = 'none';
            document.getElementById('groupPanel').style.display = 'block';
            renderGroup();
        };
    }
}

renderDM();
renderGroup();
initChatTabs();