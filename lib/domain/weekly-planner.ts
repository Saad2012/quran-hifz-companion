import { addDays, format } from "date-fns";
import { arSA } from "date-fns/locale";

import { PersistedAppData, ReviewEngineOutput, WeeklyPlanDay, WeeklyPlanTask, WeeklyPlanner } from "@/types";
import { getTodayDateKey } from "@/utils/date";
import { clamp, uniqueSortedNumbers, WEEKDAY_LABELS } from "@/utils/pages";

function createReviewTask(
  id: string,
  title: string,
  pageNumbers: number[],
  reason: string,
  priority: number,
): WeeklyPlanTask | null {
  const uniquePages = uniqueSortedNumbers(pageNumbers);

  if (!uniquePages.length) {
    return null;
  }

  return {
    id,
    title,
    type: "review",
    pageNumbers: uniquePages,
    estimatedMinutes: Math.max(10, uniquePages.length * 2),
    reason,
    priority,
  };
}

function createMemorizationTask(
  id: string,
  pageNumbers: number[],
  reason: string,
) {
  const uniquePages = uniqueSortedNumbers(pageNumbers);

  if (!uniquePages.length) {
    return null;
  }

  return {
    id,
    title: "حفظ جديد",
    type: "memorization" as const,
    pageNumbers: uniquePages,
    estimatedMinutes: Math.max(25, uniquePages.length * 22),
    reason,
    priority: 3,
  };
}

export function buildWeeklyPlanner(
  data: PersistedAppData,
  reviewEngine: ReviewEngineOutput,
  todayDateKey = getTodayDateKey(),
) {
  const today = new Date(`${todayDateKey}T00:00:00`);
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));
  const memorizedMaxPage =
    data.sessions
      .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.endPage ?? 0;
  const recentMemSessions = data.sessions
    .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
    .slice(-8);
  const averageMemPages = recentMemSessions.length
    ? clamp(
        Math.round(
          recentMemSessions.reduce((total, session) => total + session.pagesCount, 0) / recentMemSessions.length,
        ),
        1,
        3,
      )
    : 1;

  const allWeakQueue = uniqueSortedNumbers([
    ...reviewEngine.criticalPages,
    ...reviewEngine.overduePages,
    ...reviewEngine.weakPages,
  ]);
  const reviewDayCount = days.filter((date) => data.settings.reviewDays.includes(date.getDay())).length || 1;
  const weakSlices = Array.from({ length: reviewDayCount }, () => [] as number[]);
  allWeakQueue.forEach((pageNumber, index) => {
    weakSlices[index % reviewDayCount].push(pageNumber);
  });

  let reviewDayCursor = 0;
  let memorizationCursor = memorizedMaxPage + 1;
  let shouldPlaceTest = reviewEngine.criticalPages.length <= 3;
  const plannedDays: WeeklyPlanDay[] = [];

  for (const [index, date] of days.entries()) {
    const dateKey = format(date, "yyyy-MM-dd");
    const isToday = index === 0;
    const weekdayIndex = date.getDay();
    const isReviewDay = data.settings.reviewDays.includes(weekdayIndex);
    const isMemorizationDay = data.settings.newMemorizationDays.includes(weekdayIndex);
    const tasks: WeeklyPlanTask[] = [];

    if (isReviewDay) {
      const assignment =
        reviewEngine.cycle.sessionAssignments[
          (reviewEngine.currentAssignmentIndex + reviewDayCursor) %
            Math.max(1, reviewEngine.cycle.sessionAssignments.length)
        ];
      reviewDayCursor += 1;

      if (isToday) {
        reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].tasks.forEach((task, taskIndex) => {
          tasks.push({
            id: `${task.id}-${taskIndex}`,
            title: task.title,
            type: "review",
            pageNumbers: task.pageNumbers,
            estimatedMinutes: task.estimatedMinutes,
            reason: task.reason,
            priority: task.priority,
          });
        });
      } else {
        const cycleTask = createReviewTask(
          `cycle-${dateKey}`,
          assignment?.label ? `مراجعة ${assignment.label}` : "دفعة مراجعة",
          assignment?.pageNumbers ?? [],
          "دفعة ناتجة عن دورة المراجعة الحالية.",
          4,
        );

        if (cycleTask) {
          tasks.push(cycleTask);
        }

        const rescueTask = createReviewTask(
          `rescue-${dateKey}`,
          "إنقاذ الصفحات الحساسة",
          weakSlices[reviewDayCursor - 1] ?? [],
          "توزيع الصفحات الضعيفة والحرجة على أيام الأسبوع بدل تراكمها في يوم واحد.",
          1,
        );

        if (rescueTask) {
          tasks.push(rescueTask);
        }
      }
    }

    if (
      isMemorizationDay &&
      memorizationCursor <= 604 &&
      !(data.settings.ramadanReviewOnly && date.getMonth() === 1)
    ) {
      const memPages = Array.from(
        { length: Math.min(averageMemPages, 604 - memorizationCursor + 1) },
        (_, pageIndex) => memorizationCursor + pageIndex,
      );
      memorizationCursor += memPages.length;

      const memTask = createMemorizationTask(
        `mem-${dateKey}`,
        memPages,
        "امتداد طبيعي لمسار الحفظ الحالي بحسب متوسط جلساتك الأخيرة.",
      );

      if (memTask) {
        tasks.push(memTask);
      }
    }

    if (shouldPlaceTest && index >= 2 && isReviewDay) {
      const baseTask = tasks.find((task) => task.type === "review");
      if (baseTask) {
        tasks.push({
          id: `test-${dateKey}`,
          title: "اختبار قصير للمراجعة",
          type: "test",
          pageNumbers: baseTask.pageNumbers.slice(0, Math.min(6, baseTask.pageNumbers.length)),
          estimatedMinutes: 12,
          reason: "يوصى باختبار قصير هذا الأسبوع لأن الضغط الحرج منخفض ويمكن استثمار ذلك في التثبيت.",
          priority: 5,
        });
        shouldPlaceTest = false;
      }
    }

    const uniquePages = uniqueSortedNumbers(tasks.flatMap((task) => task.pageNumbers));
    const totalMinutes = tasks.reduce((total, task) => total + task.estimatedMinutes, 0);
    const focusLabel =
      isReviewDay && isMemorizationDay
        ? "حفظ + مراجعة"
        : isReviewDay
          ? "مراجعة"
          : isMemorizationDay
            ? "حفظ"
            : "يوم خفيف";

    plannedDays.push({
      date: dateKey,
      weekdayIndex,
      weekdayLabel: WEEKDAY_LABELS[weekdayIndex],
      isToday,
      isMemorizationDay,
      isReviewDay,
      plannedTasks: tasks.sort((left, right) => left.priority - right.priority),
      totalPages: uniquePages.length,
      totalMinutes,
      focusLabel,
    });
  }

  return {
    weekLabel: `${format(days[0], "d MMM", { locale: arSA })} - ${format(days.at(-1) ?? days[6], "d MMM", {
      locale: arSA,
    })}`,
    totalPlannedPages: plannedDays.reduce((total, day) => total + day.totalPages, 0),
    totalPlannedMinutes: plannedDays.reduce((total, day) => total + day.totalMinutes, 0),
    reviewDaysCount: plannedDays.filter((day) => day.isReviewDay).length,
    memorizationDaysCount: plannedDays.filter((day) => day.isMemorizationDay).length,
    days: plannedDays,
    highlights: [
      reviewEngine.overduePages.length
        ? `هناك ${reviewEngine.overduePages.length} صفحات متأخرة ينبغي سحبها إلى أول يوم مراجعة.`
        : "لا توجد صفحات متأخرة الآن، ويمكن توزيع الأسبوع بهدوء أكبر.",
      reviewEngine.weakPages.length
        ? `الصفحات الضعيفة موزعة على ${reviewDayCount} أيام مراجعة لتقليل التراكم.`
        : "طابور الضعف خفيف هذا الأسبوع ويمكن التركيز على التثبيت العام.",
      `متوسط الحفظ المقترح في أيام الحفظ القادمة هو ${averageMemPages} صفحة في الجلسة.`,
    ],
  } satisfies WeeklyPlanner;
}
