import { addDays, formatISO, isSameDay } from "date-fns";

import { PageState, PersistedAppData, ReviewCycle, ReviewEngineOutput, ReviewTask } from "@/types";
import { getFortnightWindow, getTodayDateKey, getWeekWindow } from "@/utils/date";
import { clamp, range, uniqueSortedNumbers } from "@/utils/pages";

function splitIntoBuckets(values: number[], bucketCount: number) {
  const buckets = Array.from({ length: bucketCount }, () => [] as number[]);

  values.forEach((value, index) => {
    buckets[index % bucketCount].push(value);
  });

  return buckets.filter((bucket) => bucket.length > 0);
}

function createTask(
  category: ReviewTask["category"],
  pages: number[],
  reason: string,
  date: string,
  completedPages: number[],
): ReviewTask | null {
  if (!pages.length) {
    return null;
  }

  const uniquePages = uniqueSortedNumbers(pages);
  const priorities: Record<ReviewTask["category"], number> = {
    critical: 1,
    overdue: 2,
    weak: 3,
    recent: 4,
    cycle: 5,
  };
  const titles: Record<ReviewTask["category"], string> = {
    critical: "صفحات حرجة",
    overdue: "صفحات متأخرة",
    weak: "صفحات ضعيفة",
    recent: "صفحات حديثة",
    cycle: "بلوك الدورة",
  };

  return {
    id: `${category}-${date}`,
    date,
    category,
    title: titles[category],
    pageNumbers: uniquePages,
    priority: priorities[category],
    reason,
    estimatedMinutes: Math.max(8, uniquePages.length * (category === "cycle" ? 2 : 3)),
    completed: uniquePages.every((pageNumber) => completedPages.includes(pageNumber)),
  };
}

function createReviewCycle(data: PersistedAppData, pageStates: PageState[]): ReviewCycle {
  const memorizedPages = pageStates.filter((page) => page.memorized).map((page) => page.pageNumber);
  const count = memorizedPages.length;

  let cycleType: ReviewCycle["cycleType"] = "weekly";
  let sessionsCount = 1;

  if (data.settings.reviewSplitMethod === "weekly") {
    cycleType = "weekly";
    sessionsCount = count <= 60 ? 1 : 4;
  } else if (data.settings.reviewSplitMethod === "fortnightly") {
    cycleType = "fortnightly";
    sessionsCount = 8;
  } else if (count <= 60) {
    cycleType = "weekly";
    sessionsCount = 1;
  } else if (count <= 160) {
    cycleType = "weekly";
    sessionsCount = 4;
  } else {
    cycleType = "fortnightly";
    sessionsCount = 8;
  }

  const buckets = splitIntoBuckets(memorizedPages, Math.max(1, sessionsCount));
  const reviewDays = data.settings.reviewDays.length ? data.settings.reviewDays : [0, 1, 2, 3, 4, 6];

  return {
    cycleType,
    sessionsCount: buckets.length,
    pagesPerSession: count ? Math.ceil(count / Math.max(1, buckets.length)) : 0,
    sessionAssignments: buckets.map((pageNumbers, index) => ({
      bucketIndex: index,
      label: `دفعة ${index + 1}`,
      pageNumbers,
      recommendedDays: [reviewDays[index % reviewDays.length]],
    })),
  };
}

export function buildReviewEngine(
  data: PersistedAppData,
  pageStates: PageState[],
  todayDateKey = getTodayDateKey(),
): ReviewEngineOutput {
  const cycle = createReviewCycle(data, pageStates);
  const memorizedPages = pageStates.filter((page) => page.memorized);
  const todayDate = new Date(`${todayDateKey}T00:00:00`);
  const completedTodayPages = uniqueSortedNumbers(
    data.sessions
      .filter((session) => session.date === todayDateKey)
      .flatMap((session) => range(session.startPage, session.endPage)),
  );

  const overduePages = memorizedPages
    .filter((page) => !page.lastReviewedAt || page.status === "overdue")
    .map((page) => page.pageNumber);
  const criticalPages = memorizedPages
    .filter((page) => page.inCriticalQueue)
    .map((page) => page.pageNumber);
  const weakPages = memorizedPages.filter((page) => page.inWeakQueue).map((page) => page.pageNumber);
  const recentPages = memorizedPages
    .filter(
      (page) =>
        page.firstMemorizedAt &&
        Math.abs(
          Math.round(
            (todayDate.getTime() - new Date(`${page.firstMemorizedAt}T00:00:00`).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ) <= 6,
    )
    .map((page) => page.pageNumber);

  const calendar =
    cycle.cycleType === "weekly" ? getWeekWindow(todayDate, 7) : getFortnightWindow(todayDate);
  const scheduledReviewDays = calendar.filter((date) => data.settings.reviewDays.includes(date.getDay()));
  const currentScheduledIndex = scheduledReviewDays.findIndex((date) => isSameDay(date, todayDate));
  const assignmentIndex =
    currentScheduledIndex >= 0
      ? currentScheduledIndex % Math.max(1, cycle.sessionAssignments.length)
      : calendar.findIndex((date) => isSameDay(date, todayDate)) % Math.max(1, cycle.sessionAssignments.length);
  const safeAssignmentIndex = clamp(assignmentIndex, 0, Math.max(0, cycle.sessionAssignments.length - 1));
  const baselinePages = cycle.sessionAssignments[safeAssignmentIndex]?.pageNumbers ?? [];
  const nextAssignmentPages =
    cycle.sessionAssignments[(safeAssignmentIndex + 1) % Math.max(1, cycle.sessionAssignments.length)]?.pageNumbers ?? [];

  const lightTasks = [
    createTask("critical", criticalPages.slice(0, 5), "أولوية إنقاذ سريعة قبل اتساع فجوة المراجعة.", todayDateKey, completedTodayPages),
    createTask("weak", weakPages.slice(0, 4), "صفحات دخلت قائمة الضعف وتحتاج تثبيتًا مباشرًا.", todayDateKey, completedTodayPages),
    createTask("recent", recentPages.slice(0, 3), "إبقاء الصفحات الجديدة داخل نافذة التثبيت الأولى.", todayDateKey, completedTodayPages),
    createTask("cycle", baselinePages.slice(0, Math.max(4, Math.ceil(baselinePages.length * 0.6))), "نسخة خفيفة من دفعة المراجعة الأساسية لليوم.", todayDateKey, completedTodayPages),
  ].filter(Boolean) as ReviewTask[];

  const normalTasks = [
    createTask("critical", criticalPages, "صفحات حرجة تجاوزت الهامش الآمن أو اقتربت منه.", todayDateKey, completedTodayPages),
    createTask("overdue", overduePages.slice(0, 8), "صفحات تأخرت عن سقف الغياب المحدد في الإعدادات.", todayDateKey, completedTodayPages),
    createTask("weak", weakPages, "إعادة تدوير الصفحات الضعيفة دائمًا داخل خطة اليوم.", todayDateKey, completedTodayPages),
    createTask("recent", recentPages.slice(0, 6), "إضافة الصفحات الحديثة دائمًا لتقليل النسيان المبكر.", todayDateKey, completedTodayPages),
    createTask("cycle", baselinePages, "الدفعة الأساسية الناتجة عن دورة المراجعة الحالية.", todayDateKey, completedTodayPages),
  ].filter(Boolean) as ReviewTask[];

  const intensiveTasks = [
    ...normalTasks.filter((task) => task.category !== "cycle"),
    createTask("cycle", uniqueSortedNumbers([...baselinePages, ...nextAssignmentPages.slice(0, Math.ceil(nextAssignmentPages.length * 0.5))]), "دفعة موسعة تشمل جزءًا من المراجعة القادمة لتخفيف الحجم اللاحق.", todayDateKey, completedTodayPages),
  ].filter(Boolean) as ReviewTask[];

  const makeExplanation = (mode: "light" | "normal" | "intensive") => {
    const list = [
      cycle.cycleType === "weekly"
        ? "المحرك يعمل بدورة أسبوعية لأن حجم المحفوظ ما زال ضمن المستوى المناسب لذلك."
        : "المحرك يعمل بدورة 14 يومًا لأن حجم المحفوظ تجاوز العتبة التي تجعل الأسبوع الواحد مزدحمًا.",
    ];

    if (recentPages.length) {
      list.push("أُضيفت الصفحات الحديثة دائمًا لأنها أكثر عرضة للتفلّت المبكر.");
    }
    if (weakPages.length) {
      list.push("أُضيفت الصفحات الضعيفة دائمًا لأن منطق المراجعة يعاملها كطابور مستمر.");
    }
    if (criticalPages.length || overduePages.length) {
      list.push("تم رفع الصفحات الحرجة والمتأخرة إلى أعلى الأولويات حتى لا تتجاوز الحد الآمن.");
    }
    if (mode === "light") {
      list.push("النسخة الخفيفة مناسبة عند ضيق الوقت مع الحفاظ على خط الدفاع الأدنى.");
    }
    if (mode === "intensive") {
      list.push("النسخة الموسعة تسحب جزءًا من حجم مراجعة الأيام القادمة لتخفيف التراكم.");
    }

    return list;
  };

  const totalNormalPages = uniqueSortedNumbers(normalTasks.flatMap((task) => task.pageNumbers)).length;
  const recommendedMode =
    criticalPages.length >= 7 || overduePages.length >= 12
      ? "intensive"
      : totalNormalPages >= 18 || weakPages.length >= 5
        ? "normal"
        : "light";

  const upcomingReviewLoad = Array.from({ length: 14 }, (_, index) => {
    const futureDate = addDays(todayDate, index);
    const futureKey = formatISO(futureDate, { representation: "date" });
    const isReviewDay = data.settings.reviewDays.includes(futureDate.getDay());
    const futureBucket =
      cycle.sessionAssignments[(safeAssignmentIndex + index) % Math.max(1, cycle.sessionAssignments.length)]?.pageNumbers ?? [];

    return {
      date: futureKey,
      pages: isReviewDay ? futureBucket.length + Math.min(weakPages.length, 4) : Math.ceil(recentPages.length / 2),
      weakPages: isReviewDay ? Math.min(weakPages.length, 5) : 0,
      criticalPages: isReviewDay ? Math.max(0, criticalPages.length - Math.floor(index / 2)) : 0,
    };
  });

  return {
    todayReviewPlan: {
      light: {
        mode: "light",
        totalPages: uniqueSortedNumbers(lightTasks.flatMap((task) => task.pageNumbers)).length,
        tasks: lightTasks,
        explanation: makeExplanation("light"),
      },
      normal: {
        mode: "normal",
        totalPages: totalNormalPages,
        tasks: normalTasks,
        explanation: makeExplanation("normal"),
      },
      intensive: {
        mode: "intensive",
        totalPages: uniqueSortedNumbers(intensiveTasks.flatMap((task) => task.pageNumbers)).length,
        tasks: intensiveTasks,
        explanation: makeExplanation("intensive"),
      },
    },
    overduePages,
    weakPages,
    criticalPages,
    recentPages,
    baselinePages,
    upcomingReviewLoad,
    recommendedMode,
    cycle,
    currentAssignmentIndex: safeAssignmentIndex,
  };
}
