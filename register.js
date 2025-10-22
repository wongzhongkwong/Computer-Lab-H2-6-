// register.js
const USERS_KEY = 'inventory_users_v1';

// === Utility: Hash password using SHA-256 ===
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// === Load & Save Users ===
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

// === DOM Ready ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const usernameInput = document.getElementById('username');
  const pass = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');
  const roleSelect = document.getElementById('role');
  const msgBox = document.getElementById('registerMsg');

  if (!form || !pass) return;

  // === Handle Registration ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = pass.value;
    const role = roleSelect.value;

    if (!username || !password) {
      alert('Please fill all fields.');
      return;
    }

    let users = loadUsers();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      alert('Username already exists!');
      return;
    }

    const hashed = await hashPassword(password);
    const newUser = {
      username,
      password: hashed,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    msgBox.textContent = `✅ Registered successfully as ${role}. Redirecting...`;
    setTimeout(() => (window.location.href = 'login.html'), 1500);
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
      pass.focus();
    });
  }
});
