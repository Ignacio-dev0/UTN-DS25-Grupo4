Tutorial de Instalación y Ejecución
Sigue estos pasos en orden para configurar y levantar el proyecto completo en tu computadora.

1. Configuración del Backend (API REST)

Primero, levantaremos el servidor que maneja toda la lógica y los datos.

Paso 1: Navegar a la carpeta y instalar dependencias

# Abre tu terminal, clona el repositorio si no lo has hecho y entra a la carpeta del backend.
# git clone [https://github.com/ignacio-dev0/utn-ds25-grupo4.git](https://github.com/ignacio-dev0/utn-ds25-grupo4.git)
cd utn-ds25-grupo4/backend

# Instala todas las librerías necesarias (Express, Prisma, etc.).
npm install

Paso 2: Configurar la conexión a la Base de Datos

# El proyecto necesita un archivo .env para guardar la clave secreta de la base de datos.
# Crea una copia del archivo de ejemplo '.env.example' (si existe) y renómbrala a '.env'.
# Si no, crea el archivo '.env' manualmente.

Abre el archivo .env y pega la siguiente línea. La URL de conexión es compartida por todo el equipo. Pídesela al compañero que configuró el proyecto en Supabase.

# Contenido para tu archivo .env
DATABASE_URL="postgresql://postgres:[LA_CONTRASENA_DE_LA_DB]@db.xxxx.supabase.co:5432/postgres"

Paso 3: Sincronizar la Base de Datos

# Este comando es CRUCIAL. Lee nuestro código de modelos (schema.prisma)
# y crea o actualiza las tablas en la base de datos de Supabase para que coincidan.
npx prisma migrate dev

Paso 4: Generar el Cliente de Prisma

# Este comando prepara el cliente de Prisma para que podamos hacer consultas
# a la base de datos desde nuestro código JavaScript.
npx prisma generate

Paso 5: Iniciar el Servidor del Backend

# ¡Todo listo! Inicia el servidor en modo de desarrollo.
# Se ejecutará en http://localhost:3000 y se reiniciará automáticamente con cada cambio.
npm run dev

Verificación: Abre Postman y haz una petición GET a http://localhost:3000/api/canchas. Si recibes datos en formato JSON, el backend está funcionando.
