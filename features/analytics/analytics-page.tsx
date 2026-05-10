"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Clock4, Flame, GaugeCircle, ShieldAlert, TrendingUp } from "lucide-react";

import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { ChartCard } from "@/components/charts/chart-card";
import { ClientChart } from "@/components/charts/client-chart";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { useHifzData } from "@/hooks/use-hifz-data";
import { toDigitSystem } from "@/utils/pages";

const PIE_COLORS = ["#c1865f", "#e3a56c", "#86a6ba", "#d9caa6", "#9c6b57", "#f1b67a"];

export function AnalyticsPage() {
  const { data, derived } = useHifzData();
  const { analytics } = derived;

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="التحليلات"
        title="قياس التقدم بعمق"
        description="هذه الصفحة تجمع المقاييس والرسوم المفيدة فعليًا: التراكم، التغطية، حجم المراجعة القادم، الضعف، القوة، والاتجاهات الموسمية."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المحفوظ"
          value={toDigitSystem(analytics.metrics.totalMemorizedPages, data.settings.numerals)}
          hint="عدد الصفحات التي دخلت حالة الحفظ."
          icon={TrendingUp}
        />
        <StatCard
          label="إجمالي المراجعات"
          value={toDigitSystem(analytics.metrics.totalReviewedPages, data.settings.numerals)}
          hint="إجمالي صفحات المراجعة المسجلة عبر الجلسات."
          icon={BarChart3}
        />
        <StatCard
          label="أفضل سلسلة"
          value={toDigitSystem(analytics.metrics.bestStreak, data.settings.numerals)}
          hint="أطول سلسلة أيام نشطة في البيانات الحالية."
          icon={Flame}
        />
        <StatCard
          label="صفحات معرضة للخطر"
          value={toDigitSystem(analytics.metrics.pagesAtRisk, data.settings.numerals)}
          hint="حرجة أو متأخرة وفق المحرك الحالي."
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="1. التراكم الكلي للحفظ" description="خط زمني يوضح متى نما المحفوظ الكلي فعليًا.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.charts.cumulativeProgress}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="memorizedPages" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="2. التراكم الكلي للمراجعة" description="يوضح حجم المراجعة المتراكم عبر الوقت.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.charts.cumulativeProgress}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="reviewedPages" stroke="#86a6ba" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="3. مقارنة أسبوعية" description="مقارنة مباشرة بين صفحات الحفظ والمراجعة أسبوعيًا.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.weeklyComparison}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="memorization" fill="var(--accent)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="review" fill="#86a6ba" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="4. التقدم الشهري" description="كم صفحة حُفظت وكم صفحة روجعت في الشهور الأخيرة.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.monthlyProgress}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="memorized" fill="var(--accent)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="reviewed" fill="#9fc1d8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="5. خريطة النشاط اليومي" description="شدة النشاط في آخر 90 يومًا على شكل heatmap.">
          <ActivityHeatmap data={analytics.charts.activityHeatmap} />
        </ChartCard>

        <ChartCard title="6. تغطية المراجعة" description="كم نسبة المحفوظ التي مرّت عليها مراجعة خلال 7 و14 و30 يومًا.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.reviewCoverage}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="coverage" fill="var(--accent)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="7. عمر الصفحة منذ آخر مراجعة" description="توزيع الصفحات بحسب عدد الأيام منذ آخر مرور فعلي عليها.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.pageAgeDistribution}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="bucket" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#d7aa7b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="8. توزيع الصفحات الضعيفة" description="أين يتركز الضعف تقريبًا بحسب الأجزاء.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.weakDistribution}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#c75f5f" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="9. توزيع القوة" description="كيف تتوزع الصفحات بين حديثة ومستقرة وقوية وضعيفة وحرجة.">
          <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
            <ClientChart className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.charts.strengthDistribution} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85}>
                    {analytics.charts.strengthDistribution.map((entry, index) => (
                      <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ClientChart>
            <div className="space-y-3">
              {analytics.charts.strengthDistribution.map((entry, index) => (
                <div key={entry.label} className="flex items-center justify-between rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-sm">{entry.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{toDigitSystem(entry.value, data.settings.numerals)}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="10. توقع الختم" description="مقارنة بين المسار الحالي والمسار المستهدف بناءً على عدد السنوات المحدد.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.charts.forecastCompletion}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="target" stroke="#86a6ba" strokeWidth={2.5} strokeDasharray="6 6" />
              </LineChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="11. توقع حجم المراجعة" description="يوضح عدد الصفحات المتوقعة للمراجعة في الأيام القادمة.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.charts.reviewVolumeForecast}>
                <defs>
                  <linearGradient id="reviewVolumeGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="duePages" stroke="var(--accent)" fill="url(#reviewVolumeGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="12. سلسلة الالتزام" description="عدد الأيام النشطة في الأسابيع الأخيرة.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.streakHistory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="streak" fill="#86a6ba" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="13. رادار الأداء العام" description="صورة مركبة لعدة أبعاد: التغطية، القوة، الالتزام، الاختبارات، والتجويد.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.charts.radarPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.26} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="14. تقدم المقاطع" description="كم صفحة أنجزت داخل كل مقطع مقابل المتبقي.">
          <ClientChart className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.segmentCompletion} layout="vertical">
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={80} />
                <RechartsTooltip />
                <Bar dataKey="completed" stackId="segment" fill="var(--accent)" radius={[0, 10, 10, 0]} />
                <Bar dataKey="remaining" stackId="segment" fill="var(--surface-soft)" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="15. سجل الوقفات" description="مقارنة بين طول الوقفة المخطط والفعلية عبر التاريخ.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.stopHistory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="plannedDays" fill="#d9caa6" radius={[10, 10, 0, 0]} />
                <Bar dataKey="actualDays" fill="var(--accent)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>

        <ChartCard title="16. مسار درجات الاختبار" description="متابعة درجات الاختبارات وعدد الأخطاء على نفس المحور الزمني.">
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.charts.testScoreTrend}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="errors" stroke="#9c6b57" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="متوسط الحفظ أسبوعيًا"
          value={toDigitSystem(analytics.metrics.averagePagesPerWeek, data.settings.numerals)}
          hint="صفحات حفظ جديدة كل أسبوع تقريبًا."
          icon={GaugeCircle}
        />
        <StatCard
          label="متوسط المراجعة أسبوعيًا"
          value={toDigitSystem(analytics.metrics.averageReviewPagesPerWeek, data.settings.numerals)}
          hint="مؤشر مفيد للحفاظ على التغطية."
          icon={Clock4}
        />
        <StatCard
          label="متوسط مدة الجلسة"
          value={`${toDigitSystem(analytics.metrics.averageSessionDuration, data.settings.numerals)} د`}
          hint="يساعدك على تصميم جلسة قابلة للاستمرار."
          icon={Flame}
        />
      </div>
    </div>
  );
}
