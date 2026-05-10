import { TOTAL_QURAN_PAGES, getJuzApproxByPage, getSurahByPage } from "@/data/quran-meta";
import { PersistedAppData, PageState } from "@/types";
import { daysBetween, getTodayDateKey } from "@/utils/date";
import { clamp, range, uniqueSortedNumbers } from "@/utils/pages";

function createEmptyPageState(pageNumber: number): PageState {
  return {
    pageNumber,
    memorized: false,
    totalReviewCount: 0,
    totalWeakCount: 0,
    strengthScore: 0,
    status: "not_started",
    inWeakQueue: false,
    inCriticalQueue: false,
    surahLabel: getSurahByPage(pageNumber).name,
    juzApprox: getJuzApproxByPage(pageNumber),
  };
}

export function buildPageStates(
  data: PersistedAppData,
  todayDateKey = getTodayDateKey(),
) {
  const pageMap = new Map<number, PageState>();
  const qualityAccumulator = new Map<number, number>();
  const unresolvedTajweedCount = new Map<number, number>();
  const pageNotes = new Map<number, string[]>();

  for (let pageNumber = 1; pageNumber <= TOTAL_QURAN_PAGES; pageNumber += 1) {
    pageMap.set(pageNumber, createEmptyPageState(pageNumber));
  }

  const sortedSessions = [...data.sessions].sort((left, right) => left.date.localeCompare(right.date));

  for (const session of sortedSessions) {
    const pages = range(session.startPage, session.endPage);
    const isMemorizationSession = ["memorization", "mixed"].includes(session.sessionType);
    const isReviewTouch =
      ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType) ||
      session.reviewedFromMemory;

    for (const pageNumber of pages) {
      const pageState = pageMap.get(pageNumber);

      if (!pageState) {
        continue;
      }

      if (isMemorizationSession) {
        pageState.memorized = true;
        pageState.firstMemorizedAt =
          !pageState.firstMemorizedAt || session.date < pageState.firstMemorizedAt
            ? session.date
            : pageState.firstMemorizedAt;
      }

      if (isReviewTouch && pageState.memorized) {
        pageState.lastReviewedAt =
          !pageState.lastReviewedAt || session.date > pageState.lastReviewedAt
            ? session.date
            : pageState.lastReviewedAt;
        pageState.totalReviewCount += 1;
      }

      if (session.tested) {
        pageState.lastTestedAt = session.date;
      }

      const qualityDelta =
        session.qualityRating * 2.5 - session.difficultyRating * 1.4 + session.repetitions * 0.6;
      qualityAccumulator.set(pageNumber, (qualityAccumulator.get(pageNumber) ?? 0) + qualityDelta);
    }

    for (const weakPage of uniqueSortedNumbers(session.weakPagesDiscovered)) {
      const pageState = pageMap.get(weakPage);

      if (!pageState) {
        continue;
      }

      pageState.totalWeakCount += 1;
      pageNotes.set(
        weakPage,
        [...(pageNotes.get(weakPage) ?? []), `ضعف ظهر في جلسة ${session.date}`],
      );
    }
  }

  for (const record of data.testRecords) {
    const pages = range(record.startPage, record.endPage);

    for (const pageNumber of pages) {
      const pageState = pageMap.get(pageNumber);

      if (!pageState?.memorized) {
        continue;
      }

      pageState.lastReviewedAt = !pageState.lastReviewedAt || record.date > pageState.lastReviewedAt ? record.date : pageState.lastReviewedAt;
      pageState.lastTestedAt = record.date;
      pageState.totalReviewCount += 1;
      qualityAccumulator.set(pageNumber, (qualityAccumulator.get(pageNumber) ?? 0) + record.score / 12);
    }

    for (const weakPage of uniqueSortedNumbers(record.weakPages)) {
      const pageState = pageMap.get(weakPage);

      if (!pageState) {
        continue;
      }

      pageState.totalWeakCount += 1;
      pageNotes.set(
        weakPage,
        [...(pageNotes.get(weakPage) ?? []), `دخلت قائمة الضعف بعد اختبار ${record.date}`],
      );
    }
  }

  for (const note of data.tajweedNotes) {
    unresolvedTajweedCount.set(
      note.pageNumber,
      (unresolvedTajweedCount.get(note.pageNumber) ?? 0) + (note.resolved ? 0 : 1),
    );

    if (!note.resolved) {
      pageNotes.set(
        note.pageNumber,
        [...(pageNotes.get(note.pageNumber) ?? []), `ملاحظة تجويد ${note.category}`],
      );
    }
  }

  return Array.from(pageMap.values()).map((pageState) => {
    if (!pageState.memorized) {
      return pageState;
    }

    const daysSinceReview = pageState.lastReviewedAt
      ? daysBetween(todayDateKey, pageState.lastReviewedAt)
      : data.settings.maxDaysWithoutReview + 4;
    const daysSinceMemorized = pageState.firstMemorizedAt
      ? daysBetween(todayDateKey, pageState.firstMemorizedAt)
      : 0;
    const reviewBoost = Math.min(pageState.totalReviewCount * 6, 34);
    const weaknessPenalty = pageState.totalWeakCount * 11;
    const tajweedPenalty = (unresolvedTajweedCount.get(pageState.pageNumber) ?? 0) * 5;
    const qualityBoost = Math.min((qualityAccumulator.get(pageState.pageNumber) ?? 0) / 3, 16);
    const freshnessBonus = daysSinceMemorized <= 7 ? 8 : daysSinceMemorized <= 14 ? 4 : 0;
    const agePenalty =
      daysSinceReview > data.settings.maxDaysWithoutReview
        ? 18 + (daysSinceReview - data.settings.maxDaysWithoutReview) * 1.8
        : daysSinceReview * 1.25;

    const strengthScore = clamp(
      Math.round(56 + reviewBoost + qualityBoost + freshnessBonus - weaknessPenalty - tajweedPenalty - agePenalty),
      0,
      100,
    );

    let status: PageState["status"] = "stable";

    if (daysSinceReview > data.settings.maxDaysWithoutReview + 5 || strengthScore < 35) {
      status = "overdue";
    } else if (daysSinceReview > data.settings.maxDaysWithoutReview || strengthScore < 48) {
      status = "critical";
    } else if (pageState.totalWeakCount > 0 || strengthScore < 62) {
      status = "weak";
    } else if (daysSinceMemorized <= 14) {
      status = "fresh";
    } else if (strengthScore >= 82) {
      status = "strong";
    }

    return {
      ...pageState,
      strengthScore,
      status,
      inWeakQueue: ["weak", "critical", "overdue"].includes(status) || pageState.totalWeakCount > 1,
      inCriticalQueue: ["critical", "overdue"].includes(status),
      notes: (pageNotes.get(pageState.pageNumber) ?? []).slice(-2).join("، "),
    };
  });
}
