# IMPLEMENTATION PLAN

Project: sdlc-codemie-capstone
Branch: impli_plan
Date: 2026-08-14

## 1) Scope and goals
This plan covers the minimum work to productionize the current static HTML/CSS/JS capstone UI so it behaves consistently, is improved for accessibility, and provides a clear path to a real backend.

In scope Jira items:
- CAP-20 Persist enrollment and dashboard state across page refresh (localStorage)
- CAP-21 Accessibility improvements for navigation, tabs, and notifications
- CAP-22 Refactor UI state toggles to use CSS classes and remove/implement placeholder behavior

## 2) Non-goals (scope guards)
- No real backend/database in this phase (we only document a future API contract).
- No full UI redesign; only targeted changes needed for accessibility + state robustness.
- No full automated test suite (we add a smoke checklist + optional tooling suggestions).

## 3) Current state (as-is)
- Static site with multiple pages (index.html, courses.html, dashboard.html), shared JS (js/main.js).
- Interactions are DOM-only (enrollCourse(), sendMessage(), switchTab()).
- No persistence/identity; user-like flows reset on refresh.

## 4) Proposed architecture (minimal)
### 4.1 Storage & state model (phase 1)
Introduce a small front-end store persisted to localStorage.

Proposed data shape:
- appState
  - version: number (for migrations)
  - enrollments: Array<{ courseId: string, enrolledAt: ISO8601, status: 'enrolled'|'completed' }>
  - progress: Record<courseId, { percent: number, lastUpdatedAt: ISO8601 }>
  - messages: Array<{ id: string, to: string, body: string, createdAt: ISO8601 }>
  - prefs: { darkMode?: boolean, lastActiveTab?: string }

Course identity:
- Preferred: add data-course-id to each course card on courses.html and any mirrored cards on dashboard.html.
- Fallback: derive a slug from title (risk: renames break state).

### 4.2 Future backend contract (phase 2; not implemented here)
Document endpoints and payloads for: Auth, Courses, Enrollment, Progress, Messages.

Example contract (documentation only):
- POST /api/auth/login
- GET /api/courses
- POST /api/enrollments { courseId }
- PATCH /api/progress/{courseId} { percent }
- POST /api/messages { to, body }

## 5) Tasks by Jira issue
### CAP-20 Persist enrollment and dashboard state (localStorage)
Acceptance criteria:
- Enrolling in a course persists after refresh.
- Dashboard “My Courses” reflects persisted enrollments.
- Messages sent from dashboard persist after refresh.

Implementation tasks:
1. Add stable course identifiers (data-course-id attributes).
2. Add a storage module (get/set + versioned migrations, try/catch fallbacks).
3. Update enrollCourse() to write to store and re-render UI.
4. On dashboard load, hydrate “My Courses” and progress from store.
5. Persist last active tab and restore on load.

### CAP-21 Accessibility improvements
Acceptance criteria:
- Hamburger is keyboard operable and exposes aria-expanded state.
- Dashboard tabs are screen-reader friendly (roles, aria-selected, keyboard nav).
- Toast notifications are announced via aria-live without stealing focus.

Implementation tasks:
1. Convert hamburger trigger to a <button> with aria-controls + aria-expanded.
2. Toggle menu visibility via CSS class (no multi-line inline style mutations).
3. Implement tab semantics (role=tablist/tab/tabpanel) + arrow key navigation.
4. Make toast container an aria-live region (role=status, aria-live=polite).
5. Ensure visible focus styles (e.g., :focus-visible) on interactive elements.

### CAP-22 Robust UI state toggles & filter truthfulness
Acceptance criteria:
- No hardcoded tab id lists in JS for switching.
- Menu open/close does not rely on inline styles.
- Course filters are either functional or explicitly labeled “Coming soon”.

Implementation tasks:
1. Drive tabs from DOM data attributes (remove hardcoded arrays).
2. Use classes for hide/show state in switchTab().
3. Implement minimal filter logic OR disable filter controls with a clear note.

## 6) Testing & validation
Manual smoke checklist:
- Enroll a course → refresh → enrollment persists.
- Switch dashboard tabs → refresh → last tab persists.
- Send message → refresh → message list persists.
- Hamburger: keyboard toggle, Esc closes, focus returns.
- Screen reader: tab announcements, toast read once.

Optional future tooling:
- Add ESLint + Prettier.
- Run Lighthouse or axe-core checks.

## 7) Dependencies, risks, mitigations
- Dependency: stable course IDs across pages.
  - Mitigation: add data-course-id for every course card on all pages.
- Risk: localStorage cleared by user/browser resets state.
  - Mitigation: graceful empty-state handling; keep backend contract for next phase.
- Risk: a11y fixes may require small DOM changes.
  - Mitigation: incremental changes + smoke checklist.
