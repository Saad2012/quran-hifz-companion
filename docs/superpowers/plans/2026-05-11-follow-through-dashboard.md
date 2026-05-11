# Follow-Through Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three anti-distraction improvements for the Quran Hifz Companion dashboard: a clear "start next task" entry point, a compact "today only" workflow, and a "resume where you left off" shortcut.

**Architecture:** Keep the behavioral rules in domain derivation so the dashboard, a new `/today` route, and focus-mode surfaces can all reuse the same guidance. Add a small tested helper for resume/today snapshots, then wire lightweight UI components around it without changing persistence shape.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, existing local-first store, Node test runner with `tsx`, Tailwind CSS 4.

---

### Task 1: Add testable domain helpers

**Files:**
- Create: `lib/domain/dashboard-guidance.ts`
- Create: `tests/dashboard-guidance.test.ts`
- Modify: `package.json`

- [ ] Write a failing test for `buildResumeSuggestion()` covering memorization continuation and review fallback.
- [ ] Run the targeted test command and verify it fails for missing exports.
- [ ] Implement the minimal helper with typed resume metadata.
- [ ] Re-run the targeted test command and verify it passes.

### Task 2: Add today-only derived snapshot

**Files:**
- Modify: `types/models.ts`
- Modify: `lib/domain/app-view.ts`
- Modify: `lib/domain/dashboard-guidance.ts`
- Modify: `tests/dashboard-guidance.test.ts`

- [ ] Write a failing test for `buildTodayFocusSnapshot()` covering recovery-first and normal review-day paths.
- [ ] Run the targeted test command and verify it fails for missing snapshot data.
- [ ] Extend dashboard types and derive `todayFocus` + `resumeSuggestion`.
- [ ] Re-run the targeted test command and verify it passes.

### Task 3: Wire the UI surfaces

**Files:**
- Create: `app/(app)/today/page.tsx`
- Create: `features/dashboard/today-page.tsx`
- Modify: `features/dashboard/dashboard-page.tsx`
- Modify: `features/focus/focus-page.tsx`

- [ ] Add a distraction-light `/today` route showing only the next action, today summary, and resume card.
- [ ] Update the main dashboard header and top content to surface "ابدأ المهمة التالية" and "اليوم فقط" clearly.
- [ ] Add the resume shortcut in focus mode so the last context is one tap away.
- [ ] Run lint/build/browser verification after the UI wiring.

### Task 4: Verify and publish

**Files:**
- Modify: `package-lock.json` if new dev dependency is installed

- [ ] Run targeted tests, `npm run lint`, and `npm run build`.
- [ ] Run the local app and verify `/` and `/today` in the browser.
- [ ] Commit the finished work on a `codex/` branch, push to GitHub, and fast-forward `main`.
- [ ] Confirm Vercel readiness by pushing `main` after local build success.
