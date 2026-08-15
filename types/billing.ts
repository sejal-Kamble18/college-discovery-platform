export type SubscriptionPlan = "free" | "pro";
export type SubscriptionState = "inactive" | "trialing" | "active" | "past_due" | "canceled";

export interface BillingStatus {
  plan: SubscriptionPlan;
  status: SubscriptionState;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
}
