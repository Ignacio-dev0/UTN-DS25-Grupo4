import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../validations/resetPasswordSchema';
import { resetPassword } from '../services/auth';

const RESET_STORAGE_KEY = 'passwordResetContext';

function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  const resetContext = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(RESET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('No se pudo leer el contexto de recuperación:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!resetContext) {
      navigate('/recuperar-contraseña', { replace: true });
    }
  }, [navigate, resetContext]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!resetContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">Redirigiendo...</div>
      </div>
    );
  }

  const onSubmit = async ({ code, newPassword }) => {
    setFeedback(null);

    const resultado = await resetPassword({
      email: resetContext.email,
      code,
      newPassword,
      resetToken: resetContext.resetToken,
    });

    if (resultado.ok) {
      sessionStorage.removeItem(RESET_STORAGE_KEY);
      setFeedback({ type: 'success', message: resultado.message });
      reset();
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    setFeedback({
      type: 'error',
      message: resultado.message,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Ingresá el código que enviamos a <strong>{resetContext.email}</strong> y escribí tu nueva contraseña.
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código de verificación
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              {...register('code')}
              className={`w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                errors.code ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'
              }`}
              placeholder="Ingresa el código de 6 dígitos"
            />
            {errors.code && (
              <span className="text-red-600 text-sm mt-1 inline-block">
                {errors.code.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              className={`w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'
              }`}
              placeholder="Escribí tu nueva contraseña"
            />
            {errors.newPassword && (
              <span className="text-red-600 text-sm mt-1 inline-block">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'
              }`}
              placeholder="Repetí la nueva contraseña"
            />
            {errors.confirmPassword && (
              <span className="text-red-600 text-sm mt-1 inline-block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50"
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/recuperar-contraseña" className="text-sm text-blue-500">
            ¿No recibiste el código? Pedir uno nuevo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RestablecerPasswordPage;
