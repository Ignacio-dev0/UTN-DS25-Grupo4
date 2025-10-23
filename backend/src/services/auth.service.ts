import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma, Usuario, Administrador, Rol } from '@prisma/client';
import { LoginUsuarioBody, RegistroUsuarioBody } from '../validations/auth.validation';
import { NotFoundError, BadRequestError } from '../middlewares/handleError.middleware';

export async function login(data: LoginUsuarioBody) {
  // 1. Buscar usuario
  const { email, password } = data;
  const usuario = await prisma.usuario.findUnique({ where: { email } })
    || await prisma.administrador.findUnique({ where: { email } });

  if (!usuario) throw new NotFoundError('correo no registrado');

  // 2. Verificar password
  const validPassword = await bcrypt.compare(password, usuario.password);
  if (!validPassword) throw new BadRequestError('contraseña incorrecta')
  
  return loguear(usuario);
}

// Registro solo para clientes y dueños (no admins)
export async function register(data: RegistroUsuarioBody) {
  try {
    // 1. Comprobar que el usuario no exista
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const isAdminEmail = await prisma.administrador.findUnique({
      where: { email: data.email }
    })
    if (isAdminEmail) throw new BadRequestError('correo ya registrado');
    
    // Validaciones
    let { complejo: complejoData, ...usuarioData } = data;
    if (usuarioData.rol === 'CLIENTE') complejoData = undefined;
    if (usuarioData.rol === 'DUENIO' && !complejoData) throw new BadRequestError('Datos de solicitud requeridos');
    const usuario = await prisma.usuario.create({
      data: {
        ...usuarioData,
        password: hashedPassword,
        complejo: complejoData ? {
          create: {
            ...complejoData,
            domicilio: { create: complejoData.domicilio }
          }
        } : { }
      },
      include: complejoData ? { complejo: true } : { }
    });

    return loguear(usuario);

  } catch (error) {
    throw (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      ? new BadRequestError(`${error.meta.target} ya registrado`)
      : error;
  }
}

function loguear(usuario: Usuario | Administrador) {
  // Generar JWT
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.JWT_EXPIRES_IN) }
  )
  // Retornar sin password
  const { password : _, ...userWithoutPassword } = usuario
  return {
    usuario: userWithoutPassword,
    token
  }
}