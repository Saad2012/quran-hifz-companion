import { PersistedAppData } from "@/types";

export interface StorageAdapter {
  load: () => PersistedAppData | null;
  save: (payload: PersistedAppData) => void;
  clear: () => void;
}

export interface CloudStorageAdapter {
  load: (userId: string) => Promise<PersistedAppData | null>;
  save: (userId: string, payload: PersistedAppData) => Promise<string | undefined>;
  clear: (userId: string) => Promise<void>;
}
