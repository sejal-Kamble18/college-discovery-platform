import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/server/billing";
import { requireServerUser, ServerAuthError } from "@/lib/server/firebase-admin";

export async function GET(request: Request) {
  try {
    const user = await requireServerUser(request);
    return NextResponse.json(await getBillingStatus(user.uid), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof ServerAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (process.env.NODE_ENV !== "production") console.error("Billing status failed:", error);
    return NextResponse.json({ error: "Billing status is temporarily unavailable." }, { status: 503 });
  }
}
