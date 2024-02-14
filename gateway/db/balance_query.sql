SELECT SUM(case when "transactionType"='CREDIT' then amount else 0 end) - SUM(case when "transactionType"='DEBIT' then amount else 0 end) AS balance FROM "PaymentLedger" WHERE "tenantId" = ?

