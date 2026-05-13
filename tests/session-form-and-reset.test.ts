import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_SETTINGS } from "@/data/seed";
import {
  SESSION_REPETITIONS_MAX,
  createSessionFormDefaults,
  createSessionRecord,
  sessionFormSchema,
} from "@/lib/session-form";
import { createEmptyProjectData } from "@/lib/project-reset";
import { Session } from "@/types";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "session-1",
    date: "2026-05-13",
    sessionType: "review",
    startPage: 10,
    endPage: 12,
    pagesCount: 3,
    durationMinutes: 20,
    repetitions: 3,
    qualityRating: 4,
    difficultyRating: 2,
    withTeacher: false,
    tested: false,
    notes: "جلسة سابقة",
    weakPagesDiscovered: [11],
    tags: ["مراجعة"],
    reviewedFromMemory: true,
    createdAt: "2026-05-13T08:00:00.000Z",
    updatedAt: "2026-05-13T08:00:00.000Z",
    ...overrides,
  };
}

test("sessionFormSchema allows repetitions above sixty and createSessionRecord keeps them", () => {
  const parsed = sessionFormSchema.parse({
    date: "2026-05-13",
    sessionType: "memorization",
    startPage: 20,
    endPage: 21,
    durationMinutes: 35,
    repetitions: 120,
    qualityRating: 5,
    difficultyRating: 3,
    withTeacher: true,
    tested: false,
    reviewedFromMemory: true,
    optionalSurahLabel: "سورة مريم",
    optionalJuzApprox: "16",
    notes: "تكرار مرتفع",
    weakPagesText: "21",
    tagsText: "تركيز، صباح",
  });

  const record = createSessionRecord(parsed);

  assert.equal(SESSION_REPETITIONS_MAX >= 120, true);
  assert.equal(record.repetitions, 120);
  assert.equal(record.pagesCount, 2);
  assert.deepEqual(record.weakPagesDiscovered, [21]);
  assert.deepEqual(record.tags, ["تركيز", "صباح"]);
});

test("createSessionFormDefaults reflects the latest edited session values", () => {
  const defaults = createSessionFormDefaults({
    session: makeSession({
      repetitions: 88,
      notes: "تم التعديل",
      weakPagesDiscovered: [30, 31],
      tags: ["محدّث"],
    }),
  });

  assert.equal(defaults.repetitions, 88);
  assert.equal(defaults.notes, "تم التعديل");
  assert.equal(defaults.weakPagesText, "30، 31");
  assert.equal(defaults.tagsText, "محدّث");
});

test("createEmptyProjectData clears project activity while preserving current settings", () => {
  const data = createEmptyProjectData({
    settings: {
      ...DEFAULT_SETTINGS,
      theme: "night",
      targetYears: 2,
    },
    now: "2026-05-13T10:00:00.000Z",
  });

  assert.equal(data.sessions.length, 0);
  assert.equal(data.testRecords.length, 0);
  assert.equal(data.tajweedNotes.length, 0);
  assert.equal(data.stopSessions.length, 0);
  assert.equal(data.settings.theme, "night");
  assert.equal(data.settings.targetYears, 2);
  assert.ok(data.segments.length > 0);
});
