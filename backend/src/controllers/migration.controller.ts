import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const runMigrations = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Ejecutando migraciones de Prisma...');
    
    // Ejecutar migraciones
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('✅ Migraciones completadas');
    console.log('STDOUT:', stdout);
    
    if (stderr) {
      console.log('STDERR:', stderr);
    }
    
    // Generar cliente de Prisma
    const { stdout: generateStdout } = await execAsync('npx prisma generate');
    console.log('✅ Cliente de Prisma generado');
    console.log('GENERATE STDOUT:', generateStdout);
    
    res.json({
      success: true,
      message: 'Migraciones ejecutadas correctamente',
      details: {
        migrate: stdout,
        generate: generateStdout
      }
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando migraciones',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};