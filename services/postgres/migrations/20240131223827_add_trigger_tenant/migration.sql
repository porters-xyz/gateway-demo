-- This is an empty migration

-- Tenant changes
-- returns (tenantId,enabled)
CREATE OR REPLACE FUNCTION notify_tenant_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('tenant_change',
       	NEW."id" || ',' ||
        CAST(NEW."active" AS text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_change ON "Tenant";
CREATE TRIGGER tenant_change
    AFTER INSERT OR UPDATE ON "Tenant"
    FOR EACH ROW
        EXECUTE PROCEDURE notify_tenant_change();


-- API key changes
-- returns (apikey,tenant,app,active)
CREATE OR REPLACE FUNCTION notify_apikey_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('apikey_change',
        NEW."keyValue" || ',' ||
        NEW."tenantId" || ',' ||
        NEW."appId" || ',' ||
        CAST(NEW."active" AS text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS apikey_change ON "TenantAuthKey";
CREATE TRIGGER apikey_change
    AFTER INSERT OR UPDATE ON "TenantAuthKey"
    FOR EACH ROW
        EXECUTE PROCEDURE notify_apikey_change();

-- payment ledger changes
-- returns (tenant,amount,txtype)
CREATE OR REPLACE FUNCTION notify_payment_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('payment_tx',
        NEW."tenantId" || ',' ||
        CAST(NEW."amount" AS text) || ',' ||
        CAST(NEW."transactionType" AS text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert only, updates shouldn't exist
DROP TRIGGER IF EXISTS payment_change ON "PaymentLedger";
CREATE TRIGGER payment_change
    AFTER INSERT ON "PaymentLedger"
    FOR EACH ROW
        EXECUTE PROCEDURE notify_payment_change();

