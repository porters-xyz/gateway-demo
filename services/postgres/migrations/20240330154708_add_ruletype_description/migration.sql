/*
  Warnings:

  - Added the required column `description` to the `RuleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RuleType" ADD COLUMN     "description" TEXT NOT NULL;
