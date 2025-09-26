import { Domicilio, Localidad, Complejo } from '@prisma/client';

export interface crearDomicilioRequest {
    calle : string;
    altura : number;
    complejoId?: Complejo;//lo mismo de abajo
    localidadId: number; //se conecta por el id 
}

export interface UpdateDomicilioRequest {
    calle? : string;
    altura? : number;
    complejoId?: number;
    localidadId?: number; // se conecta por el id
}

export interface DomicilioResponse {
    domicilio: Domicilio;
    message: string;
}

export interface DomicilioListResponse {
    domicilios : Domicilio[];
    total : number;
}