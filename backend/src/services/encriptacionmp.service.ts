import * as crypto from 'crypto';

// ¡ASEGÚRATE DE PONER ESTO EN TUS VARIABLES DE ENTORNO!
// Debe ser una clave de 32 bytes (ej: "un-secreto-muy-largo-de-32-bytes")
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY debe ser de 32 bytes.');
}

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
     Encripta un texto.
**/
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
    Desencripta un texto.
**/
export function decrypt(text: string): string {
    try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
    } catch (error) {
    console.error("Error al desencriptar:", error);
    throw new Error("Error al desencriptar el token.");
    }
}