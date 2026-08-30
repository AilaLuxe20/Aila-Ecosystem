-- AlterTable
ALTER TABLE "billing_subscriptions" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "daily_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_notes_userId_updatedAt_idx" ON "daily_notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "daily_goals_userId_status_idx" ON "daily_goals"("userId", "status");

-- CreateIndex
CREATE INDEX "daily_goals_userId_dueAt_idx" ON "daily_goals"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_createdAt_idx" ON "stripe_webhook_events"("createdAt");

-- AddForeignKey
ALTER TABLE "daily_notes" ADD CONSTRAINT "daily_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
