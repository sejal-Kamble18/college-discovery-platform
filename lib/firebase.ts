import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

const missingConfigurationMessage =
  "Firebase is not configured for this deployment. Add the NEXT_PUBLIC_FIREBASE_* values from the same Firebase Web app and restart or redeploy the app.";

function isUsableConfigurationValue(value: string | undefined) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  return !/^(your_|replace|example|changeme|xxx)/i.test(value.trim());
}

export const isFirebaseConfigured = requiredValues.every(
  isUsableConfigurationValue,
);

export let firebaseConfigurationMessage = missingConfigurationMessage;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    firebaseConfigurationMessage =
      "Firebase could not initialize. Confirm that every NEXT_PUBLIC_FIREBASE_* value comes from the same Firebase Web app, then redeploy.";
    if (process.env.NODE_ENV !== "production") {
      console.error(firebaseConfigurationMessage, error);
    }
  }
}

export const isFirebaseReady = Boolean(app && auth && db);
export { auth, db };

export default app;
