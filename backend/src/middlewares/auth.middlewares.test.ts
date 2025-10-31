import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, UsuarioPayload } from './auth.middleware';


// MOCK DEL MÓDULO 'jsonwebtoken'
jest.mock('jsonwebtoken');

// VARIABLES GLOBALES PARA LOS MOCKS
let mockReq: Partial<Request>; // Usamos Partial<> para no tener que definir el objeto entero
let mockRes: Partial<Response>;
let mockNext: NextFunction; // mockNext será una función espía de Jest

// CONFIGURAMOS LOS MOCKS ANTES DE CADA TEST
beforeEach(() => {
  // Reseteamos los mocks para que cada test sea independiente
  mockReq = {
    headers: {}, // Por defecto, no hay headers
  };
  mockRes = {}; // No lo usamos, pero lo pasamos
  mockNext = jest.fn(); // Esta es la función espía
  
  // Limpiamos cualquier mock residual de 'jsonwebtoken'
  (jwt.verify as jest.Mock).mockClear();

  // Definimos un valor para la variable de entorno
  process.env.JWT_SECRET = 'test-secret';
});


// TESTS PARA 'authenticate'
describe('authenticate middleware', () => {

  test('debe agregar req.usuario y llamar a next() con un token válido', () => {
    // 1. Arrange
    const mockPayload: UsuarioPayload = { id: 1, email: 'test@test.com', rol: 'USUARIO' };
    const token = 'valid-token';
    mockReq.headers = { authorization: `Bearer ${token}` };

    // Cambiamos jwt.verify para que devuelva nuestro payload
    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    // 2. Act 
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    // 3. Assert
    // Verificamos que jwt.verify fue llamado con el token y el secreto correctos
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    // Verificamos que el payload se agregó al request
    expect(mockReq.usuario).toEqual(mockPayload);
    // Verificamos que se llamó a next() SIN argumentos (sin error)
    expect(mockNext).toHaveBeenCalledWith();
  });

  test('debe llamar a next(error) si no hay header de autorización', () => {
    
    // 2. Act
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    // 3. Assert
    // Verificamos que se llamó a next() CON un error
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    // Verificamos el mensaje de error
    expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Se requiere autenticación');
  });

  test('debe llamar a next(error) si el formato del token es incorrecto (sin Bearer)', () => {
    // 1. Arrange
    mockReq.headers = { authorization: 'token-invalido' };

    // 2. Act
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    // 3. Assert
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Se requiere autenticación');
  });

  test('debe llamar a next(error) con "Sesión expirada" si el token ha expirado', () => {
    // 1. Arrange
    mockReq.headers = { authorization: 'Bearer expired-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError'; // Esto es lo único que le importa al middleware
      throw error;
    });

    // 2. Act
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    // 3. Assert
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Sesión expirada');
  });

  test('debe llamar a next(error) si jwt.verify lanza un error genérico', () => {
    // 1. Arrange
    mockReq.headers = { authorization: 'Bearer bad-token' };
    const genericError = new Error('Token inválido');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw genericError;
    });

    // 2. Act
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    // 3. Assert
    // Verificamos que el error original es el que se pasa a next()
    expect(mockNext).toHaveBeenCalledWith(genericError);
  });

});

// TESTS PARA 'authorize'
describe('authorize middleware', () => {

    test('debe llamar a next() si el usuario tiene el rol permitido', () => {
        // 1. Arrange
        // 'authorize' devuelve una función, así que primero la llamamos
        const middleware = authorize('ADMINISTRADOR'); 
        mockReq.usuario = { id: 1, email: 'admin@test.com', rol: 'ADMINISTRADOR' };

        // 2. Act
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // 3. Assert
        expect(mockNext).toHaveBeenCalledWith();
    });

    test('debe llamar a next() si el usuario tiene uno de los roles permitidos (lista múltiple)', () => {
        // 1. Arrange
        const middleware = authorize('ADMINISTRADOR', 'DUENIO');
        mockReq.usuario = { id: 2, email: 'duenio@test.com', rol: 'DUENIO' };

        // 2. Act
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // 3. Assert
        expect(mockNext).toHaveBeenCalledWith();
    });

    test('debe llamar a next(error) si el usuario no tiene el rol permitido', () => {
        // 1. Arrange
        const middleware = authorize('ADMINISTRADOR');
        mockReq.usuario = { id: 3, email: 'user@test.com', rol: 'USUARIO' };

        // 2. Act
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // 3. Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('No tiene permiso para esta acción');
    });

    test('debe llamar a next(error) si req.usuario no está definido', () => {
        // 1. Arrange
        const middleware = authorize('ADMINISTRADOR');
        // mockReq.usuario no está definido (por el beforeEach)

        // 2. Act
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // 3. Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Se requiere autenticación');
    });

});