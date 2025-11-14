import { Request, Response, NextFunction } from 'express';
import { solicitarCodigoRecuperacion, resetearPassword } from '../services/passwordReset.service';

export async function solicitarCodigo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    const resultado = await solicitarCodigoRecuperacion(email);

    return res.status(200).json({
      success: true,
      message: 'Si el correo está registrado, te enviaremos un código para restablecer la contraseña.',
      resetToken: resultado.resetToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetear(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, codigo, nuevaPassword, resetToken } = req.body as {
      email: string;
      codigo: string;
      nuevaPassword: string;
      resetToken: string;
    };

    await resetearPassword({ email, codigo, nuevaPassword, resetToken });

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente. Ya podés iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    next(error);
  }
}
