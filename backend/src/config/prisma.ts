import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ["error", "warn", "query"], // agregamos "query" para debuggear
});

export default prisma;