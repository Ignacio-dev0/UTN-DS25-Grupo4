import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma, Usuario, Administrador } from '@prisma/client';
import { LoginUsuarioBody, RegistroUsuarioBody } from '../validations/auth.validation';

export async function login(data: LoginUsuarioBody) {
  // 1. Buscar usuario (Usuario usa 'correo', Administrador usa 'email')
  const { email, password } = data;
  const usuario = await prisma.usuario.findUnique({ where: { correo: email } })
    || await prisma.administrador.findUnique({ where: { email } });

  if (!usuario) {
    const error = new Error('correo no registrado');
    (error as any).statusCode = 401;
    throw error;
  }

  // 2. Verificar password
  const validPassword = await bcrypt.compare(password, usuario.password);
  if (!validPassword) {
    const error = new Error('contraseña incorrecta');
    (error as any).statusCode = 401;
    throw error;
  }
  
  // 3. Generar JWT (Usuario tiene 'correo', Administrador tiene 'email')
  const userEmail = 'correo' in usuario ? usuario.correo : usuario.email;
  
  const token = jwt.sign(
    {
      id: usuario.id,
      email: userEmail,
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
    
    // Separar email del resto de los datos
    const { email, ...restData } = data;
    
    const usuario = await prisma.usuario.create({
      data: {
        ...restData,
        correo: email, // Mapear email del body a correo en la DB
        password: hashedPassword
      }
    })

    // 2. Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.correo,
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