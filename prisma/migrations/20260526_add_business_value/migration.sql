-- Add businessValue column to Submission table
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "businessValue" TEXT;
