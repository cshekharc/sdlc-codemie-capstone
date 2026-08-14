# Implementation Plan (CAP7) - Codemie Capstone Prototype Hardening

Repo: https://github.com/cshekharc/sdlc-codemie-capstone

JIRA traceability: CAP-7, CAP-8, CAP-9, CAP-10

## 1) Scope & Goals
- CAP-8: Persist enrollment state across pages/sessions (localStorage)
- CAP-9: Accessibility improvements (menu, toast, interactive cards)
- CAP-10: Minimal quality baseline (README + check/lint; CI optional)

Scope constraint: static prototype only (no backend/real auth).

## 2) Acceptance Criteria
- Persistent enrollment state survives refresh and navigation
- Dashboard renders enrolled courses from stored
- Menu is semantic and keyboard-accessible (aria-expanded/controls, focus management, ESC)
- Toast messages are announced via aria-live
- README exists with run instructions and check command(s)

## 3) Design / Architecture
- AppState module (vanilla JS) persisted to localStorage
- Schema versioning: key codemie.appState.v1
- Stable course IDs, preferably data-course-id on cards/buttons

## 4) Phased Tasks

### Phase 1 (CAP-8): Enrollment persistence
- Implement AppState: load(), save(), enroll(courseId), isEnrolled(), getEnrolledCourseIds()
- Add data-course-id to course cards/enroll buttons
- Hydrate courses.html on load from stored state
- Render enrolled courses on dashboard.html

### Phase 2 (CAP-9): Accessibility
- Convert hamburger to <button> with aria-expanded/aria-controls
- Add focus management (open focus to first link; close return)
- ESC key closes menu when open
- Add hidden aria-live polite region and mirror toast text
- Replace clickable divs with <a>/<bridging> and ensure keyboard support

### Phase 3 (CAP-10): Quality baseline
- Add README with run instructions and known limitations
- Add minimal check command (local or SI optional)

## 5) Testing plan (Manual)
- Enroll a course → refresh → enrolled state persists
- Navigate Courses → Dashboard – enrolled courses render
- Mobile menu: open via keyboard → focus moves → ESC closes → focus returns
- Toast: screen reader announces message via aria-live
