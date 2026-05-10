import {
  addMonths,
  differenceInCalendarDays,
  differenceInWeeks,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { arSA } from "date-fns/locale";

import { TOTAL_QURAN_PAGES, getJuzApproxByPage } from "@/data/quran-meta";
import { PageState, PersistedAppData, ReviewEngineOutput, AnalyticsBundle, MonthlyProgressPoint, MetricPoint } from "@/types";
import { daysBetween, formatDateLabel, getTodayDateKey } from "@/utils/date";
import { clamp, percentage, range, uniqueSortedNumbers } from "@/utils/pages";

function reviewLikePages(data: PersistedAppData) {
  return data.sessions
    .filter((session) => ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
    .reduce((total, session) => total + session.pagesCount, 0);
}

function countCoverage(pageStates: PageState[], days: number, todayKey: string) {
  const memorized = pageStates.filter((page) => page.memorized);

  return percentage(
    memorized.filter((page) => page.lastReviewedAt && daysBetween(todayKey, page.lastReviewedAt) <= days).length,
    memorized.length,
  );
}

function groupByMonth(
  data: PersistedAppData,
  months = 6,
): MonthlyProgressPoint[] {
  const start = startOfMonth(subMonths(new Date(), months - 1));
  const end = endOfMonth(new Date());

  return eachMonthOfInterval({ start, end }).map((month) => {
    const key = format(month, "yyyy-MM");
    const memorized = data.sessions
      .filter((session) => session.date.startsWith(key) && ["memorization", "mixed"].includes(session.sessionType))
      .reduce((total, session) => total + session.pagesCount, 0);
    const reviewed =
      data.sessions
        .filter((session) => session.date.startsWith(key) && ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
        .reduce((total, session) => total + session.pagesCount, 0) +
      data.testRecords
        .filter((record) => record.date.startsWith(key))
        .reduce((total, record) => total + (record.endPage - record.startPage + 1), 0);

    return {
      month: format(month, "MMM", { locale: arSA }),
      memorized,
      reviewed,
    };
  });
}

function buildActiveDaySet(data: PersistedAppData) {
  return new Set([
    ...data.sessions.map((session) => session.date),
    ...data.testRecords.map((record) => record.date),
  ]);
}

function buildStreaks(activeDays: string[]) {
  if (!activeDays.length) {
    return { current: 0, best: 0 };
  }

  const sorted = [...new Set(activeDays)].sort();
  let best = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const next = sorted[index];
    const delta = differenceInCalendarDays(
      new Date(`${next}T00:00:00`),
      new Date(`${previous}T00:00:00`),
    );

    if (delta === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  let currentTail = 0;
  const today = new Date();
  let cursor = 0;

  while (true) {
    const key = format(subDays(today, cursor), "yyyy-MM-dd");
    if (!sorted.includes(key)) {
      break;
    }
    currentTail += 1;
    cursor += 1;
  }

  return {
    current: currentTail,
    best,
  };
}

function buildCumulativeProgress(data: PersistedAppData) {
  const memorizedSet = new Set<number>();
  let reviewedPages = 0;
  const points: AnalyticsBundle["charts"]["cumulativeProgress"] = [];
  const sessions = [...data.sessions].sort((left, right) => left.date.localeCompare(right.date));

  for (const session of sessions) {
    if (["memorization", "mixed"].includes(session.sessionType)) {
      range(session.startPage, session.endPage).forEach((pageNumber) => memorizedSet.add(pageNumber));
    }

    if (["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType)) {
      reviewedPages += session.pagesCount;
    }

    points.push({
      date: session.date,
      memorizedPages: memorizedSet.size,
      reviewedPages,
    });
  }

  return points;
}

function buildWeeklyComparison(data: PersistedAppData) {
  const sessions = [...data.sessions].sort((left, right) => left.date.localeCompare(right.date));
  const weeks = new Map<string, { memorization: number; review: number }>();

  sessions.forEach((session) => {
    const week = format(new Date(`${session.date}T00:00:00`), "w");
    const bucket = weeks.get(week) ?? { memorization: 0, review: 0 };

    if (["memorization", "mixed"].includes(session.sessionType)) {
      bucket.memorization += session.pagesCount;
    }

    if (["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType)) {
      bucket.review += session.pagesCount;
    }

    weeks.set(week, bucket);
  });

  return Array.from(weeks.entries())
    .slice(-10)
    .map(([week, values]) => ({
      week: `أسبوع ${week}`,
      memorization: values.memorization,
      review: values.review,
    }));
}

function buildActivityHeatmap(data: PersistedAppData) {
  const last90Days = Array.from({ length: 90 }, (_, index) => subDays(new Date(), 89 - index));
  return last90Days.map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const daySessions = data.sessions.filter((session) => session.date === key);
    const memorizationPages = daySessions
      .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
      .reduce((total, session) => total + session.pagesCount, 0);
    const reviewPages =
      daySessions
        .filter((session) => ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
        .reduce((total, session) => total + session.pagesCount, 0) +
      data.testRecords
        .filter((record) => record.date === key)
        .reduce((total, record) => total + (record.endPage - record.startPage + 1), 0);
    const intensity = clamp(Math.round((memorizationPages + reviewPages) / 4), 0, 5);

    return {
      date: key,
      intensity,
      memorizationPages,
      reviewPages,
      sessions: daySessions.length,
    };
  });
}

function buildPageAgeDistribution(pageStates: PageState[], todayKey: string) {
  const buckets = new Map<string, number>([
    ["0-3 أيام", 0],
    ["4-7 أيام", 0],
    ["8-12 يومًا", 0],
    ["13-20 يومًا", 0],
    ["21+ يومًا", 0],
  ]);

  pageStates
    .filter((page) => page.memorized)
    .forEach((page) => {
      const age = page.lastReviewedAt ? daysBetween(todayKey, page.lastReviewedAt) : 30;

      if (age <= 3) {
        buckets.set("0-3 أيام", (buckets.get("0-3 أيام") ?? 0) + 1);
      } else if (age <= 7) {
        buckets.set("4-7 أيام", (buckets.get("4-7 أيام") ?? 0) + 1);
      } else if (age <= 12) {
        buckets.set("8-12 يومًا", (buckets.get("8-12 يومًا") ?? 0) + 1);
      } else if (age <= 20) {
        buckets.set("13-20 يومًا", (buckets.get("13-20 يومًا") ?? 0) + 1);
      } else {
        buckets.set("21+ يومًا", (buckets.get("21+ يومًا") ?? 0) + 1);
      }
    });

  return Array.from(buckets.entries()).map(([bucket, count]) => ({ bucket, count }));
}

function buildWeakDistribution(pageStates: PageState[]): MetricPoint[] {
  const counts = new Map<number, number>();

  pageStates
    .filter((page) => page.inWeakQueue)
    .forEach((page) => {
      const juz = getJuzApproxByPage(page.pageNumber);
      counts.set(juz, (counts.get(juz) ?? 0) + 1);
    });

  return Array.from(counts.entries()).map(([juz, value]) => ({
    label: `جزء ${juz}`,
    value,
  }));
}

function buildStrengthDistribution(pageStates: PageState[]) {
  const labels = [
    { key: "fresh", label: "حديثة" },
    { key: "stable", label: "مستقرة" },
    { key: "strong", label: "قوية" },
    { key: "weak", label: "ضعيفة" },
    { key: "critical", label: "حرجة" },
    { key: "overdue", label: "متأخرة" },
  ] as const;

  return labels.map(({ key, label }) => ({
    label,
    value: pageStates.filter((page) => page.status === key).length,
  }));
}

function buildForecastCompletion(pageStates: PageState[], settingsYears: number) {
  const memorizedCount = pageStates.filter((page) => page.memorized).length;
  const activeDays = Math.max(1, differenceInWeeks(new Date(), subMonths(new Date(), 4)));
  const currentWeeklyRate = memorizedCount / activeDays;
  const targetWeeklyRate = TOTAL_QURAN_PAGES / (settingsYears * 52);

  return Array.from({ length: 6 }, (_, index) => {
    const month = addMonths(new Date(), index);
    const label = format(month, "MMM", { locale: arSA });
    const actual = clamp(Math.round(memorizedCount + currentWeeklyRate * 4 * index), 0, TOTAL_QURAN_PAGES);
    const target = clamp(Math.round(memorizedCount + targetWeeklyRate * 4 * index), 0, TOTAL_QURAN_PAGES);

    return { label, actual, target };
  });
}

function buildRadarPerformance(
  coverage7: number,
  coverage14: number,
  pageStates: PageState[],
  averageTestScore: number,
  currentStreak: number,
  tajweedNotesCount: number,
) {
  const strongShare = percentage(
    pageStates.filter((page) => ["strong", "stable"].includes(page.status)).length,
    pageStates.filter((page) => page.memorized).length,
  );
  const tajweedScore = clamp(100 - tajweedNotesCount * 4, 45, 95);

  return [
    { dimension: "التغطية 7 أيام", score: coverage7 },
    { dimension: "التغطية 14 يومًا", score: coverage14 },
    { dimension: "القوة العامة", score: strongShare },
    { dimension: "الاختبارات", score: Math.round(averageTestScore) },
    { dimension: "الالتزام", score: clamp(currentStreak * 8, 0, 100) },
    { dimension: "التجويد", score: tajweedScore },
  ];
}

export function buildAnalytics(
  data: PersistedAppData,
  pageStates: PageState[],
  reviewEngine: ReviewEngineOutput,
  todayKey = getTodayDateKey(),
): AnalyticsBundle {
  const memorizedPages = pageStates.filter((page) => page.memorized);
  const totalMemorizedPages = memorizedPages.length;
  const totalReviewedPages = reviewLikePages(data);
  const totalSessions = data.sessions.length;
  const totalReviewSessions = data.sessions.filter((session) =>
    ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType),
  ).length;
  const totalMemorizationSessions = data.sessions.filter((session) =>
    ["memorization", "mixed"].includes(session.sessionType),
  ).length;
  const averageSessionDuration = totalSessions
    ? Math.round(data.sessions.reduce((total, session) => total + session.durationMinutes, 0) / totalSessions)
    : 0;
  const activeDays = buildActiveDaySet(data);
  const activeDayList = [...activeDays];
  const streaks = buildStreaks(activeDayList);
  const totalTests = data.testRecords.length;
  const averageTestScore = totalTests
    ? data.testRecords.reduce((total, record) => total + record.score, 0) / totalTests
    : 0;

  const firstActivityDate = activeDayList[0] ? new Date(`${activeDayList[0]}T00:00:00`) : new Date();
  const activeWeeks = Math.max(1, differenceInWeeks(new Date(), firstActivityDate) + 1);
  const totalMemorizedActivity = data.sessions
    .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
    .reduce((total, session) => total + session.pagesCount, 0);
  const totalReviewActivity = data.sessions
    .filter((session) => ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
    .reduce((total, session) => total + session.pagesCount, 0);

  const reviewCoverage7Days = countCoverage(pageStates, 7, todayKey);
  const reviewCoverage14Days = countCoverage(pageStates, 14, todayKey);
  const reviewCoverage30Days = countCoverage(pageStates, 30, todayKey);
  const monthlyProgress = groupByMonth(data, 6);
  const quarterlyProgress = groupByMonth(data, 4);
  const yearlyProgress = groupByMonth(data, 12);
  const pageAgeDistribution = buildPageAgeDistribution(pageStates, todayKey);
  const weakDistribution = buildWeakDistribution(pageStates);
  const strengthDistribution = buildStrengthDistribution(pageStates);
  const mostWeakPages = [...pageStates]
    .filter((page) => page.totalWeakCount > 0)
    .sort((left, right) => right.totalWeakCount - left.totalWeakCount || left.pageNumber - right.pageNumber)
    .slice(0, 8);
  const strongestPages = [...pageStates]
    .filter((page) => page.memorized)
    .sort((left, right) => right.strengthScore - left.strengthScore)
    .slice(0, 8);

  const forecastCompletion = buildForecastCompletion(pageStates, data.settings.targetYears);
  const estimatedCompletionDate =
    totalMemorizedActivity > 0
      ? format(
          addMonths(new Date(), Math.ceil((TOTAL_QURAN_PAGES - totalMemorizedPages) / Math.max(1, totalMemorizedActivity / activeWeeks / 4))),
          "yyyy-MM-dd",
        )
      : undefined;

  const segmentCompletion = data.segments.map((segment) => {
    const completed = memorizedPages.filter(
      (page) => page.pageNumber >= segment.startPage && page.pageNumber <= segment.endPage,
    ).length;

    return {
      label: segment.label,
      completed,
      remaining: Math.max(0, segment.pagesCount - completed),
    };
  });

  const stopHistory = data.stopSessions.map((stop) => ({
    label: data.segments.find((segment) => segment.id === stop.segmentId)?.label ?? stop.segmentId,
    plannedDays: Math.max(1, daysBetween(stop.plannedEnd, stop.plannedStart)),
    actualDays:
      stop.actualStart && stop.actualEnd ? Math.max(1, daysBetween(stop.actualEnd, stop.actualStart)) : 0,
  }));

  const testScoreTrend = data.testRecords.map((record) => ({
    date: formatDateLabel(record.date, "d MMM"),
    score: record.score,
    errors: record.errorsCount,
  }));

  const streakHistory = Array.from({ length: 10 }, (_, index) => {
    const end = subDays(new Date(), (9 - index) * 7);
    const start = subDays(end, 6);
    const activeCount = activeDayList.filter((day) => {
      const date = new Date(`${day}T00:00:00`);
      return date >= start && date <= end;
    }).length;

    return {
      week: format(end, "MMM d", { locale: arSA }),
      streak: activeCount,
    };
  });

  return {
    metrics: {
      totalMemorizedPages,
      totalReviewedPages,
      totalSessions,
      totalReviewSessions,
      totalMemorizationSessions,
      averagePagesPerWeek: Math.round(totalMemorizedActivity / activeWeeks),
      averageReviewPagesPerWeek: Math.round(totalReviewActivity / activeWeeks),
      averageSessionDuration,
      totalWeakPages: pageStates.filter((page) => page.inWeakQueue).length,
      totalCriticalPages: pageStates.filter((page) => page.inCriticalQueue).length,
      totalTests,
      averageTestScore,
      bestStreak: streaks.best,
      currentStreak: streaks.current,
      missedDays: Math.max(0, 30 - buildActivityHeatmap(data).slice(-30).filter((day) => day.sessions > 0).length),
      completedStops: data.stopSessions.filter((stop) => stop.completed).length,
      estimatedCompletionDate,
      monthlyProgress,
      quarterlyProgress,
      yearlyProgress,
      reviewCoverage7Days,
      reviewCoverage14Days,
      reviewCoverage30Days,
      pagesAtRisk: uniqueSortedNumbers([...reviewEngine.criticalPages, ...reviewEngine.overduePages]).length,
      strengthDistribution,
      mostWeakPages,
      strongestPages,
      reviewVolumeForecast: reviewEngine.upcomingReviewLoad.map((point) => ({
        date: point.date,
        duePages: point.pages,
        weakPages: point.weakPages,
        criticalPages: point.criticalPages,
      })),
    },
    charts: {
      cumulativeProgress: buildCumulativeProgress(data),
      weeklyComparison: buildWeeklyComparison(data),
      monthlyProgress,
      activityHeatmap: buildActivityHeatmap(data),
      reviewCoverage: [
        { label: "7 أيام", coverage: reviewCoverage7Days },
        { label: "14 يومًا", coverage: reviewCoverage14Days },
        { label: "30 يومًا", coverage: reviewCoverage30Days },
      ],
      pageAgeDistribution,
      weakDistribution,
      strengthDistribution,
      forecastCompletion,
      reviewVolumeForecast: reviewEngine.upcomingReviewLoad.map((point) => ({
        date: formatDateLabel(point.date),
        duePages: point.pages,
        weakPages: point.weakPages,
        criticalPages: point.criticalPages,
      })),
      streakHistory,
      radarPerformance: buildRadarPerformance(
        reviewCoverage7Days,
        reviewCoverage14Days,
        pageStates,
        averageTestScore,
        streaks.current,
        data.tajweedNotes.filter((note) => !note.resolved).length,
      ),
      segmentCompletion,
      stopHistory,
      testScoreTrend,
    },
  };
}
