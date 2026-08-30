-- AlterTable
ALTER TABLE "ads_campaigns" ADD COLUMN "plannedSpendCents" INTEGER;
ALTER TABLE "ads_campaigns" ADD COLUMN "audience" TEXT;
ALTER TABLE "ads_campaigns" ADD COLUMN "location" TEXT;
ALTER TABLE "ads_campaigns" ADD COLUMN "landingPageUrl" TEXT;
ALTER TABLE "ads_campaigns" ADD COLUMN "conversionGoal" TEXT;
ALTER TABLE "ads_campaigns" ADD COLUMN "callToAction" TEXT;
ALTER TABLE "ads_campaigns" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';
ALTER TABLE "ads_campaigns" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "ads_campaigns" ADD COLUMN "intendedPlatform" TEXT;

-- CreateTable
CREATE TABLE "ads_creatives" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "variantLabel" TEXT,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "callToAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_creatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_platform_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_connected',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_platform_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_landing_page_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "url" TEXT NOT NULL,
    "fetchStatus" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "title" TEXT,
    "excerpt" TEXT,
    "analysis" TEXT,
    "errorMessage" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_landing_page_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ads_creatives_userId_campaignId_idx" ON "ads_creatives"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ads_platform_connections_userId_platform_key" ON "ads_platform_connections"("userId", "platform");

-- CreateIndex
CREATE INDEX "ads_platform_connections_userId_idx" ON "ads_platform_connections"("userId");

-- CreateIndex
CREATE INDEX "ads_landing_page_analyses_userId_campaignId_idx" ON "ads_landing_page_analyses"("userId", "campaignId");

-- CreateIndex
CREATE INDEX "ads_recommendations_userId_campaignId_idx" ON "ads_recommendations"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ads_ai_usage_userId_day_kind_key" ON "ads_ai_usage"("userId", "day", "kind");

-- CreateIndex
CREATE INDEX "ads_ai_usage_userId_day_idx" ON "ads_ai_usage"("userId", "day");

-- AddForeignKey
ALTER TABLE "ads_creatives" ADD CONSTRAINT "ads_creatives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_creatives" ADD CONSTRAINT "ads_creatives_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ads_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_platform_connections" ADD CONSTRAINT "ads_platform_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_landing_page_analyses" ADD CONSTRAINT "ads_landing_page_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_landing_page_analyses" ADD CONSTRAINT "ads_landing_page_analyses_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ads_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_recommendations" ADD CONSTRAINT "ads_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_recommendations" ADD CONSTRAINT "ads_recommendations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ads_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_ai_usage" ADD CONSTRAINT "ads_ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
