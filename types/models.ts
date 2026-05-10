export type AppLanguage = "ar";
export type ThemeMode = "nour" | "sand" | "night";
export type NumberSystem = "arabic-indic" | "latin";
export type ReviewMode = "light" | "normal" | "intensive";
export type PageStatus =
  | "not_started"
  | "fresh"
  | "stable"
  | "strong"
  | "weak"
  | "critical"
  | "overdue";
export type ReviewCycleType = "weekly" | "fortnightly";
export type ReviewSplitMethod = "auto" | "weekly" | "fortnightly";
export type TestType = "teacher" | "self" | "random" | "segment" | "ramadan";
export type TajweedSeverity = "low" | "medium" | "high";
export type TajweedCategory =
  | "makharij"
  | "ghunnah"
  | "madd"
  | "waqf"
  | "qalqalah"
  | "sifaat"
  | "ikhfa"
  | "idghaam";
export type SessionType =
  | "memorization"
  | "review"
  | "test"
  | "stop"
  | "ramadan"
  | "tajweed"
  | "mixed";
export type ReviewTaskCategory =
  | "recent"
  | "cycle"
  | "weak"
  | "critical"
  | "overdue";
export type AlertTone = "info" | "warning" | "success";

export interface UserSettings {
  appLanguage: AppLanguage;
  rtl: boolean;
  targetYears: number;
  newMemorizationDays: number[];
  reviewDays: number[];
  maxDaysWithoutReview: number;
  ramadanReviewOnly: boolean;
  stopEnabled: boolean;
  stopLengthDays: number;
  reviewSplitMethod: ReviewSplitMethod;
  theme: ThemeMode;
  preferredCharts: string[];
  quickModeEnabled: boolean;
  numerals: NumberSystem;
}

export interface Session {
  id: string;
  date: string;
  sessionType: SessionType;
  startPage: number;
  endPage: number;
  pagesCount: number;
  durationMinutes: number;
  repetitions: number;
  qualityRating: number;
  difficultyRating: number;
  withTeacher: boolean;
  tested: boolean;
  optionalSurahLabel?: string;
  optionalJuzApprox?: number;
  notes: string;
  weakPagesDiscovered: number[];
  tags: string[];
  reviewedFromMemory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageState {
  pageNumber: number;
  memorized: boolean;
  firstMemorizedAt?: string;
  lastReviewedAt?: string;
  totalReviewCount: number;
  totalWeakCount: number;
  strengthScore: number;
  status: PageStatus;
  inWeakQueue: boolean;
  inCriticalQueue: boolean;
  lastTestedAt?: string;
  notes?: string;
  surahLabel?: string;
  juzApprox?: number;
}

export interface ReviewTask {
  id: string;
  date: string;
  category: ReviewTaskCategory;
  title: string;
  pageNumbers: number[];
  priority: number;
  reason: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface ReviewCycleAssignment {
  bucketIndex: number;
  label: string;
  pageNumbers: number[];
  recommendedDays: number[];
}

export interface ReviewCycle {
  cycleType: ReviewCycleType;
  sessionsCount: number;
  pagesPerSession: number;
  sessionAssignments: ReviewCycleAssignment[];
}

export interface Segment {
  id: string;
  startPage: number;
  endPage: number;
  pagesCount: number;
  label: string;
  startSurah: string;
  endSurah: string;
  stopAfter: boolean;
}

export interface StopSession {
  id: string;
  segmentId: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  completed: boolean;
  notes: string;
}

export interface TestRecord {
  id: string;
  date: string;
  type: TestType;
  startPage: number;
  endPage: number;
  score: number;
  notes: string;
  weakPages: number[];
  errorsCount: number;
}

export interface TajweedNote {
  id: string;
  date: string;
  category: TajweedCategory;
  pageNumber: number;
  severity: TajweedSeverity;
  note: string;
  resolved: boolean;
  teacherNote?: string;
}

export interface ReviewModePlan {
  mode: ReviewMode;
  totalPages: number;
  tasks: ReviewTask[];
  explanation: string[];
}

export interface ReviewEngineOutput {
  todayReviewPlan: Record<ReviewMode, ReviewModePlan>;
  overduePages: number[];
  weakPages: number[];
  criticalPages: number[];
  recentPages: number[];
  baselinePages: number[];
  upcomingReviewLoad: ReviewLoadPoint[];
  recommendedMode: ReviewMode;
  cycle: ReviewCycle;
  currentAssignmentIndex: number;
}

export interface ReviewLoadPoint {
  date: string;
  pages: number;
  weakPages: number;
  criticalPages: number;
}

export interface SmartAlert {
  id: string;
  tone: AlertTone;
  title: string;
  message: string;
}

export interface WeakPageInsight {
  pageNumber: number;
  surahLabel: string;
  juzApprox: number;
  status: Extract<PageStatus, "weak" | "critical" | "overdue">;
  strengthScore: number;
  totalReviewCount: number;
  totalWeakCount: number;
  daysSinceLastReview: number;
  lastReviewedAt?: string;
  lastTestedAt?: string;
  reasons: string[];
  recommendedAction: string;
  recentSessionNotes: string[];
}

export interface WeeklyPlanTask {
  id: string;
  title: string;
  type: "memorization" | "review" | "recovery" | "test" | "stop";
  pageNumbers: number[];
  estimatedMinutes: number;
  reason: string;
  priority: number;
}

export interface WeeklyPlanDay {
  date: string;
  weekdayIndex: number;
  weekdayLabel: string;
  isToday: boolean;
  isMemorizationDay: boolean;
  isReviewDay: boolean;
  plannedTasks: WeeklyPlanTask[];
  totalPages: number;
  totalMinutes: number;
  focusLabel: string;
}

export interface WeeklyPlanner {
  weekLabel: string;
  totalPlannedPages: number;
  totalPlannedMinutes: number;
  reviewDaysCount: number;
  memorizationDaysCount: number;
  days: WeeklyPlanDay[];
  highlights: string[];
}

export interface NextActionSuggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  targetHref: string;
  cta: string;
  urgency: "low" | "medium" | "high";
  estimatedMinutes: number;
  pageNumbers: number[];
}

export interface DashboardSnapshot {
  currentPage: number;
  completionRatio: number;
  currentSurah: string;
  currentJuzApprox: number;
  currentSegment?: Segment;
  nextStop?: StopSession;
  remainingPages: number;
  todayReviewPages: number;
  weakPagesCount: number;
  projectHealth: "steady" | "busy" | "at-risk";
  currentStreak: number;
  lastSession?: Session;
  estimatedCompletionDate?: string;
  reviewVolume: "low" | "balanced" | "high";
  smartAlerts: SmartAlert[];
  nextAction: NextActionSuggestion;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export interface CumulativePoint {
  date: string;
  memorizedPages: number;
  reviewedPages: number;
}

export interface WeeklyComparisonPoint {
  week: string;
  memorization: number;
  review: number;
}

export interface MonthlyProgressPoint {
  month: string;
  memorized: number;
  reviewed: number;
}

export interface HeatmapPoint {
  date: string;
  intensity: number;
  memorizationPages: number;
  reviewPages: number;
  sessions: number;
}

export interface ReviewCoveragePoint {
  label: string;
  coverage: number;
}

export interface PageAgePoint {
  bucket: string;
  count: number;
}

export interface ForecastPoint {
  label: string;
  actual: number;
  target: number;
}

export interface ReviewVolumeForecastPoint {
  date: string;
  duePages: number;
  weakPages: number;
  criticalPages: number;
}

export interface StreakPoint {
  week: string;
  streak: number;
}

export interface RadarPoint {
  dimension: string;
  score: number;
}

export interface SegmentProgressPoint {
  label: string;
  completed: number;
  remaining: number;
}

export interface StopHistoryPoint {
  label: string;
  plannedDays: number;
  actualDays: number;
}

export interface TestTrendPoint {
  date: string;
  score: number;
  errors: number;
}

export interface AnalyticsMetrics {
  totalMemorizedPages: number;
  totalReviewedPages: number;
  totalSessions: number;
  totalReviewSessions: number;
  totalMemorizationSessions: number;
  averagePagesPerWeek: number;
  averageReviewPagesPerWeek: number;
  averageSessionDuration: number;
  totalWeakPages: number;
  totalCriticalPages: number;
  totalTests: number;
  averageTestScore: number;
  bestStreak: number;
  currentStreak: number;
  missedDays: number;
  completedStops: number;
  estimatedCompletionDate?: string;
  monthlyProgress: MonthlyProgressPoint[];
  quarterlyProgress: MonthlyProgressPoint[];
  yearlyProgress: MonthlyProgressPoint[];
  reviewCoverage7Days: number;
  reviewCoverage14Days: number;
  reviewCoverage30Days: number;
  pagesAtRisk: number;
  strengthDistribution: MetricPoint[];
  mostWeakPages: PageState[];
  strongestPages: PageState[];
  reviewVolumeForecast: ReviewVolumeForecastPoint[];
}

export interface AnalyticsCharts {
  cumulativeProgress: CumulativePoint[];
  weeklyComparison: WeeklyComparisonPoint[];
  monthlyProgress: MonthlyProgressPoint[];
  activityHeatmap: HeatmapPoint[];
  reviewCoverage: ReviewCoveragePoint[];
  pageAgeDistribution: PageAgePoint[];
  weakDistribution: MetricPoint[];
  strengthDistribution: MetricPoint[];
  forecastCompletion: ForecastPoint[];
  reviewVolumeForecast: ReviewVolumeForecastPoint[];
  streakHistory: StreakPoint[];
  radarPerformance: RadarPoint[];
  segmentCompletion: SegmentProgressPoint[];
  stopHistory: StopHistoryPoint[];
  testScoreTrend: TestTrendPoint[];
}

export interface AnalyticsBundle {
  metrics: AnalyticsMetrics;
  charts: AnalyticsCharts;
}

export interface ReportView {
  id: string;
  title: string;
  periodLabel: string;
  memorized: string;
  reviewed: string;
  weakSpots: string[];
  consistency: string;
  recommendations: string[];
}

export interface PersistedAppData {
  version: number;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  sessions: Session[];
  segments: Segment[];
  stopSessions: StopSession[];
  testRecords: TestRecord[];
  tajweedNotes: TajweedNote[];
}

export interface DerivedAppData {
  pageStates: PageState[];
  reviewEngine: ReviewEngineOutput;
  analytics: AnalyticsBundle;
  reports: ReportView[];
  weakPageInsights: WeakPageInsight[];
  weeklyPlanner: WeeklyPlanner;
  dashboard: DashboardSnapshot;
}

export interface AppStoreValue {
  data: PersistedAppData;
  derived: DerivedAppData;
  isHydrated: boolean;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  removeSession: (id: string) => void;
  addTestRecord: (record: TestRecord) => void;
  updateTestRecord: (record: TestRecord) => void;
  removeTestRecord: (id: string) => void;
  addTajweedNote: (note: TajweedNote) => void;
  updateTajweedNote: (note: TajweedNote) => void;
  removeTajweedNote: (id: string) => void;
  addStopSession: (stop: StopSession) => void;
  updateStopSession: (stop: StopSession) => void;
  removeStopSession: (id: string) => void;
  updateSettings: (settings: UserSettings) => void;
  importData: (payload: PersistedAppData) => void;
  resetToSeed: () => void;
}
