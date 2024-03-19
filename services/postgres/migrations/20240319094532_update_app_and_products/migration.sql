/*
  Warnings:

  - You are about to drop the column `enabled` on the `Enterprise` table. All the data in the column will be lost.
  - You are about to drop the column `chainId` on the `RelayLedger` table. All the data in the column will be lost.
  - You are about to drop the column `appRuleId` on the `RuleType` table. All the data in the column will be lost.
  - Added the required column `name` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ruleId` to the `AppRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `RelayLedger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RuleType" DROP CONSTRAINT "RuleType_appRuleId_fkey";

-- DropIndex
DROP INDEX "RuleType_appRuleId_key";

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AppRule" ADD COLUMN     "ruleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Enterprise" DROP COLUMN "enabled",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RelayLedger" DROP COLUMN "chainId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RuleType" DROP COLUMN "appRuleId";

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "params" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_id_key" ON "Products"("id");

-- AddForeignKey
ALTER TABLE "AppRule" ADD CONSTRAINT "AppRule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RuleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelayLedger" ADD CONSTRAINT "RelayLedger_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
