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

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
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

  document.getElementById('registerMsg').textContent = `✅ Registered successfully as ${role}. Redirecting...`;
  setTimeout(() => window.location.href = 'login.html', 1500);
});

document.getElementById('togglePassword').addEventListener('click', () => {
  const pass = document.getElementById('password');
  const btn = document.getElementById('togglePassword');
  const isHidden = pass.type === 'password';
  pass.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈 Hide' : '👁️ Show';
});
