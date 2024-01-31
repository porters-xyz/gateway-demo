/*
  Warnings:

  - A unique constraint covering the columns `[secretKey]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `secretKey` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "secretKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_secretKey_key" ON "Tenant"("secretKey");
