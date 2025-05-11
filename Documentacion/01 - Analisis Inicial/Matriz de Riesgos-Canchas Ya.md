**Matriz de riesgos:** 

| ID | RIesgo | Descripción | Probabilidad | Impacto | Estrategia de MItigación | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| R01 | Doble reserva o conflictos de turnos | Superposición de reservas por errores en la agenda digital o mal registro manual. | Media | Alto | Mantenimiento preventivo, monitoreo constante, servidor escalable. | Equipo de Desarrollo  backend  |
| R02 | Ampliación del Alcance | Incorporación no controlada de nuevas funcionalidades no previstas inicialmente. Pueden aparecer nuevas necesidades de los usuarios. | Medio | Alto | Definición clara y documentada del alcance inicial. Establecer un Plan de Gestión de Cambios Formal. | Analistas de información. |
| R03 | Brechas de Seguridad | Robo de datos personales (nombres, mails, tarjetas de pago) debido a vulnerabilidades del sitio. | Media | Alto | Implementar HTTPS, validaciones de seguridad, escaneos de vulnerabilidades periódicos, política de contraseñas seguras. | Especialista en Ciberseguridad |
| R04 | Caída del Sitio Web | Inaccesibilidad de la página por fallos del servidor, hosting o ataques externos. | Alto | Alto | Contratar hosting confiable, monitoreo 24/7, sistema de alertas, backups automáticos, planes de recuperación rápida. | Equipo de Frontend y Backend |
| R05 | Incompatibilidad  con Dispositivos | La web no funciona correctamente en celulares o navegadores antiguos, afectando la experiencia del usuario.  | Medio | Medio | Diseño responsive, testing cross-browser y en distintos dispositivos, actualizaciones constantes de compatibilidad. | Equipo UX/UI y Desarrollo |
| R06 | Problemas con la conexión con Sistemas Externos. | Dificultades técnicas al conectar la web con diferentes APIs. Inestabilidad de la API de terceros, cambios en sus endpoints o credenciales vencidas. | Media | Alto | Pruebas de integración tempranas y continuas. Investigación temprana y exhaustiva de los protocolos de integración de los diferentes SIstemas Externos.  | Equipo de Desarrollo Backend |

