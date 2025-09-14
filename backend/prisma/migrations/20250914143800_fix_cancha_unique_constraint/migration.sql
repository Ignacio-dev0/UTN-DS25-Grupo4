-- DropIndex
DROP INDEX "Cancha_nroCancha_key";

-- CreateIndex
CREATE UNIQUE INDEX "Cancha_complejoId_nroCancha_key" ON "Cancha"("complejoId", "nroCancha");