import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enviarCodigoRecuperacionPassword } from './email.service';

type ResetTokenPayload = {
  userId: number;
  email: string;
  codeHash: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
};

type PasswordResetTarget = {
  id: number;
  email: string;
  nombre: string | null;
  passwordHash: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
};

const PASSWORD_RESET_PURPOSE = 'password-reset';
const TOKEN_EXPIRATION = '15m';

function ensureJwtSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }
  return process.env.JWT_SECRET;
}

function buildSecret(passwordHash: string): string {
  return `${ensureJwtSecret()}-${PASSWORD_RESET_PURPOSE}-${passwordHash}`;
}

function generarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function buscarUsuarioPorEmail(email: string): Promise<PasswordResetTarget | null> {
  const emailNormalizado = email.trim().toLowerCase();

  const usuario = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (usuario) {
    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim();
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: nombre || usuario.email,
      passwordHash: usuario.password,
      tipo: 'USUARIO',
    };
  }

  const administrador = await prisma.administrador.findUnique({ where: { email: emailNormalizado } });
  if (administrador) {
    return {
      id: administrador.id,
      email: administrador.email,
      nombre: administrador.email,
      passwordHash: administrador.password,
      tipo: 'ADMINISTRADOR',
    };
  }

  return null;
}

export async function solicitarCodigoRecuperacion(email: string) {
  const objetivo = await buscarUsuarioPorEmail(email);

  if (!objetivo) {
    return { resetToken: null };
  }

  const codigo = generarCodigo();
  const codigoHash = await bcrypt.hash(codigo, 10);
  const secret = buildSecret(objetivo.passwordHash);

  const resetToken = jwt.sign(
    {
      userId: objetivo.id,
      email: objetivo.email,
      codeHash: codigoHash,
      tipo: objetivo.tipo,
    } satisfies ResetTokenPayload,
    secret,
    { expiresIn: TOKEN_EXPIRATION }
  );

  await enviarCodigoRecuperacionPassword(objetivo.email, objetivo.nombre, codigo);

  return { resetToken };
}

type ResetPasswordInput = {
  email: string;
  codigo: string;
  nuevaPassword: string;
  resetToken: string;
};

function buildError(message: string, statusCode = 400) {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}

export async function resetearPassword({ email, codigo, nuevaPassword, resetToken }: ResetPasswordInput) {
  const objetivo = await buscarUsuarioPorEmail(email);
  if (!objetivo || !resetToken) {
    throw buildError('Código inválido o expirado');
  }

  let payload: ResetTokenPayload;
  try {
    payload = jwt.verify(resetToken, buildSecret(objetivo.passwordHash)) as ResetTokenPayload;
  } catch (error) {
    throw buildError('Código inválido o expirado');
  }

  if (payload.email !== objetivo.email || payload.userId !== objetivo.id) {
    throw buildError('Código inválido');
  }

  const codigoValido = await bcrypt.compare(codigo, payload.codeHash);
  if (!codigoValido) {
    throw buildError('Código incorrecto');
  }

  const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

  if (objetivo.tipo === 'USUARIO') {
    await prisma.usuario.update({
      where: { id: objetivo.id },
      data: { password: hashedPassword },
    });
  } else {
    await prisma.administrador.update({
      where: { id: objetivo.id },
      data: { password: hashedPassword },
    });
  }

  return { success: true };
}
