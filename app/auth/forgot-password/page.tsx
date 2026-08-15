"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter the email connected to your EduDiscover account.</p>

        {message && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
        {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <form
          className="mt-6 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            setLoading(true);
            try {
              await requestPasswordReset(email.trim());
              setMessage("If this address has an account, Firebase will send password-reset instructions.");
            } catch {
              setError("Password reset could not be requested. Check the address and try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">Email address</label>
            <input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Sending…" : "Send reset email"}
          </button>
        </form>
        <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-brand-700">Back to sign in</Link>
      </div>
    </div>
  );
}
