"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  removeSavedCollege,
  saveCollegeForUser,
  subscribeToSavedColleges,
  type SavedCollegeRecord,
} from "@/lib/firestore/saved-colleges";
import type { CollegeCompareItem } from "@/types";

interface SavedContextValue {
  user: User | null;
  records: SavedCollegeRecord[];
  savedIds: Set<string>;
  loading: boolean;
  error: string;
  toggle: (college: CollegeCompareItem) => Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedCollegesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    uid: string;
    records: SavedCollegeRecord[];
    error: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    return subscribeToSavedColleges(
      user.uid,
      (nextRecords) => {
        setSnapshot({ uid: user.uid, records: nextRecords, error: "" });
      },
      () => {
        setSnapshot({ uid: user.uid, records: [], error: "Saved colleges could not be loaded." });
      },
    );
  }, [authLoading, user]);

  const records = useMemo(
    () => (user && snapshot?.uid === user.uid ? snapshot.records : []),
    [snapshot, user],
  );
  const loading = authLoading || Boolean(user && snapshot?.uid !== user.uid);
  const error = user && snapshot?.uid === user.uid ? snapshot.error : "";
  const savedIds = useMemo(() => new Set(records.map((record) => record.college.id)), [records]);
  const toggle = useCallback(async (college: CollegeCompareItem) => {
    if (!user) throw new Error("Sign in to save colleges.");
    if (savedIds.has(college.id)) await removeSavedCollege(user.uid, college.id);
    else await saveCollegeForUser(user.uid, college);
  }, [savedIds, user]);

  const value = useMemo(
    () => ({ user, records, savedIds, loading, error, toggle }),
    [error, loading, records, savedIds, toggle, user],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedColleges() {
  const value = useContext(SavedContext);
  if (!value) throw new Error("useSavedColleges must be used inside SavedCollegesProvider.");
  return value;
}
