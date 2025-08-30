import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

const crearReserva = (data: Prisma.AlquilerCreatedInput) => {
    return prisma.create.alquiler({
        data,
    });
};

const obtenerReservas = () => {
    return prisma.alquiler.findMany;
}

const obtenerReservaPorId = (id: number) => {
    return prisma.alquiler.findUnique({
        where(id=prisma.alquiler.id){
            include: {
                turno: true
            }
        }
    });
}
