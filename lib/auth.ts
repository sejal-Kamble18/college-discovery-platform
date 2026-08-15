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

function requireAuth() {
  if (!auth) throw new Error(firebaseConfigurationMessage);
  return auth;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(requireAuth(), googleProvider);
  await upsertUserProfile(result.user, getAdditionalUserInfo(result)?.isNewUser ?? false);
  return result;
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    requireAuth(),
    email,
    password
  );
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
    await updateProfile(currentAuth.currentUser, {
      displayName: name,
    });
    await upsertUserProfile(currentAuth.currentUser, true);
  }

  return result;
}

export async function logoutUser() {
  return signOut(requireAuth());
}

export async function requestPasswordReset(email: string) {
  return sendPasswordResetEmail(requireAuth(), email);
}
