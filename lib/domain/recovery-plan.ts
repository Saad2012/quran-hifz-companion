import {
  PersistedAppData,
  RecoveryDay,
  RecoveryPlan,
  ReviewEngineOutput,
  WeeklyPlanTask,
  WeeklyPlanner,
} from "@/types";
import { daysBetween, formatDateLabel, getTodayDateKey } from "@/utils/date";
import { uniqueSortedNumbers } from "@/utils/pages";

function createTask(
  id: string,
  title: string,
  type: WeeklyPlanTask["type"],
  pageNumbers: number[],
  estimatedMinutes: number,
  reason: string,
  priority: number,
): WeeklyPlanTask {
  return {
    id,
    title,
    type,
    pageNumbers,
    estimatedMinutes,
    reason,
    priority,
  };
}

function buildRecoveryDay(
  date: string,
  title: string,
  summary: string,
  tasks: WeeklyPlanTask[],
): RecoveryDay {
  return {
    id: `recovery-${date}-${title}`,
    date,
    label: formatDateLabel(date, "EEEE d MMM"),
    title,
    summary,
    tasks,
    totalPages: tasks.reduce((total, task) => total + task.pageNumbers.length, 0),
    totalMinutes: tasks.reduce((total, task) => total + task.estimatedMinutes, 0),
  };
}

export function buildRecoveryPlan(
  data: PersistedAppData,
  reviewEngine: ReviewEngineOutput,
  weeklyPlanner: WeeklyPlanner,
  todayDateKey = getTodayDateKey(),
): RecoveryPlan {
  const lastSession = [...data.sessions].sort((left, right) =>
    right.date.localeCompare(left.date),
  )[0];
  const gapDays = lastSession ? Math.max(0, daysBetween(todayDateKey, lastSession.date)) : 0;

  if (!lastSession || gapDays < 2) {
    return {
      isNeeded: false,
      gapDays,
      severity: "steady",
      headline: "أنت داخل الإيقاع الطبيعي",
      summary: "لا توجد فجوة تستدعي خطة تعافٍ خاصة الآن، ويمكنك العمل من خلال خطة اليوم المعتادة.",
      recommendedMode: reviewEngine.recommendedMode,
      canResumeMemorization: true,
      days: [],
    };
  }

  const severity: RecoveryPlan["severity"] =
    gapDays >= 8 ? "deep" : gapDays >= 5 ? "medium" : "gentle";
  const urgentPages = uniqueSortedNumbers([
    ...reviewEngine.overduePages,
    ...reviewEngine.criticalPages,
  ]);
  const weakPages = uniqueSortedNumbers(reviewEngine.weakPages);
  const baselinePages = uniqueSortedNumbers(reviewEngine.baselinePages);
  const recentPages = uniqueSortedNumbers(reviewEngine.recentPages);
  const plannerDays = weeklyPlanner.days.length ? weeklyPlanner.days : [];

  const urgentSlice =
    severity === "deep" ? urgentPages.slice(0, 12) : severity === "medium" ? urgentPages.slice(0, 10) : urgentPages.slice(0, 8);
  const weakSlice =
    severity === "deep" ? weakPages.slice(0, 10) : severity === "medium" ? weakPages.slice(0, 8) : weakPages.slice(0, 6);
  const baselineSlice = baselinePages.slice(0, severity === "deep" ? 10 : 8);
  const recentSlice = recentPages.slice(-4);
  const canResumeMemorization = gapDays <= 3 && urgentPages.length <= 8;

  const recoveryDays: RecoveryDay[] = [];

  if (plannerDays[0]) {
    recoveryDays.push(
      buildRecoveryDay(
        plannerDays[0].date,
        "العودة الهادئة",
        "ابدأ بإنقاذ الصفحات المتأخرة والحرجة قبل أي توسع في الحفظ الجديد.",
        [
          createTask(
            "recovery-rescue",
            "إنقاذ الصفحات المتأخرة والحرجة",
            "recovery",
            urgentSlice,
            severity === "deep" ? 35 : 24,
            "هذه الصفحات هي الأكثر عرضة للتفلت الآن، ومعالجتها أولًا تمنع تضخم الخلل.",
            1,
          ),
          createTask(
            "recovery-weak",
            "مرور تثبيتي على الصفحات الضعيفة",
            "review",
            weakSlice,
            severity === "deep" ? 18 : 14,
            "إعادة لمس الصفحات الضعيفة في نفس اليوم تقلل أثر الانقطاع سريعًا.",
            2,
          ),
        ].filter((task) => task.pageNumbers.length),
      ),
    );
  }

  if (plannerDays[1]) {
    recoveryDays.push(
      buildRecoveryDay(
        plannerDays[1].date,
        "تثبيت الدورة",
        "بعد يوم الإنقاذ، ارجع إلى بلوك المراجعة الأساسي حتى لا يبقى التعافي معزولًا عن الخطة.",
        [
          createTask(
            "recovery-cycle",
            "بلوك المراجعة الأساسي",
            "review",
            baselineSlice,
            22,
            "هذا البلوك يعيدك إلى قلب دورة المراجعة العادية بدل البقاء في وضع طوارئ فقط.",
            1,
          ),
          createTask(
            "recovery-recent",
            "الصفحات الحديثة",
            "review",
            recentSlice,
            10,
            "مرور خفيف على الصفحات الحديثة يمنع فتح فجوة جديدة أثناء التعافي.",
            2,
          ),
        ].filter((task) => task.pageNumbers.length),
      ),
    );
  }

  if (plannerDays[2]) {
    recoveryDays.push(
      buildRecoveryDay(
        plannerDays[2].date,
        canResumeMemorization ? "عودة تدريجية للحفظ" : "يوم تثبيت إضافي",
        canResumeMemorization
          ? "إذا خفّ الضغط بعد اليومين الأولين، أعد جلسة حفظ قصيرة مع مراجعة مرافقة."
          : "لا تتعجل الحفظ الجديد بعد. الأفضل تمديد التثبيت يومًا إضافيًا.",
        [
          canResumeMemorization
            ? createTask(
                "recovery-memorization",
                "جلسة حفظ قصيرة جدًا",
                "memorization",
                plannerDays[2].plannedTasks.find((task) => task.type === "memorization")?.pageNumbers ?? [],
                20,
                "الحفظ هنا رمزي وخفيف فقط لإعادة الإيقاع دون خلق دين مراجعة جديد.",
                2,
              )
            : createTask(
                "recovery-repeat",
                "تكرار مركز للصفحات الحرجة",
                "review",
                urgentPages.slice(0, 6),
                18,
                "الفجوة ما زالت تحتاج يومًا إضافيًا من التثبيت قبل استئناف الحفظ.",
                1,
              ),
          createTask(
            "recovery-week",
            "عودة إلى خطة الأسبوع",
            "review",
            plannerDays[2].plannedTasks.flatMap((task) => task.pageNumbers).slice(0, 8),
            18,
            "هذا الجسر يعيدك من خطة التعافي إلى الخطة الطبيعية دون قفزة حادة.",
            3,
          ),
        ].filter((task) => task.pageNumbers.length),
      ),
    );
  }

  if (severity !== "gentle" && plannerDays[3]) {
    recoveryDays.push(
      buildRecoveryDay(
        plannerDays[3].date,
        "مراجعة استقرار",
        "يوم خفيف نسبيًا للتأكد أن الصفحات الحرجة لم تعد ترتفع من جديد.",
        [
          createTask(
            "recovery-check",
            "فحص الاستقرار",
            "review",
            uniqueSortedNumbers([...urgentPages.slice(0, 4), ...weakPages.slice(0, 4)]),
            16,
            "هذا اليوم يراجع أثر خطة التعافي بدل إضافة ضغط جديد.",
            1,
          ),
        ],
      ),
    );
  }

  if (severity === "deep" && plannerDays[4]) {
    recoveryDays.push(
      buildRecoveryDay(
        plannerDays[4].date,
        "استئناف محسوب",
        "إذا التزمت بالأيام السابقة، فهذا اليوم ينقلك من التعافي العميق إلى المسار الأسبوعي المعتاد.",
        [
          createTask(
            "recovery-deep-return",
            "جلسة مراجعة مع حفظ رمزي",
            "recovery",
            uniqueSortedNumbers([
              ...baselinePages.slice(0, 5),
              ...(plannerDays[4].plannedTasks.find((task) => task.type === "memorization")?.pageNumbers ?? []).slice(0, 2),
            ]),
            24,
            "الهدف هنا اختبار العودة الطبيعية، لا تعويض كل ما فات دفعة واحدة.",
            1,
          ),
        ],
      ),
    );
  }

  return {
    isNeeded: true,
    gapDays,
    severity,
    headline:
      severity === "deep"
        ? "تحتاج عودة هادئة على عدة أيام"
        : severity === "medium"
          ? "الأفضل استئناف المشروع بخطة تعافٍ قصيرة"
          : "انقطاع بسيط، لكن يستحق إعادة تنظيم هادئة",
    summary:
      severity === "deep"
        ? `مرّ ${gapDays} أيام منذ آخر جلسة. سنخفف الضغط أولًا ثم نرجعك تدريجيًا إلى الحفظ والمراجعة الطبيعية.`
        : severity === "medium"
          ? `مرّ ${gapDays} أيام منذ آخر جلسة. يومان أو ثلاثة من التعافي المنظم أفضل من العودة العشوائية.`
          : `مرّ ${gapDays} أيام منذ آخر جلسة. خطة خفيفة الآن ستعيدك بسرعة بدون شعور بتراكم مرهق.`,
    recommendedMode: urgentPages.length >= 8 ? "intensive" : reviewEngine.recommendedMode,
    canResumeMemorization,
    days: recoveryDays,
  };
}
