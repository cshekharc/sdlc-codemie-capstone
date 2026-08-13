/* ── Toast ──────────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Course filter (home page) ─────────────────────────────────── */
function filterCourses(btn, cat) {
  document.querySelectorAll('.courses-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#coursesGrid .course-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
  });
}

/* ── Enroll button ──────────────────────────────────────────────── */
function enrollCourse(btn) {
  const title = btn.closest('.course-card').querySelector('h3').textContent.trim();
  btn.textContent = '✅ Enrolled!';
  btn.disabled = true;
  btn.style.background = 'var(--green)';
  showToast(`🎉 You enrolled in "${title.slice(0, 40)}…"`);
}

/* ── Live search (courses page) ────────────────────────────────── */
function liveSearch(query) {
  const q = query.toLowerCase();
  const cards = document.querySelectorAll('#allCoursesGrid .course-card');
  let visible = 0;
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const show = text.includes(q);
    card.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });
  const label = document.getElementById('countLabel');
  if (label) label.textContent = `Showing ${visible} course${visible !== 1 ? 's' : ''}`;
}

function applyFilters() { /* placeholder — checkboxes demo */ }

/* ── Dashboard tab switching ───────────────────────────────────── */
function switchTab(e, tabId) {
  e.preventDefault();
  const tabs = ['overview', 'my-courses', 'certificates', 'messages', 'settings', 'wishlist'];
  tabs.forEach(id => {
    const el = document.getElementById('tab-' + id);
    if (el) el.style.display = 'none';
  });
  const active = document.getElementById('tab-' + tabId);
  if (active) active.style.display = 'block';

  document.querySelectorAll('.dash-nav a').forEach(a => a.classList.remove('active'));
  e.currentTarget.classList.add('active');
}

/* ── Messaging ──────────────────────────────────────────────────── */
function sendMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !input.value.trim()) return;
  const chat = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:.6rem;flex-direction:row-reverse';
  div.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">AJ</div>
    <div style="background:var(--primary);color:#fff;border-radius:12px 0 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">
      ${escapeHtml(input.value)}
      <div style="font-size:.7rem;opacity:.75;margin-top:.3rem">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
    </div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  input.value = '';

  setTimeout(() => {
    const reply = document.createElement('div');
    reply.style.cssText = 'display:flex;gap:.6rem';
    reply.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">JK</div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:0 12px 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">
        Thanks for your message! I'll get back to you shortly. 😊
        <div style="font-size:.7rem;color:var(--muted);margin-top:.3rem">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
      </div>`;
    chat.appendChild(reply);
    chat.scrollTop = chat.scrollHeight;
  }, 1200);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Calendar generation ────────────────────────────────────────── */
function buildCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const studyDays = new Set([2, 4, 5, 7, 9, 11, 12, 14, 16, 19, 21]);

  days.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-label';
    el.textContent = d;
    grid.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day other-month';
    el.textContent = new Date(year, month, -firstDay + i + 1).getDate();
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day' + (d === today.getDate() ? ' today' : '') + (studyDays.has(d) ? ' has-event' : '');
    el.textContent = d;
    el.title = studyDays.has(d) ? 'Study session logged' : '';
    grid.appendChild(el);
  }
}

/* ── Hamburger menu ─────────────────────────────────────────────── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (!links) return;
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '64px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = '#fff';
    links.style.padding = '1rem 1.5rem';
    links.style.borderBottom = '1px solid #e2e8f0';
    links.style.zIndex = '999';
  });
}

/* ── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCalendar();
  initHamburger();
});
