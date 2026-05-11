import assert from "node:assert/strict";
import test from "node:test";

import { buildResumeSuggestion, buildTodayFocusSnapshot } from "@/lib/domain/dashboard-guidance";
import {
  RecoveryPlan,
  ReviewTask,
  Session,
  WeeklyPlanTask,
} from "@/types";

function makeSession(overrides: Partial<Session>): Session {
  return {
    id: "session-1",
    date: "2026-05-11",
    sessionType: "review",
    startPage: 10,
    endPage: 12,
    pagesCount: 3,
    durationMinutes: 20,
    repetitions: 3,
    qualityRating: 4,
    difficultyRating: 2,
    withTeacher: false,
    tested: false,
    notes: "جلسة سابقة",
    weakPagesDiscovered: [],
    tags: [],
    reviewedFromMemory: true,
    createdAt: "2026-05-11T08:00:00.000Z",
    updatedAt: "2026-05-11T08:00:00.000Z",
    ...overrides,
  };
}

function makeReviewTask(id: string, title: string, pageNumbers: number[], estimatedMinutes: number): ReviewTask {
  return {
    id,
    date: "2026-05-11",
    category: "cycle",
    title,
    pageNumbers,
    priority: 1,
    reason: `${title} سبب مختصر`,
    estimatedMinutes,
    completed: false,
  };
}

function makeWeeklyTask(id: string, title: string, pageNumbers: number[], estimatedMinutes: number): WeeklyPlanTask {
  return {
    id,
    title,
    type: "review",
    pageNumbers,
    estimatedMinutes,
    reason: `${title} من الخطة الأسبوعية`,
    priority: 1,
  };
}

function makeRecoveryPlan(overrides: Partial<RecoveryPlan>): RecoveryPlan {
  return {
    isNeeded: false,
    gapDays: 0,
    severity: "steady",
    headline: "العودة مستقرة",
    summary: "لا توجد حاجة إلى خطة تعافٍ اليوم.",
    recommendedMode: "normal",
    canResumeMemorization: true,
    days: [],
    ...overrides,
  };
}

test("buildResumeSuggestion continues the next memorization range", () => {
  const suggestion = buildResumeSuggestion(
    makeSession({
      sessionType: "memorization",
      startPage: 40,
      endPage: 41,
      pagesCount: 2,
      optionalSurahLabel: "سورة النساء",
    }),
  );

  assert.ok(suggestion);
  assert.equal(suggestion.preset.sessionType, "memorization");
  assert.equal(suggestion.preset.startPage, 42);
  assert.equal(suggestion.preset.endPage, 43);
  assert.deepEqual(suggestion.pageNumbers, [42, 43]);
});

test("buildResumeSuggestion prefers weak pages for the last review session", () => {
  const suggestion = buildResumeSuggestion(
    makeSession({
      sessionType: "review",
      startPage: 30,
      endPage: 34,
      pagesCount: 5,
      weakPagesDiscovered: [32, 34],
    }),
  );

  assert.ok(suggestion);
  assert.equal(suggestion.preset.sessionType, "review");
  assert.equal(suggestion.preset.startPage, 32);
  assert.equal(suggestion.preset.endPage, 34);
  assert.deepEqual(suggestion.pageNumbers, [32, 34]);
});

test("buildTodayFocusSnapshot uses recovery tasks first when a recovery plan is needed", () => {
  const snapshot = buildTodayFocusSnapshot({
    recoveryPlan: makeRecoveryPlan({
      isNeeded: true,
      gapDays: 4,
      severity: "medium",
      headline: "ارجع بهدوء",
      summary: "ابدأ بخطة تعافٍ خفيفة بدل فتح كل الأقسام.",
      days: [
        {
          id: "recovery-day-1",
          date: "2026-05-11",
          label: "اليوم",
          title: "يوم تثبيت",
          summary: "مهمتان خفيفتان فقط.",
          totalPages: 4,
          totalMinutes: 25,
          tasks: [
            makeWeeklyTask("recovery-1", "استرجاع الصفحة 12", [12], 10),
            makeWeeklyTask("recovery-2", "استرجاع الصفحة 13", [13], 15),
          ],
        },
      ],
    }),
    reviewTasks: [
      makeReviewTask("review-1", "مراجعة عامة", [50, 51], 20),
    ],
    todayWeeklyTasks: [
      makeWeeklyTask("weekly-1", "مراجعة الأسبوع", [60], 12),
    ],
  });

  assert.equal(snapshot.source, "recovery");
  assert.equal(snapshot.totalMinutes, 25);
  assert.equal(snapshot.items.length, 2);
  assert.equal(snapshot.items[0]?.title, "استرجاع الصفحة 12");
});

test("buildTodayFocusSnapshot falls back to review tasks on a normal day", () => {
  const snapshot = buildTodayFocusSnapshot({
    recoveryPlan: makeRecoveryPlan({}),
    reviewTasks: [
      makeReviewTask("review-1", "مراجعة مقطع", [20, 21], 12),
      makeReviewTask("review-2", "تثبيت آخر صفحة", [22], 9),
    ],
    todayWeeklyTasks: [
      makeWeeklyTask("weekly-1", "خطة احتياطية", [40], 14),
    ],
  });

  assert.equal(snapshot.source, "review");
  assert.equal(snapshot.totalMinutes, 21);
  assert.equal(snapshot.items.length, 2);
  assert.equal(snapshot.items[1]?.title, "تثبيت آخر صفحة");
});
