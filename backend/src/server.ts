import app from './app'; // Importa la app definida
import { resetearTurnosDiarios } from './controllers/turnoAutomatico.controller';
import { iniciarScheduler } from './services/scheduler.service';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // 🎯 Iniciar sistema de generación automática de turnos
    iniciarScheduler();
    
    // Job automático cada 24 horas para resetear turnos
    setInterval(async () => {
        try {
            console.log('🔄 Ejecutando job de reseteo automático de turnos...');
            const turnosReseteados = await resetearTurnosDiarios();
            console.log(`✅ Job completado: ${turnosReseteados} turnos reseteados`);
        } catch (error) {
            console.error('❌ Error en job de reseteo de turnos:', error);
        }
    }, 24 * 60 * 60 * 1000);
});
