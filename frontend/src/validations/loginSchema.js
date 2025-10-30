import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string()
    .email("El formato del email no es válido")
    .required("El email es obligatorio"),
  password: yup.string()
    .required("La contraseña es obligatoria")
    .min(4, "La contraseña debe tener al menos 6 caracteres"),

  rememberMe: yup.boolean()
});
