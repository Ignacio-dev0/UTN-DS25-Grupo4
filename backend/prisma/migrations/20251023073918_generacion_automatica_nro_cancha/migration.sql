-- AlterTable
CREATE SEQUENCE "public".cancha_nrocancha_seq;
ALTER TABLE "public"."Cancha" ALTER COLUMN "nroCancha" SET DEFAULT nextval('"public".cancha_nrocancha_seq');
ALTER SEQUENCE "public".cancha_nrocancha_seq OWNED BY "public"."Cancha"."nroCancha";

-- AlterTable
ALTER TABLE "public"."Complejo" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
