import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, firebaseConfigurationMessage } from "@/lib/firebase";

export async function upsertUserProfile(user: User, isNew = false) {
  if (!db) throw new Error(firebaseConfigurationMessage);
  const profile: Record<string, unknown> = {
    uid: user.uid,
    displayName: user.displayName || "Student",
    email: user.email,
    photoURL: user.photoURL,
    role: "student",
    updatedAt: serverTimestamp(),
  };

  if (isNew) profile.createdAt = serverTimestamp();
  await setDoc(doc(db, "users", user.uid), profile, { merge: true });
}
