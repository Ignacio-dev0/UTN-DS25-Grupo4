import * as yup from 'yup';

// Expresión regular para CUIT Argentino
const cuitRegex = /^(20|23|24|27|30|33|34)-[0-9]{8}-[0-9]$/;
// Expresión regular para DNI Argentino (7 u 8 dígitos)
const dniRegex = /^\d{7,8}$/;
// Expresión regular para teléfono Argentino (acepta +54 y 10 dígitos)
const phoneRegex = /^\+?54[0-9]{10}$/;

export const registerSchema = yup.object().shape({
  firstName: yup.string()
    .required('El nombre es obligatorio'),
  lastName: yup.string()
    .required('El apellido es obligatorio'),
  dni: yup.string()
    .required('El DNI es obligatorio')
    .matches(dniRegex, 'El DNI debe tener 7 u 8 dígitos'),
  email: yup.string()
    .email('El formato del email no es válido')
    .required('El email es obligatorio'),
  phone: yup.string()
    .required('El teléfono es obligatorio')
    .matches(phoneRegex, 'El teléfono debe tener formato argentino (ej: +542215551234)'),
  password: yup.string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: yup.string()
    .required('Debes confirmar la contraseña')
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir'),

  complexName: yup.string().when('$userType', {
    is: 'owner', 
    then: (schema) => schema.required('El nombre del complejo es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  cuit: yup.string().when('$userType', {
    is: 'owner',
    then: (schema) => schema
      .matches(cuitRegex, 'El CUIT debe tener el formato XX-XXXXXXXX-X')
      .required('El CUIT es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  calle: yup.string().when('$userType', {
    is: 'owner',
    then: (schema) => schema.required('La calle es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  altura: yup.string().when('$userType', {
    is: 'owner',
    then: (schema) => schema.required('La altura es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  localidad: yup.string().when('$userType', { 
    is: 'owner',
    then: (schema) => schema.required('La localidad es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  
});

