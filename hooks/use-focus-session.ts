"use client";

import { useEffect, useMemo, useState } from "react";

import { SessionType } from "@/types";

export interface FocusSessionDraft {
  date: string;
  sessionType: SessionType;
  startPage: number;
  endPage: number;
  durationMinutes: number;
  repetitions: number;
  qualityRating: number;
  difficultyRating: number;
  withTeacher: boolean;
  tested: boolean;
  reviewedFromMemory: boolean;
  optionalSurahLabel: string;
  optionalJuzApprox: string;
  notes: string;
  weakPagesText: string;
  tagsText: string;
  isRunning: boolean;
  elapsedMs: number;
  startedAt: number | null;
}

const STORAGE_KEY = "qhc-focus-session";

function createDefaultDraft(): FocusSessionDraft {
  return {
    date: new Date().toISOString().slice(0, 10),
    sessionType: "review",
    startPage: 1,
    endPage: 1,
    durationMinutes: 25,
    repetitions: 0,
    qualityRating: 4,
    difficultyRating: 2,
    withTeacher: false,
    tested: false,
    reviewedFromMemory: true,
    optionalSurahLabel: "",
    optionalJuzApprox: "",
    notes: "",
    weakPagesText: "",
    tagsText: "",
    isRunning: false,
    elapsedMs: 0,
    startedAt: null,
  };
}

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function sanitizeDraft(value: unknown): FocusSessionDraft {
  const defaults = createDefaultDraft();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const candidate = value as Partial<FocusSessionDraft>;

  return {
    date: typeof candidate.date === "string" ? candidate.date : defaults.date,
    sessionType:
      candidate.sessionType &&
      ["memorization", "review", "test", "stop", "ramadan", "tajweed", "mixed"].includes(candidate.sessionType)
        ? candidate.sessionType
        : defaults.sessionType,
    startPage: sanitizeNumber(candidate.startPage, defaults.startPage, 1, 604),
    endPage: sanitizeNumber(candidate.endPage, defaults.endPage, 1, 604),
    durationMinutes: sanitizeNumber(candidate.durationMinutes, defaults.durationMinutes, 1, 240),
    repetitions: sanitizeNumber(candidate.repetitions, defaults.repetitions, 0, 200),
    qualityRating: sanitizeNumber(candidate.qualityRating, defaults.qualityRating, 1, 5),
    difficultyRating: sanitizeNumber(candidate.difficultyRating, defaults.difficultyRating, 1, 5),
    withTeacher: Boolean(candidate.withTeacher),
    tested: Boolean(candidate.tested),
    reviewedFromMemory:
      typeof candidate.reviewedFromMemory === "boolean"
        ? candidate.reviewedFromMemory
        : defaults.reviewedFromMemory,
    optionalSurahLabel:
      typeof candidate.optionalSurahLabel === "string"
        ? candidate.optionalSurahLabel
        : defaults.optionalSurahLabel,
    optionalJuzApprox:
      typeof candidate.optionalJuzApprox === "string"
        ? candidate.optionalJuzApprox
        : defaults.optionalJuzApprox,
    notes: typeof candidate.notes === "string" ? candidate.notes : defaults.notes,
    weakPagesText:
      typeof candidate.weakPagesText === "string"
        ? candidate.weakPagesText
        : defaults.weakPagesText,
    tagsText: typeof candidate.tagsText === "string" ? candidate.tagsText : defaults.tagsText,
    isRunning: Boolean(candidate.isRunning),
    elapsedMs: sanitizeNumber(candidate.elapsedMs, defaults.elapsedMs, 0, 1000 * 60 * 60 * 12),
    startedAt:
      typeof candidate.startedAt === "number" && Number.isFinite(candidate.startedAt)
        ? candidate.startedAt
        : null,
  };
}

function getElapsedMs(draft: FocusSessionDraft, now = Date.now()) {
  return draft.elapsedMs + (draft.isRunning && draft.startedAt ? Math.max(0, now - draft.startedAt) : 0);
}

export function useFocusSession() {
  const [draft, setDraft] = useState<FocusSessionDraft>(() => {
    if (typeof window === "undefined") {
      return createDefaultDraft();
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? sanitizeDraft(JSON.parse(stored)) : createDefaultDraft();
    } catch {
      return createDefaultDraft();
    }
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isHydrated]);

  useEffect(() => {
    if (!draft.isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [draft.isRunning]);

  const elapsedMs = useMemo(() => getElapsedMs(draft, nowMs), [draft, nowMs]);
  const elapsedMinutes = Math.max(0, Math.ceil(elapsedMs / 60000));

  return {
    draft,
    isHydrated,
    elapsedMs,
    elapsedMinutes,
    updateDraft(patch: Partial<FocusSessionDraft>) {
      setDraft((current) => sanitizeDraft({ ...current, ...patch }));
    },
    applyPreset(patch: Partial<FocusSessionDraft>) {
      setDraft((current) =>
        sanitizeDraft({
          ...current,
          ...patch,
          date: new Date().toISOString().slice(0, 10),
        }),
      );
    },
    start() {
      setDraft((current) =>
        current.isRunning
          ? current
          : {
              ...current,
              isRunning: true,
              startedAt: Date.now(),
            },
      );
      setNowMs(Date.now());
    },
    pause() {
      setDraft((current) => ({
        ...current,
        isRunning: false,
        elapsedMs: getElapsedMs(current),
        startedAt: null,
      }));
      setNowMs(0);
    },
    resetTimer() {
      setDraft((current) => ({
        ...current,
        isRunning: false,
        elapsedMs: 0,
        startedAt: null,
        repetitions: 0,
      }));
      setNowMs(0);
    },
    incrementRepetitions(amount = 1) {
      setDraft((current) => ({
        ...current,
        repetitions: Math.max(0, current.repetitions + amount),
      }));
    },
    resetDraft() {
      setDraft(createDefaultDraft());
      setNowMs(0);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  };
}
