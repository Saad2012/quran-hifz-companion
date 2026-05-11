import { TOTAL_QURAN_PAGES, getSurahByPage } from "@/data/quran-meta";
import { buildAnalytics } from "@/lib/analytics";
import { buildNextActionSuggestion } from "@/lib/domain/next-action";
import { buildRecoveryPlan } from "@/lib/domain/recovery-plan";
import { buildReports } from "@/lib/domain/reports";
import { buildReviewEngine } from "@/lib/domain/review-engine";
import { buildWeakPageInsights } from "@/lib/domain/weak-pages";
import { buildWeeklyPlanner } from "@/lib/domain/weekly-planner";
import { buildPageStates } from "@/lib/domain/page-state";
import {
  AnalyticsBundle,
  DashboardSnapshot,
  PageState,
  PersistedAppData,
  ReviewEngineOutput,
  SmartAlert,
  WeakPageInsight,
  WeeklyPlanner,
  RecoveryPlan,
  DerivedAppData,
} from "@/types";
import { getTodayDateKey } from "@/utils/date";

function buildSmartAlerts(
  dashboard: Omit<DashboardSnapshot, "smartAlerts" | "nextAction">,
  derived: {
    analytics: AnalyticsBundle;
    reviewEngine: ReviewEngineOutput;
    recoveryPlan: RecoveryPlan;
  },
): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  if (derived.recoveryPlan.isNeeded) {
    alerts.push({
      id: "recovery",
      tone: "warning",
      title: "خطة تعافٍ مقترحة",
      message: `مرّ ${derived.recoveryPlan.gapDays} أيام منذ آخر جلسة، والأفضل الآن الدخول عبر وضع التركيز بدل العودة العشوائية.`,
    });
  }

  if (derived.reviewEngine.overduePages.length) {
    alerts.push({
      id: "overdue",
      tone: "warning",
      title: "صفحات متأخرة تحتاج تدخلًا",
      message: `هناك ${derived.reviewEngine.overduePages.length} صفحات تجاوزت السقف الآمن للمراجعة.`,
    });
  }

  if (dashboard.todayReviewPages > 18) {
    alerts.push({
      id: "load",
      tone: "info",
      title: "حجم مراجعة مرتفع اليوم",
      message: "يناسبك البدء بالنسخة العادية أو الموسعة لتقليل التراكم القادم.",
    });
  }

  if (derived.analytics.metrics.currentStreak >= 7) {
    alerts.push({
      id: "streak",
      tone: "success",
      title: "سلسلة التزام قوية",
      message: `أنت على سلسلة من ${derived.analytics.metrics.currentStreak} أيام نشطة متتالية.`,
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: "steady",
      tone: "success",
      title: "الوضع مستقر",
      message: "لا توجد إشارات خطر كبيرة الآن، ويمكنك المحافظة على الإيقاع الحالي.",
    });
  }

  return alerts.slice(0, 3);
}

function buildDashboard(
  data: PersistedAppData,
  pageStates: PageState[],
  reviewEngine: ReviewEngineOutput,
  analytics: AnalyticsBundle,
  weakPageInsights: WeakPageInsight[],
  weeklyPlanner: WeeklyPlanner,
  recoveryPlan: RecoveryPlan,
): DashboardSnapshot {
  const memorizedPages = pageStates.filter((page) => page.memorized);
  const currentPage = memorizedPages.at(-1)?.pageNumber ?? 0;
  const currentSegment = data.segments.find(
    (segment) => currentPage >= segment.startPage && currentPage <= segment.endPage,
  );
  const nextStop = data.stopSessions.find((stop) => !stop.completed);
  const estimatedCompletionDate = analytics.metrics.estimatedCompletionDate;
  const todayReviewPages = reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].totalPages;
  const reviewVolume = todayReviewPages > 18 ? "high" : todayReviewPages > 10 ? "balanced" : "low";
  const projectHealth =
    reviewEngine.criticalPages.length > 8
      ? "at-risk"
      : reviewEngine.weakPages.length > 10
        ? "busy"
        : "steady";
  const baseDashboard = {
    currentPage,
    completionRatio: currentPage ? currentPage / TOTAL_QURAN_PAGES : 0,
    currentSurah: currentPage ? getSurahByPage(currentPage).name : "لم يبدأ بعد",
    currentJuzApprox: currentPage ? Math.min(30, Math.ceil(currentPage / 20)) : 1,
    currentSegment,
    nextStop,
    remainingPages: TOTAL_QURAN_PAGES - currentPage,
    todayReviewPages,
    weakPagesCount: reviewEngine.weakPages.length,
    projectHealth,
    currentStreak: analytics.metrics.currentStreak,
    lastSession: [...data.sessions].sort((left, right) => right.date.localeCompare(left.date))[0],
    estimatedCompletionDate,
    reviewVolume,
  } as Omit<DashboardSnapshot, "smartAlerts" | "nextAction">;
  const nextAction = buildNextActionSuggestion(
    data,
    reviewEngine,
    weakPageInsights,
    weeklyPlanner,
    analytics,
    recoveryPlan,
  );

  return {
    ...baseDashboard,
    smartAlerts: buildSmartAlerts(baseDashboard, { analytics, reviewEngine, recoveryPlan }),
    nextAction,
  };
}

export function deriveAppData(
  data: PersistedAppData,
  todayDateKey = getTodayDateKey(),
): DerivedAppData {
  const pageStates = buildPageStates(data, todayDateKey);
  const reviewEngine = buildReviewEngine(data, pageStates, todayDateKey);
  const analytics = buildAnalytics(data, pageStates, reviewEngine, todayDateKey);
  const reports = buildReports(data, analytics, reviewEngine);
  const weakPageInsights = buildWeakPageInsights(data, pageStates, todayDateKey);
  const weeklyPlanner = buildWeeklyPlanner(data, reviewEngine, todayDateKey);
  const recoveryPlan = buildRecoveryPlan(data, reviewEngine, weeklyPlanner, todayDateKey);

  return {
    pageStates,
    reviewEngine,
    analytics,
    reports,
    weakPageInsights,
    weeklyPlanner,
    recoveryPlan,
    dashboard: buildDashboard(
      data,
      pageStates,
      reviewEngine,
      analytics,
      weakPageInsights,
      weeklyPlanner,
      recoveryPlan,
    ),
  };
}
