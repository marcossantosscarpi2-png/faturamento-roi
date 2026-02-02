-- Alter users to use username instead of email
ALTER TABLE "users" RENAME COLUMN "email" TO "username";

-- Optional: rename the unique index for clarity (it will keep working even without this)
ALTER INDEX "users_email_key" RENAME TO "users_username_key";

