-- CreateTable
CREATE TABLE "public"."Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComplejoServicio" (
    "id" SERIAL NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "complejoId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "ComplejoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombre_key" ON "public"."Servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ComplejoServicio_complejoId_servicioId_key" ON "public"."ComplejoServicio"("complejoId", "servicioId");

-- AddForeignKey
ALTER TABLE "public"."ComplejoServicio" ADD CONSTRAINT "ComplejoServicio_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "public"."Complejo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplejoServicio" ADD CONSTRAINT "ComplejoServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
