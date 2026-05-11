import { TOTAL_QURAN_PAGES } from "@/data/quran-meta";
import {
  RecoveryPlan,
  ResumeSuggestion,
  ReviewTask,
  Session,
  TodayFocusItem,
  TodayFocusSnapshot,
  WeeklyPlanTask,
} from "@/types";
import { clamp, range, uniqueSortedNumbers } from "@/utils/pages";

function toTodayFocusItem(task: ReviewTask | WeeklyPlanTask): TodayFocusItem {
  return {
    id: task.id,
    title: task.title,
    detail: task.reason,
    estimatedMinutes: task.estimatedMinutes,
    pageNumbers: task.pageNumbers,
    completed: "completed" in task ? task.completed : false,
  };
}

export function buildResumeSuggestion(lastSession?: Session): ResumeSuggestion | undefined {
  if (!lastSession) {
    return undefined;
  }

  const safePageCount = Math.max(
    1,
    lastSession.pagesCount || lastSession.endPage - lastSession.startPage + 1,
  );

  if (lastSession.sessionType === "memorization" || lastSession.sessionType === "mixed") {
    const startPage = clamp(lastSession.endPage + 1, 1, TOTAL_QURAN_PAGES);
    const endPage = clamp(startPage + safePageCount - 1, startPage, TOTAL_QURAN_PAGES);
    const pageNumbers = range(startPage, endPage);

    return {
      title: "أكمل من حيث توقفت",
      description: "آخر جلسة كانت حفظًا، فاستئناف المدى التالي مباشرة يقلل فقدان الزخم والبحث عن نقطة البداية.",
      cta: "أكمل الحفظ",
      pageNumbers,
      preset: {
        sessionType: "memorization",
        startPage,
        endPage,
        durationMinutes: lastSession.durationMinutes,
        repetitions: lastSession.repetitions,
        qualityRating: lastSession.qualityRating,
        difficultyRating: lastSession.difficultyRating,
        reviewedFromMemory: true,
        optionalSurahLabel: lastSession.optionalSurahLabel,
        optionalJuzApprox: lastSession.optionalJuzApprox,
        notes: `متابعة مباشرة بعد جلسة ${lastSession.date}. ${lastSession.notes}`.trim(),
        tags: [...new Set([...lastSession.tags, "استكمال"])],
      },
    };
  }

  const pageNumbers = uniqueSortedNumbers(
    lastSession.weakPagesDiscovered.length
      ? lastSession.weakPagesDiscovered
      : range(lastSession.startPage, lastSession.endPage),
  );
  const startPage = pageNumbers[0] ?? lastSession.startPage;
  const endPage = pageNumbers.at(-1) ?? lastSession.endPage;

  return {
    title: "ارجع لآخر موضع كنت تعمل عليه",
    description: "بدل فتح قسم جديد، ابدأ من آخر صفحات المراجعة نفسها أو من الصفحات التي ظهرت فيها ملاحظات ضعف.",
    cta: "أكمل المراجعة",
    pageNumbers,
    preset: {
      sessionType: "review",
      startPage,
      endPage,
      durationMinutes: lastSession.durationMinutes,
      repetitions: lastSession.repetitions,
      qualityRating: lastSession.qualityRating,
      difficultyRating: lastSession.difficultyRating,
      reviewedFromMemory: lastSession.reviewedFromMemory,
      optionalSurahLabel: lastSession.optionalSurahLabel,
      optionalJuzApprox: lastSession.optionalJuzApprox,
      weakPagesDiscovered: pageNumbers,
      notes: `استكمال من آخر جلسة ${lastSession.date}. ${lastSession.notes}`.trim(),
      tags: [...new Set([...lastSession.tags, "استكمال"])],
    },
  };
}

export function buildTodayFocusSnapshot({
  recoveryPlan,
  reviewTasks,
  todayWeeklyTasks,
}: {
  recoveryPlan: RecoveryPlan;
  reviewTasks: ReviewTask[];
  todayWeeklyTasks: WeeklyPlanTask[];
}): TodayFocusSnapshot {
  if (recoveryPlan.isNeeded && recoveryPlan.days[0]) {
    const firstDay = recoveryPlan.days[0];

    return {
      source: "recovery",
      title: "اليوم فقط",
      summary: firstDay.summary,
      totalMinutes: firstDay.totalMinutes,
      items: firstDay.tasks.slice(0, 3).map(toTodayFocusItem),
    };
  }

  if (reviewTasks.length) {
    const items = reviewTasks.slice(0, 3).map(toTodayFocusItem);

    return {
      source: "review",
      title: "اليوم فقط",
      summary: "هذه هي الخطوات الأساسية التي تكفي لليوم، بدون الحاجة إلى التنقل بين بقية الصفحات.",
      totalMinutes: items.reduce((total, item) => total + item.estimatedMinutes, 0),
      items,
    };
  }

  if (todayWeeklyTasks.length) {
    const items = todayWeeklyTasks.slice(0, 3).map(toTodayFocusItem);

    return {
      source: "weekly",
      title: "اليوم فقط",
      summary: "لا توجد مهام مراجعة ضاغطة الآن، فهذه أقرب مهام مفيدة تحفظ الاستمرارية.",
      totalMinutes: items.reduce((total, item) => total + item.estimatedMinutes, 0),
      items,
    };
  }

  return {
    source: "empty",
    title: "اليوم فقط",
    summary: "لا توجد مهام ضاغطة الآن. خطوة قصيرة واحدة تكفي فقط للحفاظ على الإيقاع.",
    totalMinutes: 0,
    items: [],
  };
}
