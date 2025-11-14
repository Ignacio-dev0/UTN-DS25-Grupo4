import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { forgotPasswordSchema } from '../validations/forgotPasswordSchema';
import { requestPasswordReset } from '../services/auth';

const RESET_STORAGE_KEY = 'passwordResetContext';

function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async ({ email }) => {
    setFeedback(null);
    sessionStorage.removeItem(RESET_STORAGE_KEY);

    const respuesta = await requestPasswordReset(email);

    if (respuesta.ok && respuesta.resetToken) {
      sessionStorage.setItem(
        RESET_STORAGE_KEY,
        JSON.stringify({
          email,
          resetToken: respuesta.resetToken,
          requestedAt: Date.now(),
        })
      );
      navigate('/restablecer-contraseña');
      return;
    }

    setFeedback({
      type: respuesta.ok ? 'success' : 'error',
      message: respuesta.message,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Ingresá tu email y te enviaremos un código para restablecer tu contraseña.
        </p>

        {feedback && (
          <div
            className={`mb-4 rounded-md px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 inline-block">
                {errors.email.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando código...' : 'Enviar código'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-500">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPasswordPage;
