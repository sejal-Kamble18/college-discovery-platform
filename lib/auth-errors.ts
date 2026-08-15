const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-api-key": "Firebase rejected this deployment's API key. Copy the Web app configuration into the matching environment and redeploy.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in Firebase Authentication → Sign-in method.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
  "auth/cancelled-popup-request": "Another sign-in window is already open. Finish or close it, then try again.",
  "auth/network-request-failed": "The sign-in request could not reach Firebase. Check your connection and try again.",
  "auth/too-many-requests": "Firebase temporarily limited sign-in attempts. Wait a few minutes and try again.",
  "auth/user-disabled": "This account has been disabled. Contact the site administrator for help.",
  "auth/invalid-credential": "The email or password is incorrect. Check both fields and try again.",
  "auth/wrong-password": "The email or password is incorrect. Check both fields and try again.",
  "auth/user-not-found": "The email or password is incorrect. Check both fields and try again.",
  "auth/email-already-in-use": "An account already exists for this email. Sign in instead or reset your password.",
  "auth/weak-password": "Choose a stronger password with at least six characters.",
  "auth/account-exists-with-different-credential": "This email already uses another sign-in method. Sign in that way first, then connect Google from your account.",
};

export function getFirebaseAuthErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.startsWith("auth/")) return code;
  }

  if (error instanceof Error) {
    return error.message.match(/\((auth\/[a-z-]+)\)/i)?.[1]?.toLowerCase() || null;
  }

  return null;
}

export function formatAuthError(error: unknown, hostname?: string): string {
  const code = getFirebaseAuthErrorCode(error);

  if (code === "auth/unauthorized-domain") {
    const domain = hostname?.trim();
    return domain
      ? `Google sign-in is not authorized for ${domain}. Add this exact domain in Firebase Authentication → Settings → Authorized domains.`
      : "This deployment domain is not authorized for Google sign-in. Add it in Firebase Authentication → Settings → Authorized domains.";
  }

  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];

  if (error instanceof Error && error.message.includes("Firebase is not configured")) {
    return error.message;
  }

  return "We couldn't complete sign-in. Please try again. If it continues, contact the site administrator.";
}
