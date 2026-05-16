import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  CalendarCheck2,
  ChartNoAxesColumn,
  CheckCircle2,
  CircleGauge,
  Clock3,
  HeartHandshake,
  Layers3,
  MoonStar,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const features = [
  {
    title: "خطة حفظ يومية واضحة",
    description: "تنظيم بسيط للورد اليومي يساعدك على البدء بسرعة وبدون تشتيت.",
    icon: Target,
  },
  {
    title: "مراجعة متدرجة للتثبيت",
    description: "تصور يوازن بين الحفظ والمراجعة حتى يبقى التقدم مستقرًا على المدى الطويل.",
    icon: BookMarked,
  },
  {
    title: "مؤشرات متابعة مفهومة",
    description: "بطاقات رقمية هادئة توضّح مستوى الإنجاز والخطوة التالية بوضوح.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "مناسب للطالب والمعلم",
    description: "واجهة عربية سهلة تمهّد لتجربة متابعة أوضح للطالب والمعلم وولي الأمر.",
    icon: Users,
  },
];

const journey = [
  "اختر هدفًا واقعيًا",
  "حدّد وردك اليومي",
  "احفظ بتدرّج ثابت",
  "راجع بانتظام",
  "تابع التقدّم أسبوعيًا",
  "استمر بإيقاع هادئ",
];

const faqs = [
  {
    q: "هل هذا التصميم يستبدل الصفحة الحالية؟",
    a: "لا. هذه تجربة إضافية على مسار مستقل، والواجهة الحالية ما زالت تعمل كما هي.",
  },
  {
    q: "هل التصميم مناسب للجوال؟",
    a: "نعم. تم بناؤه بأسلوب يبدأ من الجوال ثم يتوسع للتابلت والديسكتوب.",
  },
  {
    q: "هل البيانات الظاهرة هنا فعلية؟",
    a: "بعض المؤشرات في هذه الصفحة توضيحية لعرض فكرة التصميم وتجربة الاستخدام.",
  },
  {
    q: "كيف أعود للتصميم الحالي؟",
    a: "يمكنك العودة مباشرة من زر واضح في الهيدر، وكذلك من زر مماثل في نهاية الصفحة.",
  },
];

export default function NewDesignPage() {
  return (
    <main className="relative isolate overflow-x-clip bg-[#f8f6f1] text-[#1d2a24]">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(20,94,70,0.12),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(182,151,92,0.14),transparent_36%),linear-gradient(180deg,#f9f7f2_0%,#f5f1e7_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-size:28px_28px] [background-image:linear-gradient(to_right,rgba(29,42,36,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(29,42,36,0.05)_1px,transparent_1px)]" />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <header className="sticky top-3 z-20 rounded-2xl border border-[#d8d2c4] bg-[#fffdf9]/90 p-3 shadow-[0_12px_34px_rgba(16,42,30,0.08)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-[#5b6b62]">نسخة تجريبية من الهوية الجديدة</p>
              <p className="text-lg font-bold sm:text-xl">رفيق حفظ القرآن</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2" aria-label="التنقل داخل الصفحة">
              <a
                href="#features"
                className="rounded-lg px-3 py-2 text-sm text-[#345044] transition hover:bg-[#edf3ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
              >
                المزايا
              </a>
              <a
                href="#journey"
                className="rounded-lg px-3 py-2 text-sm text-[#345044] transition hover:bg-[#edf3ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
              >
                الرحلة
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-lg border border-[#c4b392] bg-[#f8f0df] px-3.5 py-2 text-sm font-medium text-[#294538] transition hover:bg-[#f2e5ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
              >
                العودة للتصميم الحالي
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <article className="space-y-6 lg:space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d8c8a7] bg-[#fff7e7] px-4 py-2 text-sm text-[#54665d]">
              <MoonStar className="h-4 w-4 text-[#927245]" />
              تجربة عربية هادئة تركّز على الثبات اليومي
            </p>

            <h1 className="text-3xl font-extrabold leading-tight text-[#1d2a24] sm:text-4xl lg:text-5xl lg:leading-[1.2]">
              رفيقك اليومي لحفظ القرآن
              <span className="mt-1 block text-[#0f5f44]">ومراجعته بثبات وطمأنينة</span>
            </h1>

            <p className="max-w-2xl text-base leading-8 text-[#46584f] sm:text-lg sm:leading-9">
              تصور بصري جديد لمنصة رفيق حفظ القرآن، يبسّط البداية، وينظّم خطوات الحفظ والمراجعة، ويجعل متابعة الإنجاز أوضح للمستخدم بدون تعقيد.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#preview"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0f5f44,#117657)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(15,95,68,0.26)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
              >
                ابدأ جولة سريعة
                <ArrowLeft className="h-4 w-4" />
              </a>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#c9bca2] bg-white px-5 py-3 text-sm font-semibold text-[#2f443a] transition hover:bg-[#f8f4eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "خطة يومية", icon: CalendarCheck2 },
                { label: "مراجعة ثابتة", icon: BadgeCheck },
                { label: "متابعة هادئة", icon: CircleGauge },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#d9d2c4] bg-white/75 px-4 py-3">
                  <item.icon className="h-4 w-4 text-[#0f5f44]" />
                  <p className="mt-2 text-sm font-medium text-[#32473d]">{item.label}</p>
                </div>
              ))}
            </div>
          </article>

          <aside
            id="preview"
            className="relative rounded-3xl border border-[#d3ccbc] bg-[#fffefb] p-5 shadow-[0_20px_40px_rgba(22,44,35,0.1)] sm:p-6"
          >
            <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,#c2b18b,transparent)]" />
            <p className="text-sm text-[#5c6c63]">معاينة توضيحية للمتابعة اليومية</p>
            <h2 className="mt-2 text-xl font-bold">لوحة اليوم</h2>
            <div className="mt-6 space-y-3.5">
              <div className="rounded-2xl bg-[#ecf6f0] p-4">
                <p className="text-sm text-[#3d564b]">ورد اليوم</p>
                <p className="mt-1 text-lg font-semibold">صفحة واحدة بتركيز هادئ</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f8f2e4] p-4">
                  <p className="text-xs text-[#6a5d4a]">نسبة التقدّم</p>
                  <p className="mt-1 text-2xl font-bold">٪٦٥</p>
                </div>
                <div className="rounded-2xl bg-[#eaf3f8] p-4">
                  <p className="text-xs text-[#556576]">سلسلة الالتزام</p>
                  <p className="mt-1 text-2xl font-bold">٧ أيام</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#d8d1c2] bg-white p-4 text-sm leading-7 text-[#495b51]">
                تذكير لطيف: ابدأ اليوم بمراجعة قصيرة لما أتممته بالأمس قبل الانتقال للورد الجديد.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">مزايا التجربة الجديدة</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#52645a] sm:text-base">
          تصميم حديث يركز على الوضوح والسكينة، مع بنية مرنة تسهّل التقدم اليومي وتدعم بناء عادة ثابتة.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#d9d2c4] bg-white/80 p-5 shadow-[0_8px_20px_rgba(26,44,36,0.05)] transition hover:-translate-y-0.5"
            >
              <feature.icon className="h-5 w-5 text-[#0f5f44]" />
              <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#4d5f55]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">رحلة الحفظ خطوة بخطوة</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, index) => (
            <div key={step} className="rounded-2xl border border-[#d9d2c4] bg-[#fffdf9] p-4">
              <p className="text-xs text-[#77867d]">الخطوة {index + 1}</p>
              <p className="mt-2 font-semibold text-[#2c4137]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-[#d8d1c2] bg-white/80 p-6">
            <h2 className="text-2xl font-bold">المراجعة هي مفتاح التثبيت</h2>
            <p className="mt-3 text-sm leading-8 text-[#4e6056] sm:text-base">
              الحفظ يحتاج إلى صحبة يومية ومراجعة متدرجة. هذا التصور يقدّم تجربة هادئة تساعد على الاستمرار وتقلّل
              الشعور بالتشتت بين المهام.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-[#3f5449]">
              <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#0f5f44]" />خطوات قصيرة قابلة للتنفيذ</li>
              <li className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#0f5f44]" />إيقاع مناسب يقلّل الانقطاع</li>
              <li className="inline-flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-[#0f5f44]" />وضوح أعلى للطالب والأسرة</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-[#d8d1c2] bg-[#fff8ec] p-6">
            <h2 className="text-2xl font-bold">تصور يخدم المعلم وولي الأمر</h2>
            <p className="mt-3 text-sm leading-8 text-[#4f6056] sm:text-base">
              صُممت هذه التجربة لتكون مناسبة للطالب والمعلم وولي الأمر، مع قابلية تطوير لوحات متابعة أوضح تدعم
              التشجيع وتنظيم التقدّم اليومي.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white p-3">متابعة الالتزام</div>
              <div className="rounded-xl bg-white p-3">قياس الإنجاز</div>
              <div className="rounded-xl bg-white p-3">تنظيم الخطة</div>
              <div className="rounded-xl bg-white p-3">تعزيز الاستمرار</div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">مؤشرات توضيحية</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "مراحل الحفظ", value: "٣", icon: Layers3 },
            { label: "متابعة أسبوعية", value: "٧ أيام", icon: CalendarCheck2 },
            { label: "ورد يومي واضح", value: "١", icon: Target },
            { label: "تعقيد الاستخدام", value: "٠", icon: Sparkles },
          ].map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-[#d9d2c4] bg-white/80 p-5">
              <stat.icon className="h-5 w-5 text-[#0f5f44]" />
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[#54665c]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">الأسئلة الشائعة</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-[#d9d2c4] bg-white/80 p-4 open:bg-white">
              <summary className="cursor-pointer text-sm font-semibold text-[#2d4338] marker:content-none sm:text-base">{faq.q}</summary>
              <p className="mt-3 text-sm leading-7 text-[#53655b]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#d8d2c4] bg-[#f7f1e3]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[#43564c] sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">رفيق حفظ القرآن</p>
            <p className="mt-1">تصور حديث لهوية هادئة تدعم رحلة الحفظ اليومية.</p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[#baa989] bg-white px-4 py-2 font-medium text-[#2c4338] transition hover:bg-[#f5ecda] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f5f44]"
          >
            العودة للتصميم الحالي
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
