import { Pago, Alquiler, MetodoPago} from "../generated/prisma";

export interface CrearPagoRequest{
    codigotransaccion?: string;
    metodoPago: MetodoPago;
    monto: number;
    alquiler: Alquiler;
};

export interface actualizarPagoRequest {
    codigotransaccion?: string;
    metodoPago?: MetodoPago;
    monto?: number;
    alquiler?: Alquiler;
};

export interface PagoResponse {
    pago: Pago;
    message: string;
};

export interface PagoListResponse {
    pago: Pago[];
    total: number;
};
