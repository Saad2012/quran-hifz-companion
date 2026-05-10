import { TOTAL_QURAN_PAGES } from "@/data/quran-meta";
import {
  AnalyticsBundle,
  NextActionSuggestion,
  PersistedAppData,
  ReviewEngineOutput,
  WeakPageInsight,
  WeeklyPlanner,
} from "@/types";
import { getTodayDateKey } from "@/utils/date";

export function buildNextActionSuggestion(
  data: PersistedAppData,
  reviewEngine: ReviewEngineOutput,
  weakPageInsights: WeakPageInsight[],
  weeklyPlanner: WeeklyPlanner,
  analytics: AnalyticsBundle,
  todayDateKey = getTodayDateKey(),
): NextActionSuggestion {
  const hasSessionToday = data.sessions.some((session) => session.date === todayDateKey);
  const memorizedMaxPage =
    data.sessions
      .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.endPage ?? 0;

  if (reviewEngine.overduePages.length) {
    return {
      id: "rescue-overdue",
      title: "أنقذ الصفحات المتأخرة أولًا",
      description: "ابدأ الآن بجلسة مراجعة قصيرة للصفحات التي تجاوزت الحد الآمن.",
      reason: "لأن الصفحات المتأخرة هي أعلى نقطة خطر حاليًا وتؤثر على استقرار المشروع كله.",
      targetHref: "/weak-pages",
      cta: "افتح مركز الصفحات الضعيفة",
      urgency: "high",
      estimatedMinutes: 18,
      pageNumbers: reviewEngine.overduePages.slice(0, 6),
    };
  }

  if (reviewEngine.criticalPages.length >= 4) {
    return {
      id: "stabilize-critical",
      title: "ثبّت الصفحات الحرجة الآن",
      description: "لديك مجموعة حرجة تحتاج مرورًا مركزًا قبل أن تتحول إلى تأخر فعلي.",
      reason: "العدد الحرج الحالي مرتفع نسبيًا، والمرور عليها الآن أسهل من علاجها بعد أيام.",
      targetHref: "/weak-pages",
      cta: "اذهب إلى الصفحات الضعيفة",
      urgency: "high",
      estimatedMinutes: 20,
      pageNumbers: reviewEngine.criticalPages.slice(0, 8),
    };
  }

  if (!hasSessionToday && reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].totalPages > 0) {
    return {
      id: "start-today-review",
      title: "ابدأ خطة مراجعة اليوم",
      description: "أفضل خطوة الآن هي تنفيذ خطة اليوم بالوضع الذي أوصى به المحرك.",
      reason: "لا توجد جلسة مسجلة اليوم بعد، وخطة اليوم جاهزة بالفعل.",
      targetHref: "/review",
      cta: "افتح مراجعة اليوم",
      urgency: "medium",
      estimatedMinutes: reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].tasks.reduce(
        (total, task) => total + task.estimatedMinutes,
        0,
      ),
      pageNumbers: reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].tasks
        .flatMap((task) => task.pageNumbers)
        .slice(0, 10),
    };
  }

  const nextPlannedMemorization = weeklyPlanner.days.find(
    (day) =>
      day.plannedTasks.some((task) => task.type === "memorization") && memorizedMaxPage < TOTAL_QURAN_PAGES,
  );

  if (nextPlannedMemorization) {
    const memTask = nextPlannedMemorization.plannedTasks.find((task) => task.type === "memorization");

    return {
      id: "continue-memorization",
      title: "هيّئ جلسة الحفظ القادمة",
      description: "المسار الأسبوعي مناسب الآن لإضافة جلسة حفظ جديدة بدون ضغط مفرط على المراجعة.",
      reason: "حجم المراجعة ليس في حالة إنذار، لذلك التقدم في الحفظ الجديد منطقي الآن.",
      targetHref: "/planner",
      cta: "افتح التخطيط الأسبوعي",
      urgency: "medium",
      estimatedMinutes: memTask?.estimatedMinutes ?? 30,
      pageNumbers: memTask?.pageNumbers ?? [],
    };
  }

  if (!data.testRecords.length || analytics.metrics.averageTestScore < 85) {
    return {
      id: "schedule-test",
      title: "سجّل اختبارًا قصيرًا هذا الأسبوع",
      description: "اختبار صغير الآن سيعطيك قياسًا أوضح للتحسن ويكشف أي ضعف مخفي.",
      reason: "الاختبارات هي أسرع طريقة لتأكيد أن المراجعة تتحول إلى تثبيت فعلي.",
      targetHref: "/tests",
      cta: "اذهب إلى الاختبارات",
      urgency: "low",
      estimatedMinutes: 12,
      pageNumbers: weakPageInsights.slice(0, 4).map((page) => page.pageNumber),
    };
  }

  return {
    id: "review-week-plan",
    title: "راجع خطة الأسبوع واضبطها",
    description: "الوضع الحالي مستقر، وأفضل خطوة الآن هي مراجعة الأسبوع القادم مسبقًا.",
    reason: "عندما يكون الوضع مستقرًا، فالتخطيط المسبق يعطيك أفضلية كبيرة في الاستمرارية.",
    targetHref: "/planner",
    cta: "افتح التخطيط الأسبوعي",
    urgency: "low",
    estimatedMinutes: 8,
    pageNumbers: [],
  };
}
