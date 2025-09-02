// import { da } from "zod/v4/locales/index.cjs";
// import prisma from "../config/prisma";

// import * as complejoTypes from "../types/complejo.types"
// import { connect } from "http2";

// export const createComplejo = async (data:complejoTypes.createComplejoType) =>{
//     return prisma.$transaction(async (tx)=>{
//         const nuevoDomicilio = await tx.domicilio.create({
//             data: {
//                 calle: data.domicilio.calle,
//                 altura: data.domicilio.altura,
//                 localidad: {connect: {id: data.domicilio.localidadId}}
//             }
//         });

//         const nuevoComplejo 
//     })
// }