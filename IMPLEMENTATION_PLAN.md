# IMPLEMENTATION_PLAN.md

This is the development reference plan for future implementation work on the **sdlc-codemie-capstone** project.

## 1) Scope (mapped to EP-12 .. EP-16)
- **EP-12 (Auth demo):** lightweight sign-in/sign-out and guard dashboard access.
- **EP-13 (Enrollment persistence):** persist enrollments across refresh (localStorage) and hydrate UI.
- **EP-14 (Chat + Calendar persistence):** persist dashboard chat history and study calendar state.
- **EP-15 (Accessibility):** keyboard navigation, semantic elements, ARIA, focus management, toast announcements.
- **EP-16 (Maintainability + Docs):** refactor hamburger to class-toggle (no inline styles) + add run/deploy notes.

### Out of scope (this plan)
- Backend/API/DB, real authentication (OAuth/JWT), payments.
- Framework migration (React/Vue/etc.) unless explicitly requested.

## 2) Acceptance Criteria
### Global
1. Session/enrollments/chat/calendar persist across refresh.
2. Dashboard is not accessible when signed out (redirect or clear sign-in prompt).
3. All key interactions are keyboard accessible.
4. Mobile nav toggles via CSS classes (no inline-style manipulation as source of truth).

### EP-12
- Sign-in creates a local session + user profile in localStorage (no passwords stored).
- Dashboard checks session on load and redirects (or shows sign-in) when missing.
- Header reflects state (Sign In vs Sign Out).

### EP-13
- Enrolling a course writes an enrollment record to storage.
- After refresh, enrolled courses remain marked Enrolled (disabled button or equivalent).
- If multi-user is used, enrollments are scoped by userId.

### EP-14
- Chat thread persists and re-renders on reload (trim to last N messages, e.g., 50).
- Calendar “study days” persist and re-render on reload.

### EP-15
- Clickable cards are semantic links/buttons OR have role/tabindex and Enter/Space handling.
- Hamburger has aria-controls and aria-expanded.
- Toast notifications announce via aria-live.

### EP-16
- Hamburger open/close implemented via toggling a CSS class.
- Minimal docs exist for running locally and validating changes.

## 3) Decisions needed (confirm before build)
1. Sign-in UX: modal vs dedicated login page.
2. Persistence scope: single-user vs multi-user within one browser (by userId).
3. Enroll gating: require sign-in to enroll vs allow anonymous enroll.

**Default (until confirmed otherwise):** modal sign-in, multi-user storage shape (byUserId), require sign-in to enroll.

## 4) Implementation Phases & Tasks
### Phase 0 — Prep (1–2h)
- Confirm decisions in section 3.
- Baseline current behavior and note what should change.

### Phase 1 — Storage utilities (2–4h)
- Add a safe JSON localStorage wrapper (read/write/remove).
- Add schema version key (e.g., ep.schemaVersion=1) and a reset/migration stub.

Validation:
- All pages load with empty storage.
- Corrupt JSON in a key does not break the app; defaults are used.

### Phase 2 — Demo auth (EP-12) (4–8h)
- Implement sign-in/sign-out (store session + profile).
- Update nav to show Sign In/Sign Out consistently across pages.
- Add dashboard route guard on DOMContentLoaded.

Validation:
- Signed out → dashboard redirects.
- Refresh retains session when signed in.
- Sign out clears session and updates header.

### Phase 3 — Enrollment persistence (EP-13) (4–8h)
- Add deterministic `data-course-id` to course cards/buttons.
- Update enroll handler to write to storage.
- Hydrate enroll buttons on page load.
- If gating: prompt sign-in when enrolling while signed out.

Validation:
- Enroll → refresh → still enrolled.
- If multi-user: different users have independent enrollments.

### Phase 4 — Chat + Calendar persistence (EP-14) (4–8h)
- Chat: load thread from storage; persist user messages + demo auto-replies; trim history.
- Calendar: replace hardcoded studyDays with stored values; support toggling a day and persisting.

Validation:
- Chat persists across refresh.
- Calendar marked days persist across refresh.

### Phase 5 — Accessibility improvements (EP-15) (4–8h)
- Replace clickable div cards with `<a>` where possible OR add tabindex/role and key handlers.
- Hamburger ARIA attributes; keep focus usable.
- Toast aria-live.
- Ensure visible focus styles in CSS.

Validation:
- Keyboard-only pass on Home/Courses/Dashboard.

### Phase 6 — Maintainability + docs (EP-16) (2–4h)
- Refactor hamburger JS to toggle a CSS class; move styling to CSS.
- Add minimal run notes (either README.md or keep here as canonical reference).

Validation:
- Hamburger behavior consistent across pages.
- A new dev can run and validate with docs.

## 5) Manual Test Plan
1. Auth: sign in → dashboard → refresh persists; sign out → dashboard blocked.
2. Enroll: enroll a course → refresh retains enrolled state.
3. Chat: send message → refresh restores thread.
4. Calendar: toggle day → refresh retains mark.
5. A11y: tab navigation + Enter/Space activation for key UI.

---
Changelog:
- 1.0 Initial implementation plan added.
