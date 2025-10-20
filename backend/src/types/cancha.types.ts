import { Cancha, Complejo, HorarioCronograma } from '@prisma/client';

export interface CanchaFull extends Cancha {
  cronograma?: HorarioCronograma[]; // Ajusta el tipo según la estructura real del cronograma
  complejo?: Complejo;
}

export interface CanchaResponse {
	cancha: Cancha,
	message: string,
}

export interface CanchaListResponse {
	canchas: CanchaFull[],
	total: number,
	message?: string,
}

