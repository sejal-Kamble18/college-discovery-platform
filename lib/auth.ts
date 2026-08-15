import { auth, firebaseConfigurationMessage } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { upsertUserProfile } from "@/lib/firestore/users";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function requireAuth() {
  if (!auth) throw new Error(firebaseConfigurationMessage);
  return auth;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(requireAuth(), googleProvider);
  await syncUserProfile(result.user, getAdditionalUserInfo(result)?.isNewUser ?? false);
  return result;
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  const result = await signInWithEmailAndPassword(
    requireAuth(),
    email,
    password
  );
  await syncUserProfile(result.user);
  return result;
}

export async function signupWithEmail(
  name: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(
    requireAuth(),
    email,
    password
  );

  const currentAuth = requireAuth();
  if (currentAuth.currentUser) {
    try {
      await updateProfile(currentAuth.currentUser, { displayName: name });
    } catch (error) {
      console.warn("The account was created, but its display name could not be updated.", error);
    }
    await syncUserProfile(currentAuth.currentUser, true);
  }

  return result;
}

export async function logoutUser() {
  return signOut(requireAuth());
}

export async function requestPasswordReset(email: string) {
  return sendPasswordResetEmail(requireAuth(), email);
}

async function syncUserProfile(user: Parameters<typeof upsertUserProfile>[0], isNew = false) {
  try {
    await upsertUserProfile(user, isNew);
    return true;
  } catch (error) {
    // Authentication is the source of truth for the session. A temporary
    // Firestore/rules problem must not turn a successful sign-in into a
    // misleading OAuth failure for the user.
    console.warn("Signed in, but the Firestore user profile could not be synchronized.", error);
    return false;
  }
}
