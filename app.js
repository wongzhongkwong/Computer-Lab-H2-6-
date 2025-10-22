// Simple Inventory app using localStorage
const STORAGE_KEY = 'lab_h26_inventory_v1';

const dom = {
  itemsTbody: document.getElementById('itemsTbody'),
  addItemBtn: document.getElementById('addItemBtn'),
  modal: document.getElementById('modal'),
  itemForm: document.getElementById('itemForm'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  itemId: document.getElementById('itemId'),
  name: document.getElementById('name'),
  category: document.getElementById('category'),
  serial: document.getElementById('serial'),
  quantity: document.getElementById('quantity'),
  location: document.getElementById('location'),
  notes: document.getElementById('notes'),
  search: document.getElementById('search'),
  emptyHint: document.getElementById('emptyHint'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
};

// === LOGIN CHECK ===
const session = JSON.parse(localStorage.getItem('session') || 'null');
if (!session) {
  window.location.href = 'login.html';
}
const isAdmin = session.role === 'admin';
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin',
    `<div class="topbar-user">👋 ${session.username} (${session.role})
       <button id="logoutBtn" class="secondary">Logout</button>
     </div>`);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('session');
    window.location.href = 'login.html';
  });
});

if (!isAdmin) {
  dom.addItemBtn.disabled = true;
  dom.exportBtn.disabled = true;
  dom.importBtn.disabled = true;
  dom.itemsTbody.addEventListener('click', e => e.preventDefault()); // block edit/delete
}

let items = [];

function loadItems(){
  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch(e){
    console.error('Failed to parse storage:', e);
    items = [];
  }
}
function saveItems(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function uid(){ return 'id_' + Math.random().toString(36).slice(2,10); }

function renderList(filterText=''){
  dom.itemsTbody.innerHTML = '';
  const filtered = items.filter(it => {
    const q = filterText.trim().toLowerCase();
    if(!q) return true;
    return (it.name || '').toLowerCase().includes(q) || (it.serial || '').toLowerCase().includes(q);
  });

  if(filtered.length === 0){
    dom.emptyHint.style.display = items.length ? 'none' : 'block';
    return;
  } else dom.emptyHint.style.display = 'none';

  filtered.forEach((it, idx) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.category||'')}</td>
      <td>${escapeHtml(it.serial||'')}</td>
      <td>${it.quantity ?? 0}</td>
      <td>${escapeHtml(it.location||'')}</td>
      <td>${escapeHtml(it.notes||'')}</td>
      <td>
      <button data-id="${it.id}" class="edit">✏️ Edit</button>
     <button data-id="${it.id}" class="del">🗑️ Delete this item</button>
</td>

      </td>
    `;
    dom.itemsTbody.appendChild(tr);
  });
}

function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]) });
}

function openModal(editItem){
  dom.modal.classList.remove('hidden');
  dom.modal.setAttribute('aria-hidden','false');
  if(editItem){
    document.getElementById('modalTitle').textContent = 'Edit Item';
    dom.itemId.value = editItem.id;
    dom.name.value = editItem.name;
    dom.category.value = editItem.category || '';
    dom.serial.value = editItem.serial || '';
    dom.quantity.value = editItem.quantity ?? 1;
    dom.location.value = editItem.location || '';
    dom.notes.value = editItem.notes || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Add Item';
    dom.itemForm.reset();
    dom.itemId.value = '';
    dom.quantity.value = 1;
  }
  dom.name.focus();
}

function closeModal(){
  dom.modal.classList.add('hidden');
  dom.modal.setAttribute('aria-hidden','true');
}

dom.addItemBtn.addEventListener('click', () => openModal(null));
dom.cancelBtn.addEventListener('click', () => { closeModal(); });

dom.itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = dom.itemId.value || uid();
  const payload = {
    id,
    name: dom.name.value.trim(),
    category: dom.category.value.trim(),
    serial: dom.serial.value.trim(),
    quantity: Number(dom.quantity.value) || 0,
    location: dom.location.value.trim(),
    notes: dom.notes.value.trim(),
    updatedAt: new Date().toISOString()
  };
  const exists = items.find(i => i.id === id);
  if(exists){
    Object.assign(exists, payload);
  } else {
    items.unshift(payload);
  }
  saveItems();
  renderList(dom.search.value);
  closeModal();
});

dom.itemsTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  if(btn.classList.contains('edit')){
    const it = items.find(x=>x.id===id);
    if(it) openModal(it);
  } else if(btn.classList.contains('del')){
   if (confirm('⚠️ Are you sure you want to delete this item?\nThis action cannot be undone.')) {
   items = items.filter(x => x.id !== id);
   saveItems();
   renderList(dom.search.value);
   alert('🗑️ Item successfully deleted.');
}

  }
});

dom.search.addEventListener('input', (e) => renderList(e.target.value));

dom.exportBtn.addEventListener('click', () => {
  if(items.length === 0) return alert('No items to export');
  const csv = toCSV(items);
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_h2-6.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

dom.importBtn.addEventListener('click', () => dom.importFile.click());
dom.importFile.addEventListener('change', async (ev) => {
  const f = ev.target.files[0]; if(!f) return;
  const text = await f.text();
  try {
    const parsed = fromCSV(text);
    // merge: add new with new id if serial missing duplicate
    parsed.forEach(p => {
      p.id = p.id || uid();
      items.unshift(p);
    });
    saveItems();
    renderList(dom.search.value);
    alert(`Imported ${parsed.length} items.`);
  } catch(err){
    alert('Failed to import: ' + err.message);
  } finally {
    dom.importFile.value = '';
  }
});

// CSV helpers
function toCSV(arr){
  const header = ['id','name','category','serial','quantity','location','notes','updatedAt'];
  const rows = arr.map(it => header.map(h => `"${String(it[h] ?? '').replace(/"/g,'""')}"`).join(','));
  return header.join(',') + '\n' + rows.join('\n');
}
function fromCSV(str){
  // Simple CSV parser assuming double quotes and commas - returns array of objects
  const lines = str.trim().split(/\r?\n/).filter(Boolean);
  if(lines.length < 1) throw new Error('CSV empty');
  const header = parseCSVLine(lines[0]);
  const data = lines.slice(1).map(l => {
    const vals = parseCSVLine(l);
    const obj = {};
    header.forEach((h,i)=>obj[h]=vals[i] ?? '');
    // normalize quantity
    obj.quantity = Number(obj.quantity) || 0;
    return obj;
  });
  return data;
}
function parseCSVLine(line){
  const out=[];
  let cur=''; let inQuotes=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQuotes){
      if(ch==='\"'){
        if(line[i+1]==='\"'){ cur+='"'; i++; } else { inQuotes=false; }
      } else { cur+=ch; }
    } else {
      if(ch==='"'){ inQuotes=true; } else if(ch===','){ out.push(cur); cur=''; } else { cur+=ch; }
    }
  }
  out.push(cur);
  return out;
}

// init
loadItems();
renderList();

// close modal on outside click
dom.modal.addEventListener('click', (e) => {
  if(e.target === dom.modal) closeModal();
});
