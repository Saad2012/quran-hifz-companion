import { z } from "zod";

import { Session, SessionType } from "@/types";

export const SESSION_REPETITIONS_MAX = 300;

export const sessionFormSchema = z
  .object({
    date: z.string().min(1),
    sessionType: z.enum([
      "memorization",
      "review",
      "test",
      "stop",
      "ramadan",
      "tajweed",
      "mixed",
    ]),
    startPage: z.coerce.number().int().min(1).max(604),
    endPage: z.coerce.number().int().min(1).max(604),
    durationMinutes: z.coerce.number().int().min(0).max(600),
    repetitions: z.coerce.number().int().min(0).max(SESSION_REPETITIONS_MAX),
    qualityRating: z.coerce.number().int().min(1).max(5),
    difficultyRating: z.coerce.number().int().min(1).max(5),
    withTeacher: z.boolean(),
    tested: z.boolean(),
    reviewedFromMemory: z.boolean(),
    optionalSurahLabel: z.string().optional(),
    optionalJuzApprox: z.string().optional(),
    notes: z.string(),
    weakPagesText: z.string().optional(),
    tagsText: z.string().optional(),
  })
  .refine((value) => value.endPage >= value.startPage, {
    path: ["endPage"],
    message: "نهاية الصفحات يجب أن تكون بعد البداية.",
  });

export type SessionFormValues = z.input<typeof sessionFormSchema>;
export type SessionSubmitValues = z.output<typeof sessionFormSchema>;

function parseNumbers(value?: string) {
  return (value ?? "")
    .split(/[,\s،]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 604);
}

function parseTags(value?: string) {
  return (value ?? "")
    .split(/[,\n،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
}

interface SessionDefaultsOptions {
  session?: Session;
  preset?: Partial<Session>;
}

export function createSessionFormDefaults({
  session,
  preset,
}: SessionDefaultsOptions): SessionFormValues {
  return {
    date: session?.date ?? preset?.date ?? new Date().toISOString().slice(0, 10),
    sessionType: (session?.sessionType ?? preset?.sessionType ?? "review") as SessionType,
    startPage: session?.startPage ?? preset?.startPage ?? 1,
    endPage: session?.endPage ?? preset?.endPage ?? 1,
    durationMinutes: session?.durationMinutes ?? preset?.durationMinutes ?? 30,
    repetitions: session?.repetitions ?? preset?.repetitions ?? 3,
    qualityRating: session?.qualityRating ?? preset?.qualityRating ?? 4,
    difficultyRating: session?.difficultyRating ?? preset?.difficultyRating ?? 2,
    withTeacher: session?.withTeacher ?? preset?.withTeacher ?? false,
    tested: session?.tested ?? preset?.tested ?? false,
    reviewedFromMemory:
      session?.reviewedFromMemory ?? preset?.reviewedFromMemory ?? true,
    optionalSurahLabel:
      session?.optionalSurahLabel ?? preset?.optionalSurahLabel ?? "",
    optionalJuzApprox: String(
      session?.optionalJuzApprox ?? preset?.optionalJuzApprox ?? "",
    ),
    notes: session?.notes ?? preset?.notes ?? "",
    weakPagesText:
      session?.weakPagesDiscovered?.join("، ") ??
      preset?.weakPagesDiscovered?.join("، ") ??
      "",
    tagsText: session?.tags?.join("، ") ?? preset?.tags?.join("، ") ?? "",
  };
}

export function createSessionRecord(
  values: SessionSubmitValues,
  session?: Session,
): Session {
  const nowStamp = new Date().toISOString();

  return {
    id: session?.id ?? createSessionId(),
    date: values.date,
    sessionType: values.sessionType,
    startPage: values.startPage,
    endPage: values.endPage,
    pagesCount: values.endPage - values.startPage + 1,
    durationMinutes: values.durationMinutes,
    repetitions: values.repetitions,
    qualityRating: values.qualityRating,
    difficultyRating: values.difficultyRating,
    withTeacher: values.withTeacher,
    tested: values.tested,
    optionalSurahLabel: values.optionalSurahLabel || undefined,
    optionalJuzApprox: values.optionalJuzApprox
      ? Number(values.optionalJuzApprox)
      : undefined,
    notes: values.notes,
    weakPagesDiscovered: parseNumbers(values.weakPagesText),
    tags: parseTags(values.tagsText),
    reviewedFromMemory: values.reviewedFromMemory,
    createdAt: session?.createdAt ?? nowStamp,
    updatedAt: nowStamp,
  };
}
