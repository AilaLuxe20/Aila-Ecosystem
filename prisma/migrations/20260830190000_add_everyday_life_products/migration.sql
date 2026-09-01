-- CreateTable
CREATE TABLE "writer_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "folder" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translate_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translate_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "extractedCharCount" INTEGER NOT NULL,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_courses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_quizzes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userAnswer" TEXT,
    "correct" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "interviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_habits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "category" TEXT NOT NULL,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_budgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "limitCents" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'month',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetCents" INTEGER NOT NULL,
    "savedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3),
    "endsOn" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_shipments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "packageDesc" TEXT NOT NULL,
    "weightKg" DECIMAL(8,2),
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "writer_documents_userId_updatedAt_idx" ON "writer_documents"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "translate_entries_userId_createdAt_idx" ON "translate_entries"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "library_documents_userId_updatedAt_idx" ON "library_documents"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "coding_projects_userId_updatedAt_idx" ON "coding_projects"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "education_courses_userId_status_idx" ON "education_courses"("userId", "status");

-- CreateIndex
CREATE INDEX "education_notes_userId_updatedAt_idx" ON "education_notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "education_notes_courseId_idx" ON "education_notes"("courseId");

-- CreateIndex
CREATE INDEX "education_quizzes_userId_courseId_idx" ON "education_quizzes"("userId", "courseId");

-- CreateIndex
CREATE INDEX "career_resumes_userId_updatedAt_idx" ON "career_resumes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "career_applications_userId_status_idx" ON "career_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "health_habits_userId_updatedAt_idx" ON "health_habits"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "health_logs_userId_loggedAt_idx" ON "health_logs"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "finance_transactions_userId_occurredAt_idx" ON "finance_transactions"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "finance_transactions_userId_kind_idx" ON "finance_transactions"("userId", "kind");

-- CreateIndex
CREATE INDEX "finance_budgets_userId_category_idx" ON "finance_budgets"("userId", "category");

-- CreateIndex
CREATE INDEX "finance_goals_userId_updatedAt_idx" ON "finance_goals"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "travel_trips_userId_status_idx" ON "travel_trips"("userId", "status");

-- CreateIndex
CREATE INDEX "shipping_shipments_userId_status_idx" ON "shipping_shipments"("userId", "status");

-- AddForeignKey
ALTER TABLE "writer_documents" ADD CONSTRAINT "writer_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translate_entries" ADD CONSTRAINT "translate_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_documents" ADD CONSTRAINT "library_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_projects" ADD CONSTRAINT "coding_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_courses" ADD CONSTRAINT "education_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_notes" ADD CONSTRAINT "education_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_notes" ADD CONSTRAINT "education_notes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "education_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_quizzes" ADD CONSTRAINT "education_quizzes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_quizzes" ADD CONSTRAINT "education_quizzes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "education_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resumes" ADD CONSTRAINT "career_resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_applications" ADD CONSTRAINT "career_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_habits" ADD CONSTRAINT "health_habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_goals" ADD CONSTRAINT "finance_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_trips" ADD CONSTRAINT "travel_trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_shipments" ADD CONSTRAINT "shipping_shipments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
