import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient({
    log: ["error", "warn", "query"], // agregamos "query" para debuggear
});

export default prisma;