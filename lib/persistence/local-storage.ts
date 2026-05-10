import { createSeedData } from "@/data/seed";
import { persistedAppDataSchema } from "@/lib/schemas";
import { PersistedAppData } from "@/types";

import { StorageAdapter } from "./storage-adapter";

const STORAGE_KEY = "quran-hifz-companion:v1";

function parsePayload(rawValue: string): PersistedAppData | null {
  try {
    const parsed = JSON.parse(rawValue);
    return persistedAppDataSchema.parse(parsed);
  } catch {
    return null;
  }
}

export const localStorageAdapter: StorageAdapter = {
  load() {
    if (typeof window === "undefined") {
      return null;
    }

    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return createSeedData();
    }

    return parsePayload(rawValue) ?? createSeedData();
  },
  save(payload) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
  clear() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  },
};
