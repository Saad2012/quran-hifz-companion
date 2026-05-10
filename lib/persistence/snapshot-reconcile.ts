import { PersistedAppData } from "@/types";

export interface SnapshotReconciliation {
  preferredData: PersistedAppData;
  preferredSource: "local" | "cloud";
  shouldWriteCloud: boolean;
  shouldWriteLocal: boolean;
}

function toTimestamp(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function reconcileSnapshots(
  localData: PersistedAppData,
  cloudData: PersistedAppData,
): SnapshotReconciliation {
  const localTimestamp = toTimestamp(localData.updatedAt);
  const cloudTimestamp = toTimestamp(cloudData.updatedAt);

  if (cloudTimestamp > localTimestamp) {
    return {
      preferredData: cloudData,
      preferredSource: "cloud",
      shouldWriteCloud: false,
      shouldWriteLocal: true,
    };
  }

  if (localTimestamp > cloudTimestamp) {
    return {
      preferredData: localData,
      preferredSource: "local",
      shouldWriteCloud: true,
      shouldWriteLocal: false,
    };
  }

  return {
    preferredData: localData,
    preferredSource: "local",
    shouldWriteCloud: false,
    shouldWriteLocal: false,
  };
}
