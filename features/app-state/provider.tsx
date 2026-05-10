"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSupabaseAuth } from "@/features/auth/provider";
import { createSeedData } from "@/data/seed";
import { deriveAppData } from "@/lib/domain/app-view";
import { localStorageAdapter } from "@/lib/persistence/local-storage";
import { reconcileSnapshots } from "@/lib/persistence/snapshot-reconcile";
import { supabaseStorageAdapter } from "@/lib/persistence/supabase-storage";
import { persistedAppDataSchema } from "@/lib/schemas";
import {
  AppStoreValue,
  CloudSyncState,
  PersistedAppData,
  Session,
  StopSession,
  TajweedNote,
  TestRecord,
  UserSettings,
} from "@/types";

const HifzContext = createContext<AppStoreValue | null>(null);

function withUpdatedTimestamp(data: PersistedAppData): PersistedAppData {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

function createCloudSyncState(partial: Partial<CloudSyncState>): CloudSyncState {
  return {
    isConfigured: false,
    isAuthenticated: false,
    isSyncing: false,
    status: "local-only",
    message: "التطبيق يعمل الآن محليًا فقط على هذا الجهاز.",
    ...partial,
  };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "تعذر إكمال المزامنة في الوقت الحالي.";
}

export function HifzAppProvider({ children }: { children: React.ReactNode }) {
  const { isConfigured, isLoading: isAuthLoading, user } = useSupabaseAuth();
  const [data, setData] = useState<PersistedAppData>(createSeedData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cloudSync, setCloudSync] = useState<CloudSyncState>(() =>
    createCloudSyncState({ isConfigured }),
  );
  const dataRef = useRef(data);
  const activeUserIdRef = useRef<string | null>(null);
  const hasCompletedInitialSyncRef = useRef(false);
  const lastSyncedPayloadUpdatedAtRef = useRef<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);

  const commitData = useCallback(
    (recipe: (current: PersistedAppData) => PersistedAppData) => {
      setData((current) => withUpdatedTimestamp(recipe(current)));
    },
    [],
  );

  const performCloudSync = useCallback(
    async (mode: "auto" | "push" = "auto") => {
      if (!isConfigured || !user) {
        return false;
      }

      const localData = persistedAppDataSchema.parse(
        JSON.parse(JSON.stringify(dataRef.current)),
      );

      setCloudSync((current) =>
        createCloudSyncState({
          ...current,
          isConfigured: true,
          isAuthenticated: true,
          isSyncing: true,
          status: "syncing",
          error: undefined,
          message:
            mode === "push"
              ? "جاري رفع آخر التعديلات إلى السحابة..."
              : "جاري مطابقة النسخة المحلية مع السحابة...",
        }),
      );

      try {
        if (mode === "push") {
          const syncedAt = await supabaseStorageAdapter.save(user.id, localData);
          lastSyncedPayloadUpdatedAtRef.current = localData.updatedAt;
          setCloudSync(
            createCloudSyncState({
              isConfigured: true,
              isAuthenticated: true,
              isSyncing: false,
              status: "synced",
              lastSyncedAt: syncedAt ?? new Date().toISOString(),
              message: "تم رفع آخر التعديلات بنجاح.",
            }),
          );
          return true;
        }

        const remoteData = await supabaseStorageAdapter.load(user.id);

        if (!remoteData) {
          const syncedAt = await supabaseStorageAdapter.save(user.id, localData);
          lastSyncedPayloadUpdatedAtRef.current = localData.updatedAt;
          setCloudSync(
            createCloudSyncState({
              isConfigured: true,
              isAuthenticated: true,
              isSyncing: false,
              status: "synced",
              lastSyncedAt: syncedAt ?? new Date().toISOString(),
              message: "أنشأنا أول نسخة سحابية من بياناتك الحالية.",
            }),
          );
          return true;
        }

        const reconciliation = reconcileSnapshots(localData, remoteData);

        if (reconciliation.shouldWriteLocal) {
          localStorageAdapter.save(reconciliation.preferredData);
          lastSyncedPayloadUpdatedAtRef.current = reconciliation.preferredData.updatedAt;
          setData(reconciliation.preferredData);
          setCloudSync(
            createCloudSyncState({
              isConfigured: true,
              isAuthenticated: true,
              isSyncing: false,
              status: "synced",
              lastSyncedAt: new Date().toISOString(),
              message: "تم اعتماد أحدث نسخة سحابية وحفظها محليًا.",
            }),
          );
          return true;
        }

        if (reconciliation.shouldWriteCloud) {
          const syncedAt = await supabaseStorageAdapter.save(
            user.id,
            reconciliation.preferredData,
          );
          lastSyncedPayloadUpdatedAtRef.current =
            reconciliation.preferredData.updatedAt;
          setCloudSync(
            createCloudSyncState({
              isConfigured: true,
              isAuthenticated: true,
              isSyncing: false,
              status: "synced",
              lastSyncedAt: syncedAt ?? new Date().toISOString(),
              message: "تم تحديث النسخة السحابية بآخر بياناتك المحلية.",
            }),
          );
          return true;
        }

        lastSyncedPayloadUpdatedAtRef.current = localData.updatedAt;
        setCloudSync(
          createCloudSyncState({
            isConfigured: true,
            isAuthenticated: true,
            isSyncing: false,
            status: "synced",
            lastSyncedAt: new Date().toISOString(),
            message: "النسخة المحلية والسحابية متطابقتان الآن.",
          }),
        );
        return true;
      } catch (error) {
        setCloudSync(
          createCloudSyncState({
            isConfigured: true,
            isAuthenticated: true,
            isSyncing: false,
            status: "error",
            error: toErrorMessage(error),
            message: "حدثت مشكلة أثناء المزامنة. بقيت بياناتك المحلية محفوظة.",
          }),
        );
        return false;
      }
    },
    [isConfigured, user],
  );

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const loaded = localStorageAdapter.load();

    queueMicrotask(() => {
      if (loaded) {
        setData(loaded);
      }

      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorageAdapter.save(data);
    document.documentElement.dataset.theme = data.settings.theme;
  }, [data, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isConfigured) {
      activeUserIdRef.current = null;
      hasCompletedInitialSyncRef.current = true;
      lastSyncedPayloadUpdatedAtRef.current = null;
      queueMicrotask(() => {
        setCloudSync(
          createCloudSyncState({
            isConfigured: false,
            isAuthenticated: false,
            isSyncing: false,
            status: "local-only",
            message: "المزامنة السحابية غير مفعلة في هذه البيئة، والبيانات تبقى محلية فقط.",
          }),
        );
      });
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!user) {
      activeUserIdRef.current = null;
      hasCompletedInitialSyncRef.current = false;
      lastSyncedPayloadUpdatedAtRef.current = null;
      queueMicrotask(() => {
        setCloudSync(
          createCloudSyncState({
            isConfigured: true,
            isAuthenticated: false,
            isSyncing: false,
            status: "auth-required",
            message: "سجّل الدخول لتفعيل النسخ الاحتياطي والمزامنة بين أجهزتك.",
          }),
        );
      });
      return;
    }

    if (activeUserIdRef.current !== user.id) {
      activeUserIdRef.current = user.id;
      hasCompletedInitialSyncRef.current = false;
      lastSyncedPayloadUpdatedAtRef.current = null;
    }

    if (hasCompletedInitialSyncRef.current) {
      return;
    }

    let cancelled = false;

    void performCloudSync("auto").then((success) => {
      if (!cancelled && success) {
        hasCompletedInitialSyncRef.current = true;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isConfigured, isHydrated, performCloudSync, user]);

  useEffect(() => {
    if (!isHydrated || !isConfigured || !user || !hasCompletedInitialSyncRef.current) {
      return;
    }

    if (lastSyncedPayloadUpdatedAtRef.current === data.updatedAt) {
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void performCloudSync("push");
    }, 1200);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [data.updatedAt, isConfigured, isHydrated, performCloudSync, user]);

  useEffect(
    () => () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    },
    [],
  );

  const derived = useMemo(() => deriveAppData(data), [data]);

  const value = useMemo<AppStoreValue>(
    () => ({
      data,
      derived,
      isHydrated,
      cloudSync,
      addSession(session) {
        commitData((current) => ({
          ...current,
          sessions: [...current.sessions, session].sort((left, right) =>
            left.date.localeCompare(right.date),
          ),
        }));
      },
      updateSession(session) {
        commitData((current) => ({
          ...current,
          sessions: current.sessions
            .map((item) => (item.id === session.id ? session : item))
            .sort((left, right) => left.date.localeCompare(right.date)),
        }));
      },
      removeSession(id) {
        commitData((current) => ({
          ...current,
          sessions: current.sessions.filter((session) => session.id !== id),
        }));
      },
      addTestRecord(record) {
        commitData((current) => ({
          ...current,
          testRecords: [...current.testRecords, record].sort((left, right) =>
            left.date.localeCompare(right.date),
          ),
        }));
      },
      updateTestRecord(record) {
        commitData((current) => ({
          ...current,
          testRecords: current.testRecords
            .map((item) => (item.id === record.id ? record : item))
            .sort((left, right) => left.date.localeCompare(right.date)),
        }));
      },
      removeTestRecord(id) {
        commitData((current) => ({
          ...current,
          testRecords: current.testRecords.filter((record) => record.id !== id),
        }));
      },
      addTajweedNote(note) {
        commitData((current) => ({
          ...current,
          tajweedNotes: [...current.tajweedNotes, note].sort((left, right) =>
            left.date.localeCompare(right.date),
          ),
        }));
      },
      updateTajweedNote(note) {
        commitData((current) => ({
          ...current,
          tajweedNotes: current.tajweedNotes
            .map((item) => (item.id === note.id ? note : item))
            .sort((left, right) => left.date.localeCompare(right.date)),
        }));
      },
      removeTajweedNote(id) {
        commitData((current) => ({
          ...current,
          tajweedNotes: current.tajweedNotes.filter((note) => note.id !== id),
        }));
      },
      addStopSession(stop) {
        commitData((current) => ({
          ...current,
          stopSessions: [...current.stopSessions, stop].sort((left, right) =>
            left.plannedStart.localeCompare(right.plannedStart),
          ),
        }));
      },
      updateStopSession(stop) {
        commitData((current) => ({
          ...current,
          stopSessions: current.stopSessions
            .map((item) => (item.id === stop.id ? stop : item))
            .sort((left, right) =>
              left.plannedStart.localeCompare(right.plannedStart),
            ),
        }));
      },
      removeStopSession(id) {
        commitData((current) => ({
          ...current,
          stopSessions: current.stopSessions.filter((stop) => stop.id !== id),
        }));
      },
      updateSettings(settings) {
        commitData((current) => ({
          ...current,
          settings,
        }));
      },
      importData(payload) {
        const parsed = persistedAppDataSchema.parse(payload);
        setData(withUpdatedTimestamp(parsed));
      },
      resetToSeed() {
        const fresh = createSeedData();
        localStorageAdapter.clear();
        setData(withUpdatedTimestamp(fresh));
      },
      syncNow() {
        return performCloudSync("auto");
      },
    }),
    [cloudSync, commitData, data, derived, isHydrated, performCloudSync],
  );

  return <HifzContext.Provider value={value}>{children}</HifzContext.Provider>;
}

export function useHifzApp() {
  const context = useContext(HifzContext);

  if (!context) {
    throw new Error("useHifzApp must be used inside HifzAppProvider");
  }

  return context;
}

export type { Session, StopSession, TajweedNote, TestRecord, UserSettings };
