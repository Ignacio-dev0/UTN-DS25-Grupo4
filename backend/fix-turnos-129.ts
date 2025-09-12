// Script temporal para limpiar turnos corruptos de cancha 129
import prisma from './src/config/prisma';

async function limpiarTurnosCancha129() {
    try {
        console.log('🧹 Limpiando turnos corruptos de cancha 129...');
        
        // Eliminar todos los turnos de la cancha 129
        const deleted = await prisma.turno.deleteMany({
            where: { canchaId: 129 }
        });
        
        console.log(`✅ Eliminados ${deleted.count} turnos corruptos`);
        
        // Crear turnos limpios para los próximos 7 días
        const hoy = new Date();
        const turnosLimpios: any[] = [];
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + i);
            
            turnosLimpios.push({
                fecha: fecha,
                horaInicio: new Date('1970-01-01T10:00:00.000Z'),
                precio: 5000,
                reservado: false,
                canchaId: 129
            });
        }
        
        const created = await prisma.turno.createMany({
            data: turnosLimpios
        });
        
        console.log(`✅ Creados ${created.count} turnos limpios`);
        
    } catch (error) {
        console.error('❌ Error limpiando turnos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

limpiarTurnosCancha129();
