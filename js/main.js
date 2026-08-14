/* ── Storage module (CAP-20) ─────────────────────────────────────── */
const STORE_KEY = 'codemie_appState';
const STORE_VERSION = 1;

function defaultState() {
  return {
    version: STORE_VERSION,
    enrollments: [],
    progress: {},
    messages: [],
    prefs: { lastActiveTab: 'overview' }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORE_VERSION) return defaultState();
    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) { /* storage unavailable — fail silently */ }
}

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

/* ── Enroll button (CAP-20) ─────────────────────────────────────── */
function enrollCourse(btn) {
  const card = btn.closest('.course-card');
  const title = card.querySelector('h3').textContent.trim();
  const courseId = card.dataset.courseId ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  markEnrolled(btn);
  showToast(`🎉 You enrolled in "${title.slice(0, 40)}…"`);

  const state = loadState();
  if (!state.enrollments.find(e => e.courseId === courseId)) {
    state.enrollments.push({
      courseId,
      title,
      enrolledAt: new Date().toISOString(),
      status: 'enrolled'
    });
    saveState(state);
  }
}

function markEnrolled(btn) {
  btn.textContent = '✅ Enrolled!';
  btn.disabled = true;
  btn.style.background = 'var(--green)';
}

/* ── Restore enrolled button states on page load (CAP-20) ──────── */
function restoreEnrollButtons() {
  const state = loadState();
  if (state.enrollments.length === 0) return;
  const enrolledIds = new Set(state.enrollments.map(e => e.courseId));
  document.querySelectorAll('.course-card[data-course-id]').forEach(card => {
    if (enrolledIds.has(card.dataset.courseId)) {
      const btn = card.querySelector('button.btn-primary');
      if (btn && !btn.disabled) markEnrolled(btn);
    }
  });
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

/* ── Sidebar filters (courses page — CAP-22) ────────────────────── */
function applyFilters() {
  const cards = document.querySelectorAll('#allCoursesGrid .course-card');

  // Category filter
  const catBoxes = [...document.querySelectorAll('.sidebar-section[data-filter="category"] input')];
  const checkedCats = catBoxes.filter(b => b.checked).map(b => b.dataset.value);
  const allCatValues = catBoxes.map(b => b.dataset.value);
  // Active only when some (but not all) are checked
  const catFilterActive = checkedCats.length > 0 && checkedCats.length < allCatValues.length;

  // Level filter
  const levelBoxes = [...document.querySelectorAll('.sidebar-section[data-filter="level"] input')];
  const checkedLevels = levelBoxes.filter(b => b.checked).map(b => b.dataset.value);
  const allLevelValues = levelBoxes.map(b => b.dataset.value);
  const levelFilterActive = checkedLevels.length > 0 && checkedLevels.length < allLevelValues.length;

  // Price filter
  const priceBoxes = [...document.querySelectorAll('.sidebar-section[data-filter="price"] input')];
  const checkedPrices = priceBoxes.filter(b => b.checked).map(b => b.dataset.value);
  const allPriceValues = priceBoxes.map(b => b.dataset.value);
  const priceFilterActive = checkedPrices.length > 0 && checkedPrices.length < allPriceValues.length;

  // Rating filter (unchecked by default — any checked means "min rating")
  const checkedRatings = [...document.querySelectorAll('.sidebar-section[data-filter="rating"] input:checked')]
    .map(b => parseFloat(b.dataset.value));

  // Duration filter (unchecked by default)
  const checkedDurations = [...document.querySelectorAll('.sidebar-section[data-filter="duration"] input:checked')]
    .map(b => b.dataset.value);

  let visible = 0;
  cards.forEach(card => {
    const cat      = card.dataset.cat || '';
    const level    = card.dataset.level || '';
    const price    = card.dataset.price || 'paid';
    const rating   = parseFloat(card.dataset.rating || '0');
    const duration = parseFloat(card.dataset.duration || '0');

    // Courses whose category is not represented in the sidebar always pass category filter
    const catOk = !catFilterActive ||
      checkedCats.includes(cat) ||
      !allCatValues.includes(cat);

    const levelOk = !levelFilterActive || checkedLevels.includes(level);
    const priceOk = !priceFilterActive || checkedPrices.includes(price);

    const ratingOk = checkedRatings.length === 0 ||
      checkedRatings.some(minR => rating >= minR);

    const durationOk = checkedDurations.length === 0 ||
      checkedDurations.some(d => {
        if (d === 'under-5') return duration < 5;
        if (d === '5-20')    return duration >= 5 && duration <= 20;
        if (d === '20-40')   return duration > 20 && duration <= 40;
        if (d === '40+')     return duration > 40;
        return false;
      });

    const show = catOk && levelOk && priceOk && ratingOk && durationOk;
    card.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });

  const label = document.getElementById('countLabel');
  if (label) label.textContent = `Showing ${visible} course${visible !== 1 ? 's' : ''}`;
}

/* ── Dashboard tab switching (CAP-21 + CAP-22) ──────────────────── */
function switchTab(e, tabId) {
  if (e) e.preventDefault();

  // Hide all tab panels (CAP-22: CSS class, no inline style mutations)
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    panel.classList.add('tab-hidden');
  });

  // Deselect all tab buttons (CAP-22: dynamic query via role attribute)
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
    tab.classList.remove('active');
  });

  // Show target panel via CSS class
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.remove('tab-hidden');

  // Activate the matching tab button
  const tab = document.querySelector(`[role="tab"][aria-controls="tab-${tabId}"]`);
  if (tab) {
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.classList.add('active');
  }

  // Persist last active tab (CAP-20)
  const state = loadState();
  state.prefs.lastActiveTab = tabId;
  saveState(state);
}

/* ── Messaging (CAP-20) ─────────────────────────────────────────── */
let _currentContact = 'Jonas Kramer';

function selectContact(el, name, role) {
  document.querySelectorAll('.msg-contact').forEach(c => {
    c.classList.remove('active-contact');
    c.style.background = '';
  });
  el.classList.add('active-contact');
  el.style.background = '#ede9fe';
  _currentContact = name;
  const nameEl = document.getElementById('chatName');
  if (nameEl) {
    nameEl.innerHTML =
      `<strong style="display:block;font-size:.92rem">${escapeHtml(name)}</strong>` +
      `<span style="font-size:.75rem;color:var(--muted)">${escapeHtml(role)} · Online</span>`;
  }
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !input.value.trim()) return;
  const chat = document.getElementById('chatMessages');
  const body = input.value.trim();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:.6rem;flex-direction:row-reverse';
  div.innerHTML =
    `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">AJ</div>` +
    `<div style="background:var(--primary);color:#fff;border-radius:12px 0 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">` +
    `${escapeHtml(body)}` +
    `<div style="font-size:.7rem;opacity:.75;margin-top:.3rem">${time}</div></div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  input.value = '';

  // Persist message (CAP-20)
  const state = loadState();
  const msgId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
  state.messages.push({ id: msgId, to: _currentContact, body, createdAt: new Date().toISOString() });
  saveState(state);

  setTimeout(() => {
    const reply = document.createElement('div');
    reply.style.cssText = 'display:flex;gap:.6rem';
    reply.innerHTML =
      `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">JK</div>` +
      `<div style="background:var(--bg);border:1px solid var(--border);border-radius:0 12px 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">` +
      `Thanks for your message! I'll get back to you shortly. 😊` +
      `<div style="font-size:.7rem;color:var(--muted);margin-top:.3rem">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`;
    chat.appendChild(reply);
    chat.scrollTop = chat.scrollHeight;
  }, 1200);
}

function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
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
    el.className = 'cal-day' +
      (d === today.getDate() ? ' today' : '') +
      (studyDays.has(d) ? ' has-event' : '');
    el.textContent = d;
    el.title = studyDays.has(d) ? 'Study session logged' : '';
    grid.appendChild(el);
  }
}

/* ── Hamburger menu (CAP-21 + CAP-22) ──────────────────────────── */
function _closeMenu(btn, links) {
  links.classList.remove('is-open');
  btn.setAttribute('aria-expanded', 'false');
  btn.focus();
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (!links) return;
    if (links.classList.contains('is-open')) {
      _closeMenu(btn, links);
    } else {
      links.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close on Escape and return focus to hamburger (CAP-21)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const links = document.querySelector('.nav-links');
      if (links && links.classList.contains('is-open')) {
        _closeMenu(btn, links);
      }
    }
  });
}

/* ── Arrow-key navigation for dashboard tabs (CAP-21) ──────────── */
function initTabKeyNav() {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  tablist.addEventListener('keydown', e => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const idx  = tabs.indexOf(document.activeElement);
    if (idx === -1) return;

    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      next = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      next = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    }

    if (next !== -1) {
      e.preventDefault();
      const targetId = tabs[next].getAttribute('aria-controls').replace('tab-', '');
      switchTab(null, targetId);
      tabs[next].focus();
    }
  });
}

/* ── Hydrate My Courses from localStorage (CAP-20) ─────────────── */
function hydrateMyCourses() {
  const grid = document.querySelector('#tab-my-courses .courses-grid');
  if (!grid) return;

  const state = loadState();
  if (state.enrollments.length === 0) {
    // Keep static demo cards when there are no persisted enrollments
    return;
  }

  // Replace static demo cards with persisted enrollments
  grid.innerHTML = '';
  state.enrollments.forEach(enr => {
    const article = document.createElement('article');
    article.className = 'course-card';
    article.dataset.courseId = enr.courseId;
    const enrollDate = new Date(enr.enrolledAt).toLocaleDateString();
    article.innerHTML =
      `<div class="course-thumb" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe)">📚` +
      `<span class="badge badge-primary level-badge">Enrolled</span></div>` +
      `<div class="course-body">` +
      `<div class="course-category">Enrolled Course</div>` +
      `<h3>${escapeHtml(enr.title)}</h3>` +
      `<div style="margin:.75rem 0">` +
      `<div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--muted);margin-bottom:.3rem"><span>Progress</span><span>0%</span></div>` +
      `<div style="height:6px;background:var(--border);border-radius:999px"><div style="height:100%;width:0%;background:var(--primary);border-radius:999px"></div></div>` +
      `</div>` +
      `<div class="course-footer">` +
      `<span style="font-size:.82rem;color:var(--muted)">Enrolled ${enrollDate}</span>` +
      `<button class="btn btn-primary" style="padding:.4rem .9rem;font-size:.8rem" onclick="showToast('▶️ Resuming course…')">Start</button>` +
      `</div></div>`;
    grid.appendChild(article);
  });
}

/* ── Restore persisted messages on dashboard load (CAP-20) ─────── */
function restoreMessages() {
  const chat = document.getElementById('chatMessages');
  if (!chat) return;

  const state = loadState();
  if (state.messages.length === 0) return;

  state.messages.forEach(msg => {
    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:.6rem;flex-direction:row-reverse';
    div.innerHTML =
      `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0">AJ</div>` +
      `<div style="background:var(--primary);color:#fff;border-radius:12px 0 12px 12px;padding:.65rem .9rem;font-size:.85rem;max-width:360px">` +
      `${escapeHtml(msg.body)}` +
      `<div style="font-size:.7rem;opacity:.75;margin-top:.3rem">${time}</div></div>`;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

/* ── Dashboard initialization (CAP-20) ─────────────────────────── */
function initDashboard() {
  // Only run on pages that have tab panels
  if (!document.querySelector('[role="tablist"]')) return;

  // Restore last active tab
  const state = loadState();
  const lastTab = (state.prefs && state.prefs.lastActiveTab) || 'overview';
  switchTab(null, lastTab);

  // Hydrate My Courses
  hydrateMyCourses();

  // Restore persisted messages
  restoreMessages();

  // Enable arrow-key navigation
  initTabKeyNav();
}

/* ── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCalendar();
  initHamburger();
  restoreEnrollButtons();
  initDashboard();
});
