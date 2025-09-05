import { Domicilio, Localidad, Complejo } from '../generated/prisma';

export interface crearDomicilioRequest {
    calle : string;
    altura : number;
    complejo?: Complejo;
    localidad: Localidad;
}

export interface UpdateDomicilioRequest {
    calle? : string;
    altura? : number;
    complejo?: Complejo;
    localidad?: Localidad;
}

export interface DomicilioResponse {
    domicilio: Domicilio;
    message: string;
}

export interface DomicilioListResponse {
    domicilios : Domicilio[];
    total : number;
}