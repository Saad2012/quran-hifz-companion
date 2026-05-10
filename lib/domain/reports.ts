import { format, startOfMonth, subDays } from "date-fns";
import { arSA } from "date-fns/locale";

import { AnalyticsBundle, PersistedAppData, ReportView, ReviewEngineOutput } from "@/types";
import { formatPageRange } from "@/utils/pages";

function buildReport(
  id: string,
  title: string,
  periodLabel: string,
  memorized: string,
  reviewed: string,
  weakSpots: string[],
  consistency: string,
  recommendations: string[],
): ReportView {
  return {
    id,
    title,
    periodLabel,
    memorized,
    reviewed,
    weakSpots,
    consistency,
    recommendations,
  };
}

export function buildReports(
  data: PersistedAppData,
  analytics: AnalyticsBundle,
  reviewEngine: ReviewEngineOutput,
): ReportView[] {
  const now = new Date();
  const weekStart = subDays(now, 6);
  const weekKey = format(weekStart, "yyyy-MM-dd");
  const weekSessions = data.sessions.filter((session) => session.date >= weekKey);
  const weekMemorizedPages = weekSessions
    .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
    .flatMap((session) => [session.startPage, session.endPage]);
  const weekReviewedPages = weekSessions
    .filter((session) => ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
    .flatMap((session) => [session.startPage, session.endPage]);
  const monthlyKey = format(startOfMonth(now), "yyyy-MM-dd");
  const monthSessions = data.sessions.filter((session) => session.date >= monthlyKey);
  const ramadanSessions = data.sessions.filter((session) => session.sessionType === "ramadan");
  const latestTests = data.testRecords.slice(-4);
  const latestStop = data.stopSessions.findLast((stop) => stop.completed);

  return [
    buildReport(
      "weekly",
      "التقرير الأسبوعي",
      `من ${format(weekStart, "d MMM", { locale: arSA })} إلى ${format(now, "d MMM", { locale: arSA })}`,
      weekMemorizedPages.length ? formatPageRange(weekMemorizedPages, data.settings.numerals) : "لا يوجد حفظ جديد هذا الأسبوع",
      weekReviewedPages.length ? formatPageRange(weekReviewedPages, data.settings.numerals) : "لا توجد مراجعة مسجلة",
      reviewEngine.weakPages.slice(0, 6).map((page) => `ص ${page}`),
      analytics.metrics.currentStreak >= 4 ? "التزام جيد هذا الأسبوع." : "الالتزام متوسط ويحتاج إلى جلسة ثابتة يومية.",
      [
        "ثبّت جلسة مراجعة قصيرة حتى في الأيام المزدحمة.",
        "أعد اختبار الصفحات الحرجة قبل نهاية الأسبوع.",
      ],
    ),
    buildReport(
      "monthly",
      "التقرير الشهري",
      format(now, "MMMM yyyy", { locale: arSA }),
      monthSessions
        .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
        .length
        ? `${monthSessions
            .filter((session) => ["memorization", "mixed"].includes(session.sessionType))
            .reduce((total, session) => total + session.pagesCount, 0)} صفحة محفوظة`
        : "لا يوجد حفظ جديد هذا الشهر",
      `${monthSessions
        .filter((session) => ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType))
        .reduce((total, session) => total + session.pagesCount, 0)} صفحة مراجعة`,
      analytics.metrics.mostWeakPages.slice(0, 4).map((page) => `ص ${page.pageNumber}`),
      `متوسط المراجعة الأسبوعي: ${analytics.metrics.averageReviewPagesPerWeek} صفحة.`,
      [
        "استمر على نفس نمط التوزيع إن بقي حجم المراجعة متوازنًا.",
        "خفّض فجوة الصفحات المتأخرة إلى أقل من 5 صفحات هذا الشهر.",
      ],
    ),
    buildReport(
      "ramadan",
      "تقرير رمضان",
      "مراجعة موسمية",
      "التركيز كان على التثبيت أكثر من التوسّع في الحفظ.",
      `${ramadanSessions.reduce((total, session) => total + session.pagesCount, 0)} صفحة مراجعة رمضانية`,
      ramadanSessions.flatMap((session) => session.weakPagesDiscovered).slice(0, 5).map((page) => `ص ${page}`),
      ramadanSessions.length ? "تم الحفاظ على حضور ثابت في رمضان." : "لا توجد بيانات رمضان بعد.",
      [
        "أعد دمج الصفحات الرمضانية في دورة ما بعد رمضان.",
        "أضف اختبارًا قصيرًا لقياس ما بقي ضعيفًا من الموسم.",
      ],
    ),
    buildReport(
      "stop",
      "تقرير الوقفات",
      latestStop
        ? `آخر وقفة: ${data.segments.find((segment) => segment.id === latestStop.segmentId)?.label ?? latestStop.segmentId}`
        : "لا توجد وقفات مكتملة بعد",
      latestStop ? latestStop.notes : "لم تبدأ أي وقفة بعد",
      latestStop ? `انتهت الوقفة في ${latestStop.actualEnd}` : "لا توجد مراجعة وقفة",
      reviewEngine.criticalPages.slice(0, 4).map((page) => `ص ${page}`),
      analytics.metrics.completedStops ? "الوقفات تُستخدم فعليًا كأداة تثبيت." : "ينصح بتفعيل الوقفات بعد كل مقطع.",
      [
        "قبل الخروج من الوقفة: اختبر أطراف المقطع وربط أوائله بأواخره.",
        "إذا زاد الضعف بعد الوقفة فقصّر طول المقطع القادم.",
      ],
    ),
    buildReport(
      "tests",
      "تقرير الاختبارات",
      "أحدث الاختبارات المسجلة",
      latestTests.length ? `${latestTests.length} اختبارات حديثة` : "لا توجد اختبارات بعد",
      latestTests.length
        ? `${Math.round(latestTests.reduce((total, record) => total + record.score, 0) / latestTests.length)} متوسط درجة`
        : "لم تُحسب أي درجات بعد",
      latestTests.flatMap((record) => record.weakPages).slice(0, 5).map((page) => `ص ${page}`),
      latestTests.length && latestTests.at(-1)
        ? `آخر اختبار: ${latestTests.at(-1)?.score}%`
        : "ابدأ باختبار مقطع واحد على الأقل هذا الأسبوع.",
      [
        "أعد اختبار الصفحات التي تكررت في قائمة الضعف مرتين.",
        "وازن بين اختبارات المعلم والاختبارات الذاتية العشوائية.",
      ],
    ),
  ];
}
