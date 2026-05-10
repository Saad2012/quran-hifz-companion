"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createSeedData } from "@/data/seed";
import { deriveAppData } from "@/lib/domain/app-view";
import { localStorageAdapter } from "@/lib/persistence/local-storage";
import { persistedAppDataSchema } from "@/lib/schemas";
import { AppStoreValue, PersistedAppData, Session, StopSession, TajweedNote, TestRecord, UserSettings } from "@/types";

const HifzContext = createContext<AppStoreValue | null>(null);

function withUpdatedTimestamp(data: PersistedAppData): PersistedAppData {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

export function HifzAppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PersistedAppData>(createSeedData);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const derived = useMemo(() => deriveAppData(data), [data]);

  const value = useMemo<AppStoreValue>(
    () => ({
      data,
      derived,
      isHydrated,
      addSession(session) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            sessions: [...current.sessions, session].sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      updateSession(session) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            sessions: current.sessions
              .map((item) => (item.id === session.id ? session : item))
              .sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      removeSession(id) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            sessions: current.sessions.filter((session) => session.id !== id),
          }),
        );
      },
      addTestRecord(record) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            testRecords: [...current.testRecords, record].sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      updateTestRecord(record) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            testRecords: current.testRecords
              .map((item) => (item.id === record.id ? record : item))
              .sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      removeTestRecord(id) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            testRecords: current.testRecords.filter((record) => record.id !== id),
          }),
        );
      },
      addTajweedNote(note) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            tajweedNotes: [...current.tajweedNotes, note].sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      updateTajweedNote(note) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            tajweedNotes: current.tajweedNotes
              .map((item) => (item.id === note.id ? note : item))
              .sort((left, right) => left.date.localeCompare(right.date)),
          }),
        );
      },
      removeTajweedNote(id) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            tajweedNotes: current.tajweedNotes.filter((note) => note.id !== id),
          }),
        );
      },
      addStopSession(stop) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            stopSessions: [...current.stopSessions, stop].sort((left, right) => left.plannedStart.localeCompare(right.plannedStart)),
          }),
        );
      },
      updateStopSession(stop) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            stopSessions: current.stopSessions
              .map((item) => (item.id === stop.id ? stop : item))
              .sort((left, right) => left.plannedStart.localeCompare(right.plannedStart)),
          }),
        );
      },
      removeStopSession(id) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            stopSessions: current.stopSessions.filter((stop) => stop.id !== id),
          }),
        );
      },
      updateSettings(settings) {
        setData((current) =>
          withUpdatedTimestamp({
            ...current,
            settings,
          }),
        );
      },
      importData(payload) {
        const parsed = persistedAppDataSchema.parse(payload);
        setData(withUpdatedTimestamp(parsed));
      },
      resetToSeed() {
        const fresh = createSeedData();
        localStorageAdapter.clear();
        setData(fresh);
      },
    }),
    [data, derived, isHydrated],
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
