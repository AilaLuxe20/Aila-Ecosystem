-- Paystack Pro subscription fields (Stripe commerce fields remain optional)

ALTER TABLE "User" ADD COLUMN "paystackCustomerCode" TEXT;

CREATE UNIQUE INDEX "User_paystackCustomerCode_key" ON "User"("paystackCustomerCode");

ALTER TABLE "billing_subscriptions" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'paystack';
ALTER TABLE "billing_subscriptions" ADD COLUMN "paystackSubscriptionCode" TEXT;
ALTER TABLE "billing_subscriptions" ADD COLUMN "paystackCustomerCode" TEXT;
ALTER TABLE "billing_subscriptions" ADD COLUMN "paystackPlanCode" TEXT;
ALTER TABLE "billing_subscriptions" ADD COLUMN "paystackEmailToken" TEXT;
ALTER TABLE "billing_subscriptions" ADD COLUMN "interval" TEXT;

ALTER TABLE "billing_subscriptions" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;
ALTER TABLE "billing_subscriptions" ALTER COLUMN "stripePriceId" DROP NOT NULL;

CREATE UNIQUE INDEX "billing_subscriptions_paystackSubscriptionCode_key" ON "billing_subscriptions"("paystackSubscriptionCode");
CREATE INDEX "billing_subscriptions_paystackCustomerCode_idx" ON "billing_subscriptions"("paystackCustomerCode");

CREATE TABLE "paystack_webhook_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "paystack_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "paystack_webhook_events_createdAt_idx" ON "paystack_webhook_events"("createdAt");
