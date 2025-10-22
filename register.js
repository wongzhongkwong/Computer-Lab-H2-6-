// register.js
const USERS_KEY = 'inventory_users_v1';

// Utility: hash password using SHA-256
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// === Form submit handler ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const toggle = document.getElementById('togglePassword');
  const pass = document.getElementById('password');

  if (!form || !pass || !toggle) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = pass.value;
    const role = document.getElementById('role').value;

    if (!username || !password) {
      return alert('Please fill all fields.');
    }

    let users = loadUsers();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return alert('Username already exists!');
    }

    const hashed = await hashPassword(password);
    const newUser = { username, password: hashed, role, createdAt: new Date().toISOString() };

    users.push(newUser);
    saveUsers(users);

    document.getElementById('registerMsg').textContent =
      `✅ Registered successfully as ${role}. Redirecting...`;
    setTimeout(() => (window.location.href = 'login.html'), 1500);
  });

  // === Password visibility toggle ===
  toggle.addEventListener('click', () => {
    const isHidden = pass.type === 'password';
    pass.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? '🙈 Hide' : '👁️ Show';
    toggle.setAttribute('aria-pressed', String(isHidden));
    toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    pass.focus();
  });
});
