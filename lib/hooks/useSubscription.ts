"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { BillingStatus } from "@/types";

const FREE_STATUS: BillingStatus = { plan: "free", status: "inactive" };

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<{ uid: string; billing: BillingStatus } | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) {
      setSnapshot(null);
      setError("");
      return FREE_STATUS;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/billing/status", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const body = (await response.json()) as BillingStatus & { error?: string };
      if (!response.ok) throw new Error(body.error || "Billing status could not be loaded.");
      setSnapshot({ uid: user.uid, billing: body });
      setError("");
      return body;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Billing status could not be loaded.");
      return FREE_STATUS;
    }
  }, [user]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const loading = authLoading || Boolean(user && snapshot?.uid !== user.uid && !error);
  const billing = user && snapshot?.uid === user.uid ? snapshot.billing : FREE_STATUS;
  return {
    billing,
    isPro: billing.plan === "pro" && ["active", "trialing"].includes(billing.status),
    loading,
    error,
    refresh,
  };
}
