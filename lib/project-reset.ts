import { createDefaultSegments } from "@/data/quran-meta";
import { DEFAULT_SETTINGS } from "@/data/seed";
import { PersistedAppData, UserSettings } from "@/types";

interface CreateEmptyProjectDataOptions {
  settings?: UserSettings;
  now?: string;
}

export function createEmptyProjectData({
  settings = DEFAULT_SETTINGS,
  now = new Date().toISOString(),
}: CreateEmptyProjectDataOptions = {}): PersistedAppData {
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings,
    sessions: [],
    segments: createDefaultSegments(),
    stopSessions: [],
    testRecords: [],
    tajweedNotes: [],
  };
}
