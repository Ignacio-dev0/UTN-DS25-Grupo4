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