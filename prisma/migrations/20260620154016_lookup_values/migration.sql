-- CreateTable
CREATE TABLE "LookupValue" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookupValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LookupValue_category_idx" ON "LookupValue"("category");

-- CreateIndex
CREATE UNIQUE INDEX "LookupValue_category_value_key" ON "LookupValue"("category", "value");
