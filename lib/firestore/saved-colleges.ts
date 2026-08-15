import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, firebaseConfigurationMessage } from "@/lib/firebase";
import type { CollegeCompareItem } from "@/types";

export interface SavedCollegeRecord {
  id: string;
  college: CollegeCompareItem;
  savedAt?: unknown;
}

function savedCollection(uid: string) {
  if (!db) throw new Error(firebaseConfigurationMessage);
  return collection(db, "users", uid, "savedColleges");
}

export function subscribeToSavedColleges(
  uid: string,
  onChange: (records: SavedCollegeRecord[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    savedCollection(uid),
    (snapshot) => {
      const records = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }) as SavedCollegeRecord)
        .filter((item) => Boolean(item.college));
      onChange(records);
    },
    onError,
  );
}

export async function saveCollegeForUser(uid: string, college: CollegeCompareItem) {
  await setDoc(doc(savedCollection(uid), college.id), {
    college,
    savedAt: serverTimestamp(),
  });
}

export async function removeSavedCollege(uid: string, collegeId: string) {
  await deleteDoc(doc(savedCollection(uid), collegeId));
}
