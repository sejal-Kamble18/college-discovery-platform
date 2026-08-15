import { isBillingConfigured } from "@/lib/server/billing";
import { PricingClient } from "@/components/billing/PricingClient";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  return (
    <PricingClient
      checkoutResult={checkout}
      priceLabel={process.env.NEXT_PUBLIC_PRO_PRICE_LABEL?.trim() || "Set in Stripe"}
      billingConfigured={isBillingConfigured()}
    />
  );
}
