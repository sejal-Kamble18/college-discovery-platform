import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export class ServerAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ServerAuthError";
  }
}

function adminCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  return projectId && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null;
}

let serverApp: App | null = null;

export function getServerFirebaseApp() {
  if (serverApp) return serverApp;
  const credentials = adminCredentials();
  if (!credentials) {
    throw new ServerAuthError("Server billing authentication is not configured.", 503);
  }
  serverApp = getApps().find((app) => app.name === "edudiscover-server") || initializeApp({
    credential: cert(credentials),
    projectId: credentials.projectId,
  }, "edudiscover-server");
  return serverApp;
}

export function getServerFirestore() {
  return getFirestore(getServerFirebaseApp());
}

export function getServerAuth() {
  return getAuth(getServerFirebaseApp());
}

export async function requireServerUser(request: Request): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) throw new ServerAuthError("Sign in to continue.", 401);
  try {
    return await getServerAuth().verifyIdToken(token, true);
  } catch {
    throw new ServerAuthError("Your session is invalid or expired. Sign in again.", 401);
  }
}
