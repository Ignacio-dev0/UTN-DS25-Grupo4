import { Request, Response, NextFunction } from "express";
// TEMPORALMENTE usando mock en lugar del servicio real
import * as usuarioService from "../services/usuario.service";
import { UsuarioListResponse, UsuarioResponse } from "../types/usuario.type";
import bcrypt from 'bcrypt';

export async function crearUsuario(req: Request, res: Response<UsuarioResponse>) {
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

export async function actualizarUsuario(req: Request, res: Response<UsuarioResponse>) {
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
    console.log(`🗑️ [${new Date().toISOString()}] Attempting to delete user with ID: ${id}`);
    
    const deleted = await usuarioService.deleteUsuario(parseInt(id));
    console.log(`✅ [${new Date().toISOString()}] User deleted successfully:`, deleted);
    
    res.json({ 
      usuario: deleted, 
      message: "Usuario eliminado exitosamente" 
    });
  } catch (error: any) {
    console.error(`❌ [${new Date().toISOString()}] Error deleting user:`, {
      id: req.params.id,
      error: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas eliminar no existe'
      });
    }
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Nuevas funciones de autenticación
export async function login(req: Request, res: Response) {
  try {
    console.log('🔐 LOGIN REQUEST - Body:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ LOGIN FAILED - Missing credentials');
      return res.status(400).json({
        ok: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario con email:', email);
    const usuario = await usuarioService.getUsuarioByEmail(email);
    console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');
    
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

    // Generar token JWT
    const jwt = require('jsonwebtoken');
    console.log('🔑 Generando JWT con secret:', process.env.JWT_SECRET ? 'Configurado' : 'NO CONFIGURADO');
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    console.log('✅ Token generado exitosamente');

    // Login exitoso
    res.json({
      ok: true,
      user: {
        id: usuario.id,
        email: usuario.correo,
        correo: usuario.correo, // También incluir correo para compatibilidad frontend
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        role: usuario.rol // Usar rol del schema
      },
      token,
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('❌ ERROR EN LOGIN:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export async function register(req: Request, res: Response) {
  // Log para depuración: ver qué llega en el body
  console.log('BODY recibido en /usuarios/register:', JSON.stringify(req.body, null, 2));
  console.log('¿Tiene solicitudComplejo?', !!req.body.solicitudComplejo);
  console.log('Contenido de solicitudComplejo:', req.body.solicitudComplejo);
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
      email: email,
      password, // En producción, hashear con bcrypt
      nombre: nombre,
      apellido: apellido,
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
            correo: newUsuario.correo,
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
          correo: newUsuario.correo,
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

export async function registerWithImage(req: Request, res: Response) {
  console.log('=== DEBUG registerWithImage ===');
  console.log('BODY recibido:', req.body);
  console.log('Archivo recibido:', req.file);
  console.log('Nombre del campo esperado: imagen');
  
  try {
    const { 
      correo,     // Frontend envía 'correo'
      email,      // Mantener compatibilidad con 'email'
      password, 
      nombre, 
      apellido, 
      dni, 
      telefono, 
      direccion,
      rol: userRole = 'player',
      tipoUsuario, 
      cuit, 
      nombreComplejo, 
      calle, 
      altura, 
      localidadId 
    } = req.body;
    
    const imagePath = req.file ? `/images/solicitudes/${req.file.filename}` : null;
    
    // Usar correo o email (el que venga)
    const userEmail = correo || email;
    
    if (!userEmail || !password || !nombre || !apellido || !dni) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son requeridos (correo, password, nombre, apellido, dni)'
      });
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await usuarioService.getUsuarioByEmail(userEmail);
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
    const finalRole = tipoUsuario === 'DUENIO' ? 'DUENIO' : (userRole || 'player');

    // Crear nuevo usuario
    const newUsuario = await usuarioService.createUsuario({
      email: userEmail,
      password,
      nombre: nombre,
      apellido: apellido,
      dni: dni,
      telefono,
      rol: finalRole,
      image: imagePath || undefined
    });

    // Si es dueño, crear la solicitud automáticamente
    if (finalRole === 'DUENIO' && cuit && nombreComplejo && calle && altura && localidadId) {
      try {
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
            imagen: imagePath,
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
            correo: newUsuario.correo,
            nombre: newUsuario.nombre,
            apellido: newUsuario.apellido,
            rol: newUsuario.rol
          },
          solicitud: nuevaSolicitud,
          message: 'Usuario y solicitud registrados exitosamente'
        });
      } catch (error: any) {
        console.error('Error creando solicitud:', error);
        // Rollback usuario si falla la solicitud
        await usuarioService.deleteUsuario(newUsuario.id);
        return res.status(500).json({ 
          ok: false, 
          error: 'Error al crear la solicitud de complejo. El usuario no fue registrado.'
        });
      }
    } else {
      res.status(201).json({
        ok: true,
        user: {
          id: newUsuario.id,
          correo: newUsuario.correo,
          nombre: newUsuario.nombre,
          apellido: newUsuario.apellido,
          rol: newUsuario.rol
        },
        message: 'Usuario registrado exitosamente'
      });
    }

  } catch (error: any) {
    console.error('Error en registerWithImage:', error);
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

export async function actualizarUsuarioConImagen(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, dni, telefono, direccion, rol, password } = req.body;
    const imagePath = req.file ? `/images/usuarios/${req.file.filename}` : null;
    
    console.log('=== DEBUG: Actualizando usuario con imagen ===');
    console.log('ID:', id);
    console.log('Body completo:', req.body);
    console.log('Archivo recibido:', req.file);
    console.log('Imagen path:', imagePath);

    if (!id) {
      return res.status(400).json({
        error: 'ID de usuario requerido'
      });
    }

    // Verificar si el usuario existe
    const usuarioExistente = await usuarioService.getUsuarioById(parseInt(id));
    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (correo) updateData.correo = correo;
    if (dni && dni !== 'undefined') updateData.dni = dni;
    if (telefono) updateData.telefono = telefono;
    if (direccion) updateData.direccion = direccion;
    
    // Mapear rol del frontend al enum de Prisma
    if (rol) {
      switch (rol.toLowerCase()) {
        case 'normal':
        case 'cliente':
          updateData.rol = 'CLIENTE';
          break;
        case 'duenio':
        case 'dueño':
          updateData.rol = 'DUENIO';
          break;
        case 'administrador':
        case 'admin':
          updateData.rol = 'ADMINISTRADOR';
          break;
        default:
          updateData.rol = 'CLIENTE'; // Default fallback
      }
    }
    
    if (password) updateData.password = password;
    if (imagePath) updateData.image = imagePath;

    // Actualizar usuario
    console.log('Datos a actualizar:', updateData);
    const usuarioActualizado = await usuarioService.updateUsuario(parseInt(id), updateData);
    console.log('Usuario actualizado exitosamente:', usuarioActualizado);

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });

  } catch (error: any) {
    console.error('=== ERROR en actualizarUsuarioConImagen ===');
    console.error('Error completo:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'El DNI o email ya están en uso por otro usuario'
      });
    }
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}
