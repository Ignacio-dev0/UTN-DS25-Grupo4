import prisma from '../config/prisma';
import { encrypt } from './encriptacionmp.service'; // Importa tu servicio de crypto

// Tus credenciales de CanchaYa (la aplicación)
const MP_APP_ID = process.env.MP_APP_ID; // ¡Variable de entorno!
const MP_SECRET = process.env.MP_CLIENT_SECRET; // ¡Variable de entorno!
const FRONTEND_URL = process.env.FRONTEND_URL; // ¡Variable de entorno!

//Genera la URL para que el dueño inicie el Oauth.

export async function generarUrlConexion(usuarioId: number) {
    const redirectUri = `${FRONTEND_URL}/mp-callback`;
    // --- FIN DEL CAMBIO ---
    const state = usuarioId.toString(); // Pasamos el ID del usuario

    const url = `https://auth.mercadopago.com.ar/authorization` +
             `?client_id=${MP_APP_ID}` +
             `&response_type=code` +
             `&platform_id=mp` +
             `&state=${state}` +
             `&redirect_uri=${redirectUri}`;

    return { authUrl: url };
}


//MP nos redirige al frontend, y el frontend nos llama con un 'code'.
//Nosotros cambiamos ese 'code' por los tokens y los guardamos.

export async function autorizarConexion(code: string, state: string) {
    const usuarioId = parseInt(state);
    const redirectUri = `${FRONTEND_URL}/dashboard/dueño/mp-callback`;

    console.log(`Autorizando MP Connect para usuarioId: ${usuarioId}`);

    try {
        // 1. Pedirle a MP el Access Token
        const response = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MP_SECRET}`
            },
            body: JSON.stringify({
            client_id: MP_APP_ID,
            client_secret: MP_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            })
        });

        const tokenData = await response.json();
        if (!tokenData.access_token) {
            console.error("MP no devolvió un access token:", tokenData);
            throw new Error('Mercado Pago no devolvió un access token');
        }

        console.log(`Tokens recibidos para MP User ID: ${tokenData.user_id}`);

       // 2. Guardar los tokens ENCRIPTADOS en la BD
        await prisma.$transaction(async (tx) => {
            await tx.usuario.update({
                where: { id: usuarioId },
                data: {
                    mpUserId: tokenData.user_id.toString(),
                    mpAccessToken: encrypt(tokenData.access_token),
                    mpRefreshToken: encrypt(tokenData.refresh_token),
                    mpTokenExpiresIn: tokenData.expires_in,
                    mpLastUpdated: new Date()
                }
            });

            // 3. Actualizar el estado del Complejo
            // Asumimos que la aprobación del admin es otro paso.
            // Si no hay aprobación de admin, podés cambiarlo a APROBADO.
            await tx.complejo.updateMany({
                where: { 
                    usuarioId: usuarioId,
                    estado: 'PENDIENTE'
                },
                data: { 
                // Si tenés un paso de Aprobación de Admin, dejalo en PENDIENTE.
                // Si la conexión de MP es el último paso, poné APROBADO.
                // Para este ejemplo, asumimos que APROBADO es el siguiente paso.
                    estado: 'APROBADO' 
                }
            });
        });

        console.log(`✅ Usuario ${usuarioId} conectado con MP y complejo actualizado.`);
        return { ok: true };

    } catch (error: any) {
        console.error(`Error al autorizar MP Connect: ${error.message}`);
        throw new Error("No se pudo completar la conexión con MP");
    }
}