-- Add userId to operations so each user only sees their own data
ALTER TABLE "operations" ADD COLUMN "user_id" TEXT;

CREATE INDEX "operations_user_id_idx" ON "operations"("user_id");

ALTER TABLE "operations" ADD CONSTRAINT "operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
