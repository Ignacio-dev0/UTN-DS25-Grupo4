import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ["error", "warn", "query"], // agregamos "query" para debuggear
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

export default prisma;