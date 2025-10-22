// login.js
const USERS_KEY = 'inventory_users_v1';

// === Load saved users ===
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

// === Hash password (SHA-256) ===
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// === DOM Ready ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const pass = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');
  const errorBox = document.getElementById('loginError');

  if (!form || !pass) return;

  // === Handle Login ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const u = usernameInput.value.trim();
    const p = pass.value;
    const users = loadUsers();
    const hashed = await hashPassword(p);

    const found = users.find(x => x.username === u && x.password === hashed);

    if (!found) {
      errorBox.textContent = 'Invalid username or password';
      return;
    }

    localStorage.setItem('session', JSON.stringify({
      username: found.username,
      role: found.role,
      loginAt: new Date().toISOString()
    }));

    window.location.href = 'index.html';
  });

  // === Password visibility toggle ===
  if (toggle) {
    toggle.textContent = '👁️ Show'; // default label

    toggle.addEventListener('click', () => {
      const isHidden = pass.type === 'password';
      pass.type = isHidden ? 'text' : 'password';
      toggle.textContent = isHidden ? '🙈 Hide' : '👁️ Show';
      toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      toggle.setAttribute('aria-pressed', String(isHidden));
      pass.focus(); // keep focus in field
    });
  }
});
