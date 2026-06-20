ALTER TABLE "transactions"
ADD COLUMN "bank_name" VARCHAR(150),
ADD COLUMN "card_last4" VARCHAR(4);

CREATE UNIQUE INDEX "transactions_raw_message_id_key" ON "transactions"("raw_message_id");
