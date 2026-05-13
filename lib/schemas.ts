import { z } from "zod";

import { SESSION_REPETITIONS_MAX } from "@/lib/session-form";

const weekdaySchema = z.number().int().min(0).max(6);

export const settingsSchema = z.object({
  appLanguage: z.literal("ar"),
  rtl: z.boolean(),
  targetYears: z.number().int().min(1).max(15),
  newMemorizationDays: z.array(weekdaySchema).min(1),
  reviewDays: z.array(weekdaySchema).min(1),
  maxDaysWithoutReview: z.number().int().min(3).max(40),
  ramadanReviewOnly: z.boolean(),
  stopEnabled: z.boolean(),
  stopLengthDays: z.number().int().min(0).max(14),
  reviewSplitMethod: z.enum(["auto", "weekly", "fortnightly"]),
  theme: z.enum(["nour", "sand", "night"]),
  preferredCharts: z.array(z.string()),
  quickModeEnabled: z.boolean(),
  numerals: z.enum(["arabic-indic", "latin"]),
});

export const sessionSchema = z
  .object({
    id: z.string(),
    date: z.string(),
    sessionType: z.enum(["memorization", "review", "test", "stop", "ramadan", "tajweed", "mixed"]),
    startPage: z.number().int().min(1).max(604),
    endPage: z.number().int().min(1).max(604),
    pagesCount: z.number().int().min(0).max(604),
    durationMinutes: z.number().int().min(0).max(480),
    repetitions: z.number().int().min(0).max(SESSION_REPETITIONS_MAX),
    qualityRating: z.number().int().min(1).max(5),
    difficultyRating: z.number().int().min(1).max(5),
    withTeacher: z.boolean(),
    tested: z.boolean(),
    optionalSurahLabel: z.string().optional(),
    optionalJuzApprox: z.number().int().min(1).max(30).optional(),
    notes: z.string(),
    weakPagesDiscovered: z.array(z.number().int().min(1).max(604)),
    tags: z.array(z.string()),
    reviewedFromMemory: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine((value) => value.endPage >= value.startPage, {
    message: "نهاية الصفحات يجب أن تكون بعد البداية.",
    path: ["endPage"],
  });

export const testRecordSchema = z
  .object({
    id: z.string(),
    date: z.string(),
    type: z.enum(["teacher", "self", "random", "segment", "ramadan"]),
    startPage: z.number().int().min(1).max(604),
    endPage: z.number().int().min(1).max(604),
    score: z.number().min(0).max(100),
    notes: z.string(),
    weakPages: z.array(z.number().int().min(1).max(604)),
    errorsCount: z.number().int().min(0).max(200),
  })
  .refine((value) => value.endPage >= value.startPage, {
    message: "نهاية الصفحات يجب أن تكون بعد البداية.",
    path: ["endPage"],
  });

export const tajweedNoteSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.enum(["makharij", "ghunnah", "madd", "waqf", "qalqalah", "sifaat", "ikhfa", "idghaam"]),
  pageNumber: z.number().int().min(1).max(604),
  severity: z.enum(["low", "medium", "high"]),
  note: z.string(),
  resolved: z.boolean(),
  teacherNote: z.string().optional(),
});

export const segmentSchema = z.object({
  id: z.string(),
  startPage: z.number().int().min(1).max(604),
  endPage: z.number().int().min(1).max(604),
  pagesCount: z.number().int().min(1).max(604),
  label: z.string(),
  startSurah: z.string(),
  endSurah: z.string(),
  stopAfter: z.boolean(),
});

export const stopSessionSchema = z.object({
  id: z.string(),
  segmentId: z.string(),
  plannedStart: z.string(),
  plannedEnd: z.string(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  completed: z.boolean(),
  notes: z.string(),
});

export const persistedAppDataSchema = z.object({
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: settingsSchema,
  sessions: z.array(sessionSchema),
  segments: z.array(segmentSchema),
  stopSessions: z.array(stopSessionSchema),
  testRecords: z.array(testRecordSchema),
  tajweedNotes: z.array(tajweedNoteSchema),
});
