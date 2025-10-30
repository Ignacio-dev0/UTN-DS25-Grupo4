import { getComplejoById } from './complejo.service';
// Importamos prisma para poder mockearlo
import prisma from '../config/prisma';

// Mockeamos el módulo de prisma 
jest.mock('../config/prisma', () => ({
  complejo: {
    findUnique: jest.fn(),
  },
}));

// Agrupamos tests relacionados con 'describe' 
describe('ComplejoService: getComplejoById', () => {
  
  // Limpiamos los mocks después de cada test para que no interfieran entre sí 
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: 
  test('debe retornar un complejo cuando existe', async () => {
    // 1. ARRANGE: preparar datos de prueba
    // Creamos un complejo falso que esperamos recibir
    const mockComplejo = { 
        id:1,
        nombre: 'Megadeportivo La Plata', 
        descripcion: 'Complejo deportivo de primer nivel', 
        puntaje: 4.8, 
        precioDesde: 10037,
        cuit: '20301234567', 
        horarios: 'Lunes a Domingo: 07:00 - 23:00',
        domicilioId: 1,
        usuarioId: 1,
        estado: 'APROBADO',
        administradorId: null,
        domicilio: {
            id: 1,
            calle: "Calle 32",
            altura: 1567,
            localidadId: 8,
            localidad: {
                id: 8,
                nombre: "Berisso"
            }
        },
        cronograma: [
            {
            id: 6211,
            horaInicio: "1970-01-01T11:00:00.000Z",
            horaFin: "1970-01-01T12:00:00.000Z",
            diaSemana: "MARTES",
            canchaId: 58,
            precio: 10394
            },
            {
            id: 6196,
            horaInicio: "1970-01-01T09:00:00.000Z",
            horaFin: "1970-01-01T10:00:00.000Z",
            diaSemana: "LUNES",
            canchaId: 58,
            precio: 10680
            },
        ],
        servicios: [],
        usuario: {
            id: 1,
            nombre: "Admin Canchaya",
            apellido:"admin",
            dni:123456789,            
            email: "admin@admin.com",
            contraseña: "hashedpassword",

        }
    };

    // Configuramos el mock de Prisma:
    // Cuando se llame a 'findUnique', debe devolver nuestro 'mockComplejo'
    (prisma.complejo.findUnique as jest.Mock).mockResolvedValue(mockComplejo);

    // 2. ACT, Llamamos a la función real que estamos probando
    const result = await getComplejoById(1);

    // 3. ASSERT, Verificamos que el resultado sea el esperado 
    expect(result).toEqual(mockComplejo);
    // Verificamos que la función mock de prisma fue llamada con los argumentos correctos
    expect(prisma.complejo.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: expect.any(Object), // Verificamos que pide los 'include'
    });
  });

  // Test 2: (cuando no existe) 
  test('debe retornar null cuando el complejo no existe', async () => {
    // 1. ARRANGE 
    (prisma.complejo.findUnique as jest.Mock).mockResolvedValue(null);

    // 2. ACT 
    const result = await getComplejoById(999);

    // 3. ASSERT 
    // Verificamos que lanza error
    expect(result).toBeNull();
    // Verificamos que se llamó con el ID 999
    expect(prisma.complejo.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      include: expect.any(Object),
    });
  });
});