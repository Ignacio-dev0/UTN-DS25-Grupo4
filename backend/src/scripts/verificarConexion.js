/**
 * Script para probar conectividad y preparar la migración de campos calculados
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarConexion() {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos exitosa');
        return true;
    } catch (error) {
        console.log('❌ No se puede conectar a la base de datos:', error.message);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function verificarCamposCalculados() {
    console.log('🔍 Verificando si los campos calculados existen...');
    
    try {
        // Intentar obtener una cancha con los nuevos campos
        const cancha = await prisma.cancha.findFirst({
            select: {
                id: true,
                puntaje: true,
                precioDesde: true,
                complejo: {
                    select: {
                        id: true,
                        puntaje: true,
                        precioDesde: true
                    }
                }
            }
        });
        
        if (cancha) {
            console.log('✅ Los campos calculados están disponibles en el esquema');
            console.log('📊 Ejemplo de datos:');
            console.log(`   Cancha ${cancha.id}: puntaje=${cancha.puntaje}, precioDesde=${cancha.precioDesde}`);
            console.log(`   Complejo ${cancha.complejo.id}: puntaje=${cancha.complejo.puntaje}, precioDesde=${cancha.complejo.precioDesde}`);
            return true;
        } else {
            console.log('⚠️  No se encontraron canchas en la base de datos');
            return false;
        }
    } catch (error) {
        if (error.message.includes('precioDesde')) {
            console.log('❌ Los campos calculados no existen aún en la base de datos');
            console.log('💡 Necesitas aplicar la migración primero:');
            console.log('   npx prisma migrate deploy');
            return false;
        } else {
            console.log('❌ Error verificando campos:', error.message);
            return false;
        }
    }
}

async function mostrarInstrucciones() {
    console.log('\n📋 INSTRUCCIONES PARA APLICAR LA OPTIMIZACIÓN:');
    console.log('');
    console.log('1️⃣  Cuando se restablezca la conexión a Supabase, ejecuta:');
    console.log('   npx prisma migrate deploy');
    console.log('');
    console.log('2️⃣  Luego ejecuta el script de poblado:');
    console.log('   node src/scripts/poblarCamposCalculados.js');
    console.log('');
    console.log('3️⃣  Verifica que todo esté funcionando:');
    console.log('   node src/scripts/verificarConexion.js');
    console.log('');
    console.log('🎯 BENEFICIOS ESPERADOS:');
    console.log('   ✅ Carga más rápida de canchas y complejos');
    console.log('   ✅ Menos cálculos en tiempo real');
    console.log('   ✅ Datos de puntajes y precios siempre actualizados');
    console.log('   ✅ Mejor rendimiento general del sistema');
}

async function main() {
    console.log('🚀 VERIFICADOR DE OPTIMIZACIÓN - CAMPOS CALCULADOS');
    console.log('=' .repeat(60));
    
    const conectado = await verificarConexion();
    
    if (conectado) {
        console.log('\n📡 Base de datos accesible, verificando campos...');
        const camposDisponibles = await verificarCamposCalculados();
        
        if (camposDisponibles) {
            console.log('\n🎉 ¡Los campos calculados están listos!');
            console.log('💡 Puedes ejecutar el script de poblado si es necesario:');
            console.log('   node src/scripts/poblarCamposCalculados.js');
        } else {
            console.log('\n⚠️  Los campos calculados no están disponibles todavía');
            console.log('💡 Ejecuta la migración primero:');
            console.log('   npx prisma migrate deploy');
        }
    } else {
        console.log('\n💤 Base de datos no accesible (problema temporal de conectividad)');
        await mostrarInstrucciones();
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✨ Verificación completada');
}

// Ejecutar solo si el script se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { verificarConexion, verificarCamposCalculados };