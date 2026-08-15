"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/lib/auth";
import { isFirebaseReady } from "@/lib/firebase";

export function AuthMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />;
  if (!isFirebaseReady) {
    return <Link href="/setup" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">Setup needed</Link>;
  }
  if (!user) {
    return <Link href="/auth/login" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Sign in</Link>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-36 truncate text-sm font-semibold text-slate-700 sm:block">{user.displayName || user.email}</span>
      <button
        type="button"
        onClick={async () => {
          await logoutUser();
          router.push("/");
          router.refresh();
        }}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Sign out
      </button>
    </div>
  );
}
