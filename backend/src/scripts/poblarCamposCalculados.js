/**
 * Script para calcular y poblar los valores iniciales de los campos calculados
 * Este script debe ejecutarse después de aplicar la migración add_precio_calculado_fields
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { 
    actualizarCamposCalculadosCancha,
    actualizarCamposCalculadosComplejo 
} = require('../services/camposCalculados.service.js');

async function poblarCamposCalculados() {
    console.log('🚀 Iniciando poblado de campos calculados...');
    
    try {
        // Obtener todos los complejos
        const complejos = await prisma.complejo.findMany({
            select: { id: true, nombre: true }
        });

        console.log(`📊 Encontrados ${complejos.length} complejos para procesar`);

        let totalCanchasProcesadas = 0;
        let errorCount = 0;

        // Procesar cada complejo
        for (const complejo of complejos) {
            console.log(`\n🏢 Procesando complejo: ${complejo.nombre} (ID: ${complejo.id})`);
            
            try {
                // Obtener todas las canchas del complejo
                const canchas = await prisma.cancha.findMany({
                    where: { complejoId: complejo.id },
                    select: { id: true, nombre: true }
                });

                console.log(`   📍 Encontradas ${canchas.length} canchas`);

                // Procesar cada cancha individualmente
                for (const cancha of canchas) {
                    try {
                        console.log(`   🎾 Procesando cancha: ${cancha.nombre || 'Sin nombre'} (ID: ${cancha.id})`);
                        await actualizarCamposCalculadosCancha(cancha.id);
                        totalCanchasProcesadas++;
                        console.log(`   ✅ Cancha ${cancha.id} procesada exitosamente`);
                    } catch (error) {
                        errorCount++;
                        console.error(`   ❌ Error procesando cancha ${cancha.id}:`, error.message);
                    }
                }

                // Actualizar campos del complejo después de procesar todas sus canchas
                console.log(`   🔄 Actualizando campos del complejo...`);
                await actualizarCamposCalculadosComplejo(complejo.id);
                console.log(`   ✅ Complejo ${complejo.id} procesado exitosamente`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error procesando complejo ${complejo.id}:`, error.message);
            }
        }

        console.log('\n📈 RESUMEN FINAL:');
        console.log(`   ✅ Complejos procesados: ${complejos.length}`);
        console.log(`   ✅ Canchas procesadas: ${totalCanchasProcesadas}`);
        console.log(`   ❌ Errores encontrados: ${errorCount}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 ¡Poblado de campos calculados completado exitosamente!');
        } else {
            console.log('\n⚠️  Poblado completado con algunos errores. Revisar logs arriba.');
        }

    } catch (error) {
        console.error('💥 Error fatal durante el poblado:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

async function verificarCamposCalculados() {
    console.log('\n🔍 Verificando algunos campos calculados...');
    
    try {
        // Verificar algunas canchas aleatoriamente
        const canchasMuestra = await prisma.cancha.findMany({
            take: 5,
            select: {
                id: true,
                nombre: true,
                puntaje: true,
                precioDesde: true,
                complejo: {
                    select: {
                        nombre: true,
                        puntaje: true,
                        precioDesde: true
                    }
                }
            }
        });

        console.log('\n📊 MUESTRA DE CAMPOS CALCULADOS:');
        canchasMuestra.forEach(cancha => {
            console.log(`\n🎾 Cancha: ${cancha.nombre || 'Sin nombre'} (ID: ${cancha.id})`);
            console.log(`   - Puntaje: ${cancha.puntaje}`);
            console.log(`   - Precio desde: $${cancha.precioDesde}`);
            console.log(`   🏢 Complejo: ${cancha.complejo.nombre}`);
            console.log(`   - Puntaje: ${cancha.complejo.puntaje}`);
            console.log(`   - Precio desde: $${cancha.complejo.precioDesde}`);
        });

    } catch (error) {
        console.error('❌ Error verificando campos:', error);
    }
}

// Función principal
async function main() {
    try {
        await poblarCamposCalculados();
        await verificarCamposCalculados();
    } catch (error) {
        console.error('💥 Error en el script principal:', error);
        process.exit(1);
    }
}

// Ejecutar solo si el script se llama directamente
if (require.main === module) {
    main();
}

module.exports = { poblarCamposCalculados, verificarCamposCalculados };