import { PersistedAppData } from "@/types";

export interface StorageAdapter {
  load: () => PersistedAppData | null;
  save: (payload: PersistedAppData) => void;
  clear: () => void;
}
