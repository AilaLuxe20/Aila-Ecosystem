-- CreateTable
CREATE TABLE "writer_books" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "premise" TEXT NOT NULL DEFAULT '',
    "genre" TEXT NOT NULL DEFAULT '',
    "themes" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "tone" TEXT NOT NULL DEFAULT '',
    "worldBible" TEXT NOT NULL DEFAULT '',
    "storyBible" TEXT NOT NULL DEFAULT '',
    "plot" TEXT NOT NULL DEFAULT '',
    "outline" TEXT NOT NULL DEFAULT '',
    "locations" TEXT NOT NULL DEFAULT '',
    "timeline" TEXT NOT NULL DEFAULT '',
    "continuityNotes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writer_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writer_characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "appearance" TEXT NOT NULL DEFAULT '',
    "motivation" TEXT NOT NULL DEFAULT '',
    "relationships" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writer_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writer_chapters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "scenePlan" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writer_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "writer_books_userId_updatedAt_idx" ON "writer_books"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "writer_characters_userId_idx" ON "writer_characters"("userId");

-- CreateIndex
CREATE INDEX "writer_characters_bookId_updatedAt_idx" ON "writer_characters"("bookId", "updatedAt");

-- CreateIndex
CREATE INDEX "writer_chapters_userId_idx" ON "writer_chapters"("userId");

-- CreateIndex
CREATE INDEX "writer_chapters_bookId_position_idx" ON "writer_chapters"("bookId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "writer_chapters_bookId_position_key" ON "writer_chapters"("bookId", "position");

-- AddForeignKey
ALTER TABLE "writer_books" ADD CONSTRAINT "writer_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writer_characters" ADD CONSTRAINT "writer_characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writer_characters" ADD CONSTRAINT "writer_characters_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "writer_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writer_chapters" ADD CONSTRAINT "writer_chapters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writer_chapters" ADD CONSTRAINT "writer_chapters_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "writer_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
