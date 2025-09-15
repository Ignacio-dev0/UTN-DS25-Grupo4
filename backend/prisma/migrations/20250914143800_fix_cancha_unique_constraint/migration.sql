-- DropIndex (conditional - ignore if doesn't exist)
DROP INDEX IF EXISTS "Cancha_nroCancha_key";

-- CreateIndex (conditional - ignore if already exists)
CREATE UNIQUE INDEX IF NOT EXISTS "Cancha_complejoId_nroCancha_key" ON "Cancha"("complejoId", "nroCancha");