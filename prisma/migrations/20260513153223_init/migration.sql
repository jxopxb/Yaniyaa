-- CreateTable
CREATE TABLE "Novel" (
    "title" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "readers" TEXT NOT NULL,
    "badge" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FREE',
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'all',
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Novel_pkey" PRIMARY KEY ("id")
);
