import * as yup from 'yup';
export const loginShema = yup.object().shape ({
    email: yup
    .string()
    .required('El email debe ser requerido')
    .email('El email debe ser valido'),

    password: yup
    .string()
    .required('La password es requerida')
})