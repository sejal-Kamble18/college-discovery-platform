import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    auth,
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
    auth,
    email,
    password
  );

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: name,
    });
  }

  return result;
}

export async function logoutUser() {
  return signOut(auth);
}