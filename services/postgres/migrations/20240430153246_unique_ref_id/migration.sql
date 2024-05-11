/*
  Warnings:

  - A unique constraint covering the columns `[referenceId]` on the table `PaymentLedger` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referenceId]` on the table `RelayLedger` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentLedger_referenceId_key" ON "PaymentLedger"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "RelayLedger_referenceId_key" ON "RelayLedger"("referenceId");
