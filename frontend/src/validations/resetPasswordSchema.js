import * as yup from 'yup';

export const resetPasswordSchema = yup.object().shape({
  code: yup
    .string()
    .required('El código es obligatorio')
    .matches(/^\d{6}$/, 'El código debe tener 6 dígitos'),
  newPassword: yup
    .string()
    .required('La nueva contraseña es obligatoria')
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: yup
    .string()
    .required('Debés confirmar la nueva contraseña')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas deben coincidir'),
});
