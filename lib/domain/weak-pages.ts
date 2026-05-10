import { PersistedAppData, PageState, WeakPageInsight } from "@/types";
import { daysBetween, getTodayDateKey } from "@/utils/date";

function buildReasons(
  data: PersistedAppData,
  pageState: PageState,
  daysSinceLastReview: number,
) {
  const reasons: string[] = [];

  if (pageState.status === "overdue" || daysSinceLastReview > data.settings.maxDaysWithoutReview) {
    reasons.push("تجاوزت الحد الآمن بدون مراجعة حديثة.");
  }

  if (pageState.totalWeakCount >= 2) {
    reasons.push("تكرر ظهورها ضمن الصفحات الضعيفة أكثر من مرة.");
  } else if (pageState.totalWeakCount === 1) {
    reasons.push("ظهرت فيها إشارة ضعف تحتاج علاجًا مبكرًا.");
  }

  if (pageState.lastTestedAt) {
    reasons.push("دخلت اختبارات سابقًا ويُفضّل تثبيتها قبل الاختبار التالي.");
  }

  if (pageState.strengthScore < 50) {
    reasons.push("درجة القوة الحالية منخفضة نسبيًا.");
  }

  if (!reasons.length) {
    reasons.push("وجودها في طابور الضعف يعني أنها تستحق مرورًا مركزًا الآن.");
  }

  return reasons;
}

function buildRecommendedAction(pageState: PageState, daysSinceLastReview: number) {
  if (pageState.status === "overdue" || daysSinceLastReview >= 14) {
    return "ابدأ بها قبل الدفعة الأساسية اليوم، ثم أعد أطرافها مرة ثانية من الذاكرة.";
  }

  if (pageState.status === "critical") {
    return "خصص لها مراجعة قصيرة مركزة مع تكرار أعلى من المعتاد ثم اختبر مواضع الانتقال.";
  }

  return "أدخلها داخل مراجعة اليوم وأضف لها دورتين إضافيتين من التكرار الهادئ.";
}

export function buildWeakPageInsights(
  data: PersistedAppData,
  pageStates: PageState[],
  todayDateKey = getTodayDateKey(),
) {
  const sessionPool = [...data.sessions].sort((left, right) => right.date.localeCompare(left.date));
  const testPool = [...data.testRecords].sort((left, right) => right.date.localeCompare(left.date));

  const statusOrder: Record<WeakPageInsight["status"], number> = {
    overdue: 0,
    critical: 1,
    weak: 2,
  };

  return pageStates
    .filter(
      (
        pageState,
      ): pageState is PageState & {
        surahLabel: string;
        juzApprox: number;
        status: WeakPageInsight["status"];
      } =>
        pageState.memorized &&
        (pageState.status === "weak" || pageState.status === "critical" || pageState.status === "overdue") &&
        Boolean(pageState.surahLabel) &&
        Boolean(pageState.juzApprox),
    )
    .map((pageState) => {
      const daysSinceLastReview = pageState.lastReviewedAt
        ? daysBetween(todayDateKey, pageState.lastReviewedAt)
        : data.settings.maxDaysWithoutReview + 7;
      const relatedSessions = sessionPool.filter(
        (session) => session.startPage <= pageState.pageNumber && session.endPage >= pageState.pageNumber,
      );
      const relatedTests = testPool.filter(
        (record) =>
          (record.startPage <= pageState.pageNumber && record.endPage >= pageState.pageNumber) ||
          record.weakPages.includes(pageState.pageNumber),
      );
      const recentSessionNotes = [
        ...relatedSessions.map((session) => session.notes),
        ...relatedTests.map((record) => record.notes),
      ]
        .filter(Boolean)
        .slice(0, 3);

      return {
        pageNumber: pageState.pageNumber,
        surahLabel: pageState.surahLabel,
        juzApprox: pageState.juzApprox,
        status: pageState.status,
        strengthScore: pageState.strengthScore,
        totalReviewCount: pageState.totalReviewCount,
        totalWeakCount: pageState.totalWeakCount,
        daysSinceLastReview,
        lastReviewedAt: pageState.lastReviewedAt,
        lastTestedAt: pageState.lastTestedAt,
        reasons: buildReasons(data, pageState, daysSinceLastReview),
        recommendedAction: buildRecommendedAction(pageState, daysSinceLastReview),
        recentSessionNotes,
      } satisfies WeakPageInsight;
    })
    .sort((left, right) => {
      const statusDelta = statusOrder[left.status] - statusOrder[right.status];
      if (statusDelta !== 0) {
        return statusDelta;
      }

      if (right.totalWeakCount !== left.totalWeakCount) {
        return right.totalWeakCount - left.totalWeakCount;
      }

      if (right.daysSinceLastReview !== left.daysSinceLastReview) {
        return right.daysSinceLastReview - left.daysSinceLastReview;
      }

      return left.pageNumber - right.pageNumber;
    });
}
