"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/lib/hooks/useSubscription";

interface PricingClientProps {
  checkoutResult?: string;
  priceLabel: string;
  billingConfigured: boolean;
}

export function PricingClient({ checkoutResult, priceLabel, billingConfigured }: PricingClientProps) {
  const { user } = useAuth();
  const { billing, isPro, loading, error, refresh } = useSubscription();
  const [action, setAction] = useState<"checkout" | "portal" | "">("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (checkoutResult !== "success" || isPro || !user) return;
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      void refresh();
      if (attempts >= 10) window.clearInterval(interval);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, [checkoutResult, isPro, refresh, user]);

  async function openBilling(endpoint: "checkout" | "portal") {
    setActionError("");
    if (!user) {
      window.location.href = `/auth/login?returnTo=${encodeURIComponent("/pricing")}`;
      return;
    }
    setAction(endpoint);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/billing/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || "Billing could not be opened.");
      window.location.assign(body.url);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Billing could not be opened.");
      setAction("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">Simple pricing</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Start free. Upgrade when planning gets serious.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">College discovery stays free. Pro unlocks advanced cutoff workflows, saved scenarios and exports.</p>
      </div>

      {checkoutResult === "success" && (
        <div className={`mx-auto mt-8 max-w-3xl rounded-xl border p-4 text-sm ${isPro ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
          {isPro ? "Your Pro subscription is active." : "Payment received. Pro access is being activated by the secure webhook; this page will refresh automatically."}
        </div>
      )}
      {checkoutResult === "canceled" && <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Checkout was canceled. Your free account was not changed.</div>}

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
        <PlanCard
          name="Free"
          price="₹0"
          description="Explore institutions and test the core predictor."
          features={["India-wide directory search", "College profiles and comparison", "Basic exam/category cutoff matching", "Private saved-college shortlist"]}
          action={<Link href="/colleges" className="inline-flex w-full justify-center rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50">Explore free</Link>}
        />
        <PlanCard
          featured
          name="Pro"
          price={priceLabel}
          description="For students actively building an admission strategy."
          features={["Everything in Free", "State, course, quota and year predictor filters", "Saved predictor scenarios", "CSV result exports", "Stripe-hosted subscription management"]}
          action={isPro ? (
            <button type="button" disabled={action === "portal"} onClick={() => void openBilling("portal")} className="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50">{action === "portal" ? "Opening…" : "Manage billing"}</button>
          ) : (
            <button type="button" disabled={!billingConfigured || action === "checkout" || loading} onClick={() => void openBilling("checkout")} className="w-full rounded-xl bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{!billingConfigured ? "Billing setup required" : action === "checkout" ? "Opening secure checkout…" : "Upgrade with Stripe"}</button>
          )}
        />
      </div>

      {(actionError || error) && <p role="alert" className="mx-auto mt-6 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{actionError || error}</p>}
      {user && <p className="mt-8 text-center text-sm text-slate-500">Current plan: <span className="font-bold capitalize text-slate-800">{billing.plan}</span> · Status: <span className="font-semibold capitalize">{billing.status.replace("_", " ")}</span></p>}
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-slate-500">Payments are collected on Stripe-hosted Checkout. Configure the displayed amount, tax behavior, currency, refund policy and customer portal in your Stripe account before enabling live mode.</p>
    </div>
  );
}

function PlanCard({ name, price, description, features, action, featured = false }: { name: string; price: string; description: string; features: string[]; action: ReactNode; featured?: boolean }) {
  return (
    <article className={`relative flex flex-col rounded-3xl border bg-white p-7 shadow-sm ${featured ? "border-brand-500 shadow-xl shadow-blue-100" : "border-slate-200"}`}>
      {featured && <span className="absolute right-6 top-6 rounded-full bg-brand-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-brand-700">Recommended</span>}
      <h2 className="text-2xl font-black text-slate-950">{name}</h2>
      <p className="mt-4 text-4xl font-black text-slate-950">{price}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="my-7 space-y-3 text-sm text-slate-700">
        {features.map((feature) => <li key={feature} className="flex gap-3"><span className="font-black text-emerald-600">✓</span><span>{feature}</span></li>)}
      </ul>
      <div className="mt-auto">{action}</div>
    </article>
  );
}
