// login.js
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'staff', password: 'staff123', role: 'staff' }
];

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;

  const found = USERS.find(x => x.username === u && x.password === p);
  if (!found) {
    document.getElementById('loginError').textContent = 'Invalid credentials';
    return;
  }

  localStorage.setItem('session', JSON.stringify({
    username: found.username,
    role: found.role,
    loginAt: new Date().toISOString()
  }));

  window.location.href = 'index.html'; // your inventory page
});
