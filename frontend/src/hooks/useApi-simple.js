import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api.js';

/**
 * Hook simplificado para manejar canchas desde el backend
 */
export const useCanchas = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCanchas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/canchas`);
      if (!response.ok) {
        throw new Error('Error al obtener canchas');
      }
      const result = await response.json();
      
      // Manejar respuesta de servicio no disponible
      if (result.message === 'Servicio temporalmente no disponible') {
        console.log('⚠️ Servicio de canchas temporalmente no disponible');
        setCanchas([]);
        setError('El servicio está temporalmente no disponible. Por favor, intenta más tarde.');
        return;
      }
      
      // El backend puede devolver { data: [...] } o { canchas: [...] }
      const data = result.data || result.canchas || result;
      
      // Verificar que data sea un array
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del servidor no es un array válido');
      }
      
      // Transformar datos manteniendo estructura original del backend
      const transformedData = data.map(cancha => {
        // Usar el precio precalculado del backend en lugar de recalcular
        return {
          ...cancha, // Mantener todos los datos originales (incluyendo precioDesde del backend)
          localidad: cancha.complejo?.domicilio?.localidad?.nombre || 'Sin localidad', // Campo de conveniencia
        };
      });
      
      setCanchas(transformedData);
    } catch (err) {
      setError('Error al cargar las canchas');
      console.error('Error fetching canchas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanchas();
  }, []);

  return { canchas, loading, error, refetch: fetchCanchas };
};

/**
 * Hook simplificado para obtener una cancha específica por ID
 */
export const useCancha = (canchaId) => {
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCancha = useCallback(async () => {
    if (!canchaId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/canchas/${canchaId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la cancha');
      }
      const result = await response.json();
      
      // El backend devuelve { cancha: {...} } para endpoints individuales
      const data = result.cancha || result;
      
      const createImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // Por ahora, usar placeholder hasta que el backend sirva imágenes correctamente
        return null; // Esto hará que se use el placeholder
      };
      
      // Transformar datos manteniendo estructura compatible con CanchaCard
      const precios = data.cronograma?.map(horario => horario.precio).filter(precio => precio > 0) || [];
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : null;
      
      const transformedCancha = {
        id: data.id,
        nroCancha: data.nroCancha, // Mantener nombre original
        numero: data.nroCancha, // Para compatibilidad
        deporte: data.deporte || { nombre: 'Sin deporte' },
        deporteId: data.deporteId,
        complejo: data.complejo, // Mantener objeto completo
        complejoId: data.complejoId,
        localidad: data.complejo?.domicilio?.localidad?.nombre || 'Sin localidad',
        descripcion: data.descripcion || '',
        puntaje: data.puntaje || 0,
        image: data.image ? data.image.map(img => createImageUrl(img)) : [], // Usando createImageUrl
        imagenes: data.image ? data.image.map(img => createImageUrl(img)) : [], // Para compatibilidad
        turnos: data.turnos || [],
        cronograma: data.cronograma || [], // Agregar cronograma
        precioDesde: precioMinimo,
      };
      
      setCancha(transformedCancha);
    } catch (err) {
      setError('Error al cargar la cancha');
      console.error('Error fetching cancha:', err);
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  useEffect(() => {
    fetchCancha();
  }, [fetchCancha]);

  return { cancha, loading, error, refetch: fetchCancha };
};

/**
 * Hook simplificado para manejar deportes desde el backend
 */
export const useDeportes = () => {
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/deportes`);
      if (!response.ok) {
        throw new Error('Error al obtener deportes');
      }
      const data = await response.json();
      
      // Manejar respuesta de servicio no disponible
      if (data.message === 'Servicio temporalmente no disponible') {
        console.log('⚠️ Servicio de deportes temporalmente no disponible');
        setDeportes([]);
        setError('El servicio está temporalmente no disponible. Por favor, intenta más tarde.');
        return;
      }
      
      setDeportes(data.deportes || []);
    } catch (err) {
      setError('Error al cargar los deportes');
      console.error('Error fetching deportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeportes();
  }, []);

  return { deportes, loading, error, refetch: fetchDeportes };
};
