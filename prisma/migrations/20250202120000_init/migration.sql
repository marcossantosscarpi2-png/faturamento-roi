-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daily_budget" DOUBLE PRECISION NOT NULL,
    "pix_account" TEXT NOT NULL,
    "expense_categories" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_entries" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "operation_id" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "daily_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "daily_entry_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "is_monthly" BOOLEAN NOT NULL DEFAULT false,
    "manual_adjust" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenues" (
    "id" TEXT NOT NULL,
    "daily_entry_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "time" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_entries_operation_id_date_key" ON "daily_entries"("operation_id", "date");

-- CreateIndex
CREATE INDEX "daily_entries_operation_id_idx" ON "daily_entries"("operation_id");

-- CreateIndex
CREATE INDEX "daily_entries_date_idx" ON "daily_entries"("date");

-- CreateIndex
CREATE INDEX "expenses_daily_entry_id_idx" ON "expenses"("daily_entry_id");

-- CreateIndex
CREATE INDEX "revenues_daily_entry_id_idx" ON "revenues"("daily_entry_id");

-- AddForeignKey
ALTER TABLE "daily_entries" ADD CONSTRAINT "daily_entries_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_daily_entry_id_fkey" FOREIGN KEY ("daily_entry_id") REFERENCES "daily_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_daily_entry_id_fkey" FOREIGN KEY ("daily_entry_id") REFERENCES "daily_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
