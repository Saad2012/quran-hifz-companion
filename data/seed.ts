import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  formatISO,
  subDays,
} from "date-fns";

import {
  PersistedAppData,
  Session,
  StopSession,
  TajweedNote,
  TestRecord,
  UserSettings,
} from "@/types";
import { createDefaultSegments, getJuzApproxByPage, getSurahByPage } from "./quran-meta";
import { clamp } from "@/utils/pages";

const SEED_NOW = new Date("2026-05-04T09:00:00");

export const DEFAULT_SETTINGS: UserSettings = {
  appLanguage: "ar",
  rtl: true,
  targetYears: 4,
  newMemorizationDays: [0, 2, 4, 6],
  reviewDays: [0, 1, 2, 3, 4, 6],
  maxDaysWithoutReview: 12,
  ramadanReviewOnly: true,
  stopEnabled: true,
  stopLengthDays: 2,
  reviewSplitMethod: "auto",
  theme: "nour",
  preferredCharts: [
    "cumulative",
    "weekly",
    "heatmap",
    "coverage",
    "forecast",
    "tests",
  ],
  quickModeEnabled: false,
  numerals: "arabic-indic",
};

function toDateKey(date: Date) {
  return formatISO(date, { representation: "date" });
}

function createId(prefix: string, value: string | number) {
  return `${prefix}-${value}`;
}

function pseudo(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

function createSession(
  partial: Omit<Session, "id" | "createdAt" | "updatedAt">,
  idSeed: string,
): Session {
  const stamp = `${partial.date}T06:00:00.000Z`;
  return {
    id: createId("session", idSeed),
    createdAt: stamp,
    updatedAt: stamp,
    ...partial,
  };
}

function createTestRecord(
  partial: Omit<TestRecord, "id">,
  idSeed: string,
): TestRecord {
  return {
    id: createId("test", idSeed),
    ...partial,
  };
}

function createTajweedNote(
  partial: Omit<TajweedNote, "id">,
  idSeed: string,
): TajweedNote {
  return {
    id: createId("tajweed", idSeed),
    ...partial,
  };
}

function pickWeakPages(startPage: number, endPage: number, seed: number) {
  const pages: number[] = [];
  const count = clamp(Math.round(pseudo(seed) * 3), 0, Math.min(3, endPage - startPage + 1));

  for (let index = 0; index < count; index += 1) {
    pages.push(clamp(startPage + Math.round(pseudo(seed + index) * 3), startPage, endPage));
  }

  return [...new Set(pages)];
}

export function createSeedData(): PersistedAppData {
  const segments = createDefaultSegments();
  const sessions: Session[] = [];
  const testRecords: TestRecord[] = [];
  const tajweedNotes: TajweedNote[] = [];
  const stopSessions: StopSession[] = [];

  const startDate = new Date("2026-01-05T08:00:00");
  const endDate = subDays(SEED_NOW, 1);
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const ramadanStart = new Date("2026-02-18T00:00:00");
  const ramadanEnd = new Date("2026-03-19T00:00:00");

  let currentPage = 1;
  let memorizationIndex = 0;

  for (const date of allDays) {
    const dayKey = toDateKey(date);
    const weekday = date.getDay();
    const isRamadanWindow = date >= ramadanStart && date <= ramadanEnd;
    const canMemorize =
      DEFAULT_SETTINGS.newMemorizationDays.includes(weekday) &&
      !isRamadanWindow &&
      currentPage <= 184;
    const shouldReview = DEFAULT_SETTINGS.reviewDays.includes(weekday);

    if (canMemorize) {
      const pagesToMemorize = currentPage % 9 === 0 ? 2 : 1;
      const startPage = currentPage;
      const endPage = clamp(currentPage + pagesToMemorize - 1, currentPage, 184);
      currentPage = endPage + 1;
      memorizationIndex += 1;

      sessions.push(
        createSession(
          {
            date: dayKey,
            sessionType: "memorization",
            startPage,
            endPage,
            pagesCount: endPage - startPage + 1,
            durationMinutes: 38 + (memorizationIndex % 4) * 7,
            repetitions: 7 + (memorizationIndex % 4),
            qualityRating: 3 + (memorizationIndex % 3),
            difficultyRating: 2 + (memorizationIndex % 3),
            withTeacher: memorizationIndex % 3 === 0,
            tested: memorizationIndex % 5 === 0,
            optionalSurahLabel: getSurahByPage(startPage).name,
            optionalJuzApprox: getJuzApproxByPage(startPage),
            notes:
              memorizationIndex % 4 === 0
                ? "حفظ مستقر مع تركيز إضافي على بداية الصفحة."
                : "جلسة حفظ جديدة مع تكرار موزع.",
            weakPagesDiscovered: [],
            tags: ["حفظ جديد"],
            reviewedFromMemory: true,
          },
          `${dayKey}-mem`,
        ),
      );
    }

    if (shouldReview && currentPage > 1) {
      const memorizedCount = currentPage - 1;
      const plannedBlockSize =
        memorizedCount <= 60
          ? memorizedCount
          : memorizedCount <= 160
            ? Math.ceil(memorizedCount / 4)
            : Math.ceil(memorizedCount / 8);

      const cycleOffset = differenceInCalendarDays(date, startDate) * 3;
      const blockStart = clamp((cycleOffset % Math.max(1, memorizedCount - 2)) + 1, 1, memorizedCount);
      const blockEnd = clamp(blockStart + plannedBlockSize - 1, blockStart, memorizedCount);
      const weakPages = pickWeakPages(blockStart, blockEnd, cycleOffset + memorizedCount);

      sessions.push(
        createSession(
          {
            date: dayKey,
            sessionType: isRamadanWindow ? "ramadan" : "review",
            startPage: blockStart,
            endPage: blockEnd,
            pagesCount: blockEnd - blockStart + 1,
            durationMinutes: isRamadanWindow ? 55 : 45 + Math.round(pseudo(blockEnd) * 18),
            repetitions: isRamadanWindow ? 4 : 3 + (Math.round(pseudo(blockStart) * 2) % 3),
            qualityRating: clamp(3 + Math.round(pseudo(blockStart) * 2), 2, 5),
            difficultyRating: clamp(1 + Math.round(pseudo(blockEnd) * 4), 1, 5),
            withTeacher: isRamadanWindow ? false : blockStart % 5 === 0,
            tested: weakPages.length > 0,
            optionalSurahLabel: getSurahByPage(blockStart).name,
            optionalJuzApprox: getJuzApproxByPage(blockStart),
            notes: isRamadanWindow
              ? "مراجعة رمضانية خفيفة للمحافظة على التماسك."
              : "مراجعة دورية مع عناية بالمواضع المتأخرة.",
            weakPagesDiscovered: weakPages,
            tags: [isRamadanWindow ? "رمضان" : "مراجعة"],
            reviewedFromMemory: true,
          },
          `${dayKey}-rev`,
        ),
      );
    }

    const dayOffset = differenceInCalendarDays(date, startDate);

    if (dayOffset % 15 === 6 && currentPage > 30) {
      const startPage = clamp(currentPage - 22 - (dayOffset % 4), 1, currentPage - 10);
      const endPage = clamp(startPage + 9, startPage, currentPage - 1);
      const weakPages = pickWeakPages(startPage, endPage, dayOffset + 11);

      testRecords.push(
        createTestRecord(
          {
            date: dayKey,
            type: dayOffset % 30 === 6 ? "teacher" : "segment",
            startPage,
            endPage,
            score: clamp(74 + Math.round(pseudo(dayOffset) * 22), 68, 98),
            notes:
              dayOffset % 30 === 6
                ? "اختبار معلّم ركّز على الربط بين الصفحات."
                : "اختبار مقطع مع أسئلة مباغتة في الأطراف.",
            weakPages,
            errorsCount: weakPages.length + (dayOffset % 3),
          },
          dayKey,
        ),
      );
    }

    if (dayOffset % 10 === 4 && currentPage > 15) {
      const pageNumber = clamp(currentPage - 1 - (dayOffset % 18), 1, currentPage - 1);
      tajweedNotes.push(
        createTajweedNote(
          {
            date: dayKey,
            category: ["makharij", "ghunnah", "madd", "waqf", "qalqalah", "ikhfa"][
              dayOffset % 6
            ] as TajweedNote["category"],
            pageNumber,
            severity: dayOffset % 4 === 0 ? "high" : dayOffset % 2 === 0 ? "medium" : "low",
            note:
              dayOffset % 4 === 0
                ? "احتاجت المراجعة إلى تثبيت مخرج الحرف مع بطء مقصود."
                : "ملحوظة تجويدية متكررة تحتاج متابعة في المراجعة التالية.",
            resolved: dayOffset % 7 === 0,
            teacherNote: dayOffset % 3 === 0 ? "تنبيه المعلم: اربط الموضع بما قبله." : undefined,
          },
          `${dayKey}-${pageNumber}`,
        ),
      );
    }
  }

  const memorizationSessions = sessions.filter((session) => session.sessionType === "memorization");
  const completedSegments = segments.filter((segment) => segment.endPage < currentPage - 1);
  const upcomingSegment = segments.find((segment) => segment.startPage <= currentPage && segment.endPage >= currentPage);

  completedSegments.forEach((segment, index) => {
    const completionSession = memorizationSessions.find((session) => session.endPage >= segment.endPage);

    if (!completionSession) {
      return;
    }

    const plannedStart = addDays(new Date(`${completionSession.date}T09:00:00`), 1);
    const actualLength = index % 2 === 0 ? DEFAULT_SETTINGS.stopLengthDays : DEFAULT_SETTINGS.stopLengthDays + 1;
    const actualEnd = addDays(plannedStart, actualLength);
    const stopId = `stop-${segment.id}`;

    stopSessions.push({
      id: stopId,
      segmentId: segment.id,
      plannedStart: toDateKey(plannedStart),
      plannedEnd: toDateKey(addDays(plannedStart, DEFAULT_SETTINGS.stopLengthDays)),
      actualStart: toDateKey(plannedStart),
      actualEnd: toDateKey(actualEnd),
      completed: true,
      notes: "وقفة قصيرة للتثبيت واختبار الربط قبل الانتقال.",
    });

    sessions.push(
      createSession(
        {
          date: toDateKey(plannedStart),
          sessionType: "stop",
          startPage: segment.startPage,
          endPage: segment.endPage,
          pagesCount: segment.pagesCount,
          durationMinutes: 30,
          repetitions: 2,
          qualityRating: 4,
          difficultyRating: 2,
          withTeacher: index % 2 === 0,
          tested: true,
          optionalSurahLabel: segment.endSurah,
          optionalJuzApprox: getJuzApproxByPage(segment.endPage),
          notes: "وقفة تثبيت بعد إكمال مقطع كامل.",
          weakPagesDiscovered: pickWeakPages(segment.endPage - 2, segment.endPage, segment.endPage),
          tags: ["وقفة", "تثبيت"],
          reviewedFromMemory: true,
        },
        `${segment.id}-stop`,
      ),
    );
  });

  if (upcomingSegment) {
    const lastMemorization = memorizationSessions[memorizationSessions.length - 1];
    const plannedStart = addDays(new Date(`${lastMemorization.date}T08:00:00`), 7);

    stopSessions.push({
      id: "stop-upcoming",
      segmentId: upcomingSegment.id,
      plannedStart: toDateKey(plannedStart),
      plannedEnd: toDateKey(addDays(plannedStart, DEFAULT_SETTINGS.stopLengthDays)),
      completed: false,
      notes: "مخططة بعد إكمال المقطع الجاري مع اختبار شفهي قبلها.",
    });
  }

  const createdAt = toDateKey(subDays(SEED_NOW, 120));
  const updatedAt = toDateKey(subDays(SEED_NOW, 1));

  return {
    version: 1,
    createdAt,
    updatedAt,
    settings: DEFAULT_SETTINGS,
    sessions: sessions.sort((left, right) => left.date.localeCompare(right.date)),
    segments,
    stopSessions: stopSessions.sort((left, right) => left.plannedStart.localeCompare(right.plannedStart)),
    testRecords: testRecords.sort((left, right) => left.date.localeCompare(right.date)),
    tajweedNotes: tajweedNotes.sort((left, right) => left.date.localeCompare(right.date)),
  };
}
