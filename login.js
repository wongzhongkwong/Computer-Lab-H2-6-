/// login.js
const USERS_KEY = 'inventory_users_v1';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

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

document.getElementById('togglePassword').addEventListener('click', () => {
  const pass = document.getElementById('password');
  const btn = document.getElementById('togglePassword');
  const isHidden = pass.type === 'password';
  pass.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈 Hide' : '👁️ Show';
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('togglePassword');
  const pass = document.getElementById('password');
  if (!toggle || !pass) return;

  toggle.addEventListener('click', () => {
    const showing = pass.type === 'password';
    pass.type = showing ? 'text' : 'password';
    toggle.textContent = showing ? '🙈' : '👁️';
    toggle.setAttribute('aria-pressed', String(showing));
    toggle.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
    pass.focus(); // keep focus in the input after toggle
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('togglePassword');
  const pass = document.getElementById('password');
  if (!toggle || !pass) return;

  toggle.addEventListener('click', () => {
    const isHidden = pass.type === 'password';
    pass.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? '🙈' : '👁️';
    toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
});
