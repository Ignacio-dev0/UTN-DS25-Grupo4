import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma, Usuario, Administrador } from '@prisma/client';
import { LoginUsuarioBody, RegistroUsuarioBody } from '../validations/auth.validation';

export async function login(data: LoginUsuarioBody) {
  // 1. Buscar usuario
  const { email, password } = data;
  const usuario = await prisma.usuario.findUnique({ where: { email } })
    || await prisma.administrador.findUnique({ where: { email } });

  if (!usuario) throw new Error('correo no registrado');

  // 2. Verificar password
  const validPassword = await bcrypt.compare(password, usuario.password);
  if (!validPassword) throw new Error('contraseña incorrecta')
  
  // 3. Generar JWT
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.JWT_EXPIRES_IN) }
  )
  // 4. Retornar sin password
  const { password : _, ...userWithoutPassword } = usuario
  return {
    usuario: userWithoutPassword,
    token
  }
}

// Registro solo para clientes y dueños (no admins)
export async function register(data: RegistroUsuarioBody) {
  try {
    // 1. Crear usuario
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const isAdminEmail = await prisma.administrador.findUnique({
      where: { email: data.email }
    })
    if(isAdminEmail) throw new Error('correo ya registrado');
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })

    // 2. Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET!,
      { expiresIn: Number(process.env.JWT_EXPIRES_IN) }
    )

    // 3. Retornar sin password
    const { password : _, ...userWithoutPassword } = usuario
    return {
      usuario: userWithoutPassword,
      token
    }
  } catch (error) {
    throw (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      ? new Error('Correo ya registrado')
      : error
  }
}