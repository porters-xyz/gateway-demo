/*
  Warnings:

  - You are about to drop the column `deleted` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `AppRule` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Org` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `RuleType` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `TenantAuthKey` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "AppRule" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Org" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PaymentLedger" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RelayLedger" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RuleType" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TenantAuthKey" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
