// -------------------- USERS & AUTH --------------------
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ----------- LOGIN & SIGNUP ----------
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if(!name || !email || !password) { alert('All fields are required'); return; }

    if(users.find(u => u.email === email)) {
        alert('Email already exists'); 
        return; 
    }

    users.push({name, email, password});
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign up successful! Please login.');
    window.location.href = 'index.html';
});

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const user = users.find(u => u.email === email && u.password === password);
    if(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'chat.html';
    } else {
        alert('Invalid credentials');
    }
});

// -------------------- CHAT DASHBOARD --------------------
let decisions = JSON.parse(localStorage.getItem('decisions')) || [];
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// -------------------- RENDER FUNCTIONS --------------------
function renderDecisions() {
    const decisionList = document.getElementById('decisionList');
    if(!decisionList) return;
    decisionList.innerHTML = '';

    decisions.forEach((d,i) => {
        const div = document.createElement('div');
        div.className = 'decision-item';
        div.innerHTML = `<strong>Decision ${i+1}:</strong> ${d.text}<br>
                         <em>Constraints:</em> ${d.constraints}`;
        decisionList.appendChild(div);
    });

    // Scroll to bottom to show latest decision
    decisionList.scrollTop = decisionList.scrollHeight;
}

function renderChat() {
    const chatDiv = document.getElementById('chatMessages');
    if(!chatDiv) return;
    chatDiv.innerHTML = '';

    chatHistory.forEach(m => {
        const div = document.createElement('div');
        div.className = 'message ' + (m.user ? 'user' : 'bot');
        div.textContent = m.text;
        chatDiv.appendChild(div);
    });

    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// -------------------- CHAT HISTORY (LEFT SIDEBAR) --------------------
function renderChatHistory() {
    const historyDiv = document.getElementById('chatHistory');
    if(!historyDiv) return;
    historyDiv.innerHTML = '';

    chatHistory.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'chat-history-item';
        div.textContent = m.text;
        div.onclick = () => {
            chatHistory = chatHistory.slice(0, i+1);
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            renderChat();
        };
        historyDiv.appendChild(div);
    });
}

// -------------------- CHAT FUNCTIONS --------------------
function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if(!msg) return;

    // Save user message
    chatHistory.push({text: msg, user: true});
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    // Bot response
    const botReply = processMessage(msg);
    chatHistory.push({text: botReply, user: false});
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    renderChat();
    renderDecisions();
    renderChatHistory();
    input.value = '';
}

function newChat() {
    chatHistory = [];
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    renderChat();
    renderChatHistory();
}

// -------------------- DECISION CAPTURE FUNCTIONS --------------------
function toggleCaptureForm() {
    const form = document.getElementById('captureForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveDecision() {
    const text = document.getElementById('decisionText').value.trim();
    const reason = document.getElementById('decisionReason').value.trim();

    if (!text) { alert('Please enter a decision'); return; }

    // Save decision (no suggestions)
    decisions.push({
        text,
        constraints: reason || 'None'
    });
    localStorage.setItem('decisions', JSON.stringify(decisions));

    // Clear form
    document.getElementById('decisionText').value = '';
    document.getElementById('decisionReason').value = '';
    document.getElementById('captureForm').style.display = 'none';

    // Update right sidebar immediately
    renderDecisions();

    alert('Decision captured successfully!');
}

// -------------------- BOT LOGIC --------------------
function processMessage(msg) {
    msg = msg.toLowerCase().trim();

    // Check against captured decisions with keyword matching
    for(let d of decisions) {
        const keywords = d.text.toLowerCase().split(' ').filter(w => w.length > 2); // ignore short words
        if(keywords.every(k => msg.includes(k))) {
            return `Previously you captured: "${d.text}"\nConstraints: ${d.constraints}`;
        }
    }

    return "I'm thinking... Could you clarify?";
}

// -------------------- INITIAL RENDER --------------------
renderChat();
renderDecisions();
renderChatHistory();