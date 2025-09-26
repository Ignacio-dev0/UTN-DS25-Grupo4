import { Pago, Alquiler, MetodoPago} from "@prisma/client";

export interface CrearPagoRequest{
    codigotransaccion?: string;
    metodoPago: MetodoPago;
    monto: number;
    alquilerId: number;
};

export interface actualizarPagoRequest {
    codigoTransaccion?: string;
    metodoPago?: MetodoPago;
    monto?: number;
    alquilerId?: number;
};

export interface PagoResponse {
    pago: Pago;
    message: string;
};

export interface PagoListResponse {
    pagos: Pago[];
    total: number;
};
