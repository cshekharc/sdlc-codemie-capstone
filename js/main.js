/* ── Storage module (CAP-20) ─────────────────────────────────────── */
const STORE_KEY = 'codemie_v1';
const STORE_VER = 1;

function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return _defaultStore();
    return _migrate(JSON.parse(raw));
  } catch { return _defaultStore(); }
}

function saveStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
}

function _defaultStore() {
  return { version: STORE_VER, enrollments: [], progress: {}, messages: [], prefs: {} };
}

function _migrate(data) {
  data.enrollments = data.enrollments || [];
  data.progress    = data.progress    || {};
  data.messages    = data.messages    || [];
  data.prefs       = data.prefs       || {};
  data.version     = STORE_VER;
  return data;
}

function _slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── Toast (CAP-21: aria-live is set in HTML) ───────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Course filter — home page ─────────────────────────────────── */
function filterCourses(btn, cat) {
  document.querySelectorAll('.courses-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#coursesGrid .course-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
  });
}

/* ── Enroll button (CAP-20) ─────────────────────────────────────── */
function enrollCourse(btn) {
  const card = btn.closest('.course-card');
  const title = card.querySelector('h3').textContent.trim();
  const courseId = card.dataset.courseId || _slugify(title);

  const state = getStore();
  if (state.enrollments.find(e => e.courseId === courseId)) {
    showToast(`ℹ️ Already enrolled in "${title.slice(0, 40)}"`);
    _markEnrolledBtn(btn);
    return;
  }

  state.enrollments.push({
    courseId,
    title,
    enrolledAt: new Date().toISOString(),
    status: 'enrolled'
  });
  state.progress[courseId] = { percent: 0, lastUpdatedAt: new Date().toISOString() };
  saveStore(state);

  _markEnrolledBtn(btn);
  showToast(`🎉 You enrolled in "${title.slice(0, 40)}…"`);
}

function _markEnrolledBtn(btn) {
  btn.textContent = '✅ Enrolled!';
  btn.disabled = true;
  btn.style.background = 'var(--green)';
}

/* ── Live search — courses page ────────────────────────────────── */
function liveSearch(query) {
  const q = query.toLowerCase();
  const cards = document.querySelectorAll('#allCoursesGrid .course-card');
  let visible = 0;
  cards.forEach(card => {
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });
  const label = document.getElementById('countLabel');
  if (label) label.textContent = `Showing ${visible} course${visible !== 1 ? 's' : ''}`;
}

function applyFilters() {
  showToast('ℹ️ Filter functionality coming soon');
}

/* ── Dashboard tab switching (CAP-22 + CAP-20) ──────────────────── */
function switchTab(e, tabId) {
  e.preventDefault();
  _activateTab(tabId);

  const state = getStore();
  state.prefs.lastActiveTab = tabId;
  saveStore(state);
}

function _activateTab(tabId) {
  document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('tab-hidden'));
  const active = document.getElementById('tab-' + tabId);
  if (active) active.classList.remove('tab-hidden');

  document.querySelectorAll('.dash-nav [role="tab"]').forEach(a => {
    const isActive = a.dataset.tab === tabId;
    a.classList.toggle('active', isActive);
    a.setAttribute('aria-selected', String(isActive));
    a.setAttribute('tabindex', isActive ? '0' : '-1');
  });
}

/* ── Messaging (CAP-20: persists messages) ──────────────────────── */
function sendMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();

  const state = getStore();
  state.messages.push({
    id: String(Date.now()),
    to: 'Jonas Kramer',
    body: text,
    createdAt: new Date().toISOString()
  });
  saveStore(state);

  const chat = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:.6rem;flex-direction:row-reverse';
  div.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">AJ</div>
    <div style="background:var(--primary);color:#fff;border-radius:12px 0 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">
      ${escapeHtml(text)}
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

function selectContact(el, name, role) {
  document.querySelectorAll('.msg-contact').forEach(c => c.classList.remove('active-contact'));
  el.classList.add('active-contact');
  const nameEl = document.getElementById('chatName');
  if (nameEl) nameEl.innerHTML = `<strong style="display:block;font-size:.92rem">${escapeHtml(name)}</strong><span style="font-size:.75rem;color:var(--muted)">${escapeHtml(role)} · Online</span>`;
}

/* ── Calendar ───────────────────────────────────────────────────── */
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
    el.className = 'cal-day' +
      (d === today.getDate() ? ' today' : '') +
      (studyDays.has(d) ? ' has-event' : '');
    el.textContent = d;
    el.title = studyDays.has(d) ? 'Study session logged' : '';
    grid.appendChild(el);
  }
}

/* ── Hamburger — keyboard-accessible (CAP-21) ───────────────────── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('nav-open', !open);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      btn.setAttribute('aria-expanded', 'false');
      links.classList.remove('nav-open');
      btn.focus();
    }
  });
}

/* ── Tab keyboard navigation (CAP-21) ──────────────────────────── */
function initTabNav() {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  tablist.addEventListener('keydown', e => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      tabs[(idx + 1) % tabs.length].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      tabs[(idx - 1 + tabs.length) % tabs.length].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement.click();
    }
  });
}

/* ── Dashboard hydration (CAP-20) ───────────────────────────────── */
function hydrateDashboard() {
  const state = getStore();

  if (state.prefs.lastActiveTab) {
    _activateTab(state.prefs.lastActiveTab);
  }

  const kpi = document.getElementById('kpi-enrolled');
  if (kpi && state.enrollments.length > 0) {
    kpi.textContent = state.enrollments.length;
  }

  _hydrateMyCourses(state);
  _restoreEnrollButtons(state);
}

function _hydrateMyCourses(state) {
  const container = document.getElementById('my-courses-grid');
  if (!container || state.enrollments.length === 0) return;

  container.innerHTML = '';
  state.enrollments.forEach(({ courseId, title, status }) => {
    const pct = (state.progress[courseId] && state.progress[courseId].percent) || 0;
    const isDone = status === 'completed';
    const badgeClass = isDone ? 'badge-green' : 'badge-primary';
    const statusLabel = isDone ? 'Completed' : 'In Progress';
    const barColor = isDone ? 'var(--green)' : 'var(--primary)';
    const actionBtn = isDone
      ? `<button class="btn btn-outline" style="padding:.4rem .9rem;font-size:.8rem;border-color:var(--green);color:var(--green)" onclick="showToast('🏆 Certificate downloaded!')">Get Certificate</button>`
      : `<button class="btn btn-primary" style="padding:.4rem .9rem;font-size:.8rem" onclick="showToast('▶️ Resuming course…')">Continue</button>`;

    container.insertAdjacentHTML('beforeend', `
      <article class="course-card">
        <div class="course-thumb" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe)">📚
          <span class="badge ${badgeClass} level-badge">${statusLabel}</span>
        </div>
        <div class="course-body">
          <div class="course-category">Enrolled</div>
          <h3>${escapeHtml(title)}</h3>
          <div style="margin:.75rem 0">
            <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--muted);margin-bottom:.3rem">
              <span>Progress</span><span>${pct}%</span>
            </div>
            <div style="height:6px;background:var(--border);border-radius:999px">
              <div style="height:100%;width:${pct}%;background:${barColor};border-radius:999px"></div>
            </div>
          </div>
          <div class="course-footer">
            <span style="font-size:.82rem;color:var(--muted)">0 / ? lessons</span>
            ${actionBtn}
          </div>
        </div>
      </article>`);
  });
}

function _restoreEnrollButtons(state) {
  document.querySelectorAll('.course-card').forEach(card => {
    const btn = card.querySelector('button[onclick*="enrollCourse"]');
    if (!btn) return;
    const h3 = card.querySelector('h3');
    if (!h3) return;
    const courseId = card.dataset.courseId || _slugify(h3.textContent.trim());
    if (state.enrollments.find(e => e.courseId === courseId)) {
      _markEnrolledBtn(btn);
    }
  });
}

/* ── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCalendar();
  initHamburger();
  initTabNav();
  hydrateDashboard();
});
