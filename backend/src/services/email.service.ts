import * as Brevo from '@getbrevo/brevo';
import { SendSmtpEmail } from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();

// Se autentica usando la API Key guardada en .env
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export const enviarEmailBienvenida = async (emailDestino: string, nombreDestino: string) => {
  
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.sender = { 
    name: 'El equipo de CanchaYA', 
    email: 'canchaya2025ds@gmail.com' 
  };
  
  sendSmtpEmail.to = [
    { email: emailDestino, name: nombreDestino }
  ];

  // opcion 1: 'subject' y 'htmlContent' fijos
  // sendSmtpEmail.subject = '¡Bienvenido a CanchaYA!';
  // sendSmtpEmail.htmlContent = `<html><body><h1>Hola ${nombreDestino},</h1><p>Gracias por registrarte.</p></body></html>`;

  // O usar una plantilla de Brevo
  sendSmtpEmail.templateId = 1;
  sendSmtpEmail.params = {
    nombre: nombreDestino,
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email de bienvenida enviado a ${emailDestino}. MessageId: ${data.body.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar email a ${emailDestino}:`, error);
  }
};

export const enviarEmailComplejoAprobado = async (emailDuenio: string, nombreComplejo: string, nombreDuenio: string) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.sender = { name: 'Administración CanchaYA', email: 'canchaya2025ds@gmail.com' };
  sendSmtpEmail.to = [{ email: emailDuenio }];
  
  sendSmtpEmail.templateId = 2; 
  sendSmtpEmail.params = {
    nombre_duenio: nombreDuenio,
    nombre_complejo: nombreComplejo,
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email de aprobación enviado a ${emailDuenio}. MessageId: ${data.body.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar email de aprobación a ${emailDuenio}:`, error);
  }
};



// agregar más funciones como:
// - enviarEmailReservaConfirmada
// - enviarEmailPasswordReset

export const enviarCodigoRecuperacionPassword = async (
  emailDestino: string,
  nombreDestino: string | null,
  codigo: string
) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.sender = { name: 'Soporte CanchaYA', email: 'canchaya2025ds@gmail.com' };
  sendSmtpEmail.to = [{ email: emailDestino, name: nombreDestino ?? emailDestino }];

  const templateId = process.env.BREVO_TEMPLATE_PASSWORD_RESET_ID
    ? Number(process.env.BREVO_TEMPLATE_PASSWORD_RESET_ID)
    : null;

  if (templateId) {
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = {
      nombre: nombreDestino ?? 'usuario',
      codigo,
    };
  } else {
    sendSmtpEmail.subject = 'Código para recuperar tu contraseña';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <p>Hola ${nombreDestino ?? 'usuario'},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña en CanchaYA.</p>
          <p>Tu código de verificación es:</p>
          <h2 style="letter-spacing:4px;">${codigo}</h2>
          <p>Este código es válido durante 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </body>
      </html>
    `;
    sendSmtpEmail.textContent = `Tu código para recuperar la contraseña es ${codigo}. Vence en 15 minutos.`;
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Código de recuperación enviado a ${emailDestino}. MessageId: ${data.body.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar código de recuperación a ${emailDestino}:`, error);
    throw error;
  }
};