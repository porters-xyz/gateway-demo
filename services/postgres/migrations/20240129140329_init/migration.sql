-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppRule" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEditable" BOOLEAN NOT NULL,
    "isMultiple" BOOLEAN NOT NULL,
    "validationType" TEXT NOT NULL,
    "validationValue" TEXT NOT NULL,
    "appRuleId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "keyValue" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelayLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "chainId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelayLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_id_key" ON "Org"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_id_key" ON "Tenant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "App_id_key" ON "App"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AppRule_id_key" ON "AppRule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleType_id_key" ON "RuleType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleType_appRuleId_key" ON "RuleType"("appRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Key_id_key" ON "Key"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Key_tenantId_key" ON "Key"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLedger_id_key" ON "PaymentLedger"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLedger_tenantId_key" ON "PaymentLedger"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RelayLedger_id_key" ON "RelayLedger"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RelayLedger_tenantId_key" ON "RelayLedger"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppRule" ADD CONSTRAINT "AppRule_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleType" ADD CONSTRAINT "RuleType_appRuleId_fkey" FOREIGN KEY ("appRuleId") REFERENCES "AppRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Key" ADD CONSTRAINT "Key_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLedger" ADD CONSTRAINT "PaymentLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelayLedger" ADD CONSTRAINT "RelayLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
