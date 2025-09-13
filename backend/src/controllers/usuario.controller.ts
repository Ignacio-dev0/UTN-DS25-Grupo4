import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service";
import { CreateUsuarioRequest, UsuarioListResponse, UpdateUsuarioRequest, UsuarioResponse } from "../types/usuario.type";
import bcrypt from 'bcrypt';

export async function crearUsuario(req: Request<{}, UsuarioResponse, CreateUsuarioRequest>, res: Response<UsuarioResponse>) {
  try {
    const newUsuario = await usuarioService.createUsuario(req.body);
    res.status(201).json({
      usuario: newUsuario,
      message: 'Usuario creado exitosamente'
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'El DNI o correo ya están registrados.',
        usuario: null,
        message: 'Error de validación'
      } as any);
    }
    return res.status(500).json({ 
      error: 'Error interno del servidor.',
      usuario: null,
      message: 'Error interno'
    } as any);
  }
}

export async function obtenerUsuarios(req: Request, res: Response<UsuarioListResponse>, next: NextFunction) {
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.json({
      usuarios,
      total: usuarios.length
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerUsuarioPorId(req: Request<{id: string}>, res: Response<UsuarioResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.getUsuarioById(parseInt(id));
    
    if (!usuario) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    
    res.json({
      usuario,
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerUsuarioPorEmail(req: Request<{email: string}>, res: Response<UsuarioResponse>, next: NextFunction) {
  try {
    const { email } = req.params;
    const usuario = await usuarioService.getUsuarioByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    
    res.json({
      usuario,
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function actualizarUsuario(req: Request<{id: string}, UsuarioResponse, UpdateUsuarioRequest>, res: Response<UsuarioResponse>) {
  try {
    const { id } = req.params;
    const updateUsuario = await usuarioService.updateUsuario(parseInt(id), req.body);
    res.json({
      usuario: updateUsuario,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    return res.status(500).json({
      usuario: null,
      message: 'Error interno del servidor'
    } as any);
  }
}

export async function eliminarUsuario(req: Request<{id: string}>, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await usuarioService.deleteUsuario(parseInt(id));
    res.json({ 
      usuario: deleted, 
      message: "Usuario eliminado exitosamente" 
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas eliminar no existe'
      });
    }
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el usuario'
    });
  }
}

// Nuevas funciones de autenticación
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    const usuario = await usuarioService.getUsuarioByEmail(email);
    
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas'
      });
    }

    // Login exitoso
    res.json({
      ok: true,
      user: {
        id: usuario.id,
        email: usuario.correo, // Usar correo del schema
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        role: usuario.rol // Usar rol del schema
      },
      message: 'Login exitoso'
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor'
    });
  }
}

export async function register(req: Request, res: Response) {
  // Log para depuración: ver qué llega en el body
  console.log('BODY recibido en /usuarios/register:', JSON.stringify(req.body, null, 2));
  try {
    const { email, password, nombre, apellido, dni, telefono, tipoUsuario } = req.body;
    
    if (!email || !password || !nombre || !apellido || !dni) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await usuarioService.getUsuarioByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        ok: false,
        error: 'El email ya está registrado'
      });
    }

    // Verificar si el DNI ya existe
    const existingUserByDni = await usuarioService.getUsuarioByDni(dni);
    if (existingUserByDni) {
      return res.status(409).json({
        ok: false,
        error: 'El DNI ya está registrado'
      });
    }

    // Determinar el rol según el tipo de usuario
    const rol = tipoUsuario === 'DUENIO' ? 'DUENIO' : 'CLIENTE';

    // Crear nuevo usuario
    const newUsuario = await usuarioService.createUsuario({
      correo: email,
      password, // En producción, hashear con bcrypt
      name: nombre,
      lastname: apellido,
      dni: dni, // Mantener como string según el tipo
      telefono,
      rol: rol
    });

    // Si es dueño, intentar crear la solicitud automáticamente
    if (rol === 'DUENIO' && req.body.solicitudComplejo) {
      try {
        // solicitudComplejo debe tener: cuit, nombreComplejo, calle, altura, localidadId, imagen (opcional)
        const { cuit, nombreComplejo, calle, altura, localidadId, imagen } = req.body.solicitudComplejo;
        if (!cuit || !nombreComplejo || !calle || !altura || !localidadId) {
          // Rollback usuario
          await usuarioService.deleteUsuario(newUsuario.id);
          return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios para la solicitud de complejo' });
        }
        // Validar CUIT formato XX-XXXXXXXX-X
        if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
          await usuarioService.deleteUsuario(newUsuario.id);
          return res.status(400).json({ ok: false, error: 'CUIT inválido. Formato esperado: XX-XXXXXXXX-X' });
        }
        // Crear solicitud
        const solicitudData = {
          usuarioId: newUsuario.id,
          cuit,
          complejo: {
            nombre: nombreComplejo,
            imagen: imagen || null,
            domicilio: {
              calle,
              altura,
              localidad: localidadId
            }
          }
        };
        const nuevaSolicitud = await require('../services/solicitud.service').createSolicitudWithComplejo(solicitudData);
        return res.status(201).json({
          ok: true,
          user: {
            id: newUsuario.id,
            email: newUsuario.correo,
            nombre: newUsuario.nombre,
            apellido: newUsuario.apellido,
            rol: newUsuario.rol
          },
          solicitud: nuevaSolicitud,
          message: 'Usuario y solicitud registrados exitosamente'
        });
      } catch (error) {
        // Rollback usuario si falla la solicitud
        await usuarioService.deleteUsuario(newUsuario.id);
        return res.status(500).json({ ok: false, error: 'Error al crear la solicitud de complejo. El usuario no fue registrado.' });
      }
    } else {
      res.status(201).json({
        ok: true,
        user: {
          id: newUsuario.id,
          email: newUsuario.correo,
          nombre: newUsuario.nombre,
          apellido: newUsuario.apellido,
          rol: newUsuario.rol
        },
        message: 'Usuario registrado exitosamente'
      });
    }

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        ok: false,
        error: 'El DNI o email ya están registrados'
      });
    }
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor'
    });
  }
}
