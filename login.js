/// login.js
const USERS_KEY = 'inventory_users_v1';

// Load users
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

// Hash password (same function as in register.js)
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const users = loadUsers();

  const hashed = await hashPassword(p);
  const found = users.find(x => x.username === u && x.password === hashed);

  if (!found) {
    document.getElementById('loginError').textContent = 'Invalid username or password';
    return;
  }

  localStorage.setItem('session', JSON.stringify({
    username: found.username,
    role: found.role,
    loginAt: new Date().toISOString()
  }));

  window.location.href = 'index.html';
});

