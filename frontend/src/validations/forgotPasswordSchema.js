import * as yup from 'yup';

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('El email no tiene un formato válido')
    .required('El email es obligatorio'),
});
