import { useState, useEffect } from 'react';
import { canchasApi, deportesApi, complejosApi, transformCanchaData, transformComplejoData } from '../services/api.js';

/**
 * Hook personalizado para manejar canchas desde el backend
 */
export const useCanchas = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCanchas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await canchasApi.getAll();
      const transformedData = data.map(transformCanchaData);
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

  const getCanchasByDeporte = async (deporteId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await canchasApi.getByDeporte(deporteId);
      const transformedData = data.map(transformCanchaData);
      setCanchas(transformedData);
    } catch (err) {
      setError('Error al cargar canchas por deporte');
      console.error('Error fetching canchas by deporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCanchasByComplejo = async (complejoId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await canchasApi.getByComplejo(complejoId);
      const transformedData = data.map(transformCanchaData);
      setCanchas(transformedData);
    } catch (err) {
      setError('Error al cargar canchas por complejo');
      console.error('Error fetching canchas by complejo:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    canchas,
    loading,
    error,
    refetch: fetchCanchas,
    getCanchasByDeporte,
    getCanchasByComplejo
  };
};

/**
 * Hook personalizado para manejar deportes desde el backend
 */
export const useDeportes = () => {
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeportes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await deportesApi.getAll();
        // El backend devuelve {deportes: [...], total: 8}, necesitamos solo el array
        setDeportes(data.deportes || data);
      } catch (err) {
        setError('Error al cargar los deportes');
        console.error('Error fetching deportes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeportes();
  }, []);

  return { deportes, loading, error };
};

/**
 * Hook personalizado para manejar complejos desde el backend
 */
export const useComplejos = () => {
  const [complejos, setComplejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplejos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complejosApi.getAll();
      const transformedData = data.map(transformComplejoData);
      setComplejos(transformedData);
    } catch (err) {
      setError('Error al cargar los complejos');
      console.error('Error fetching complejos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplejos();
  }, []);

  return { complejos, loading, error, refetch: fetchComplejos };
};

/**
 * Hook personalizado para manejar una cancha específica
 */
export const useCancha = (canchaId) => {
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canchaId) return;

    const fetchCancha = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await canchasApi.getById(canchaId);
        const transformedData = transformCanchaData(data);
        setCancha(transformedData);
      } catch (err) {
        setError('Error al cargar la cancha');
        console.error('Error fetching cancha:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCancha();
  }, [canchaId]);

  return { cancha, loading, error };
};

/**
 * Hook personalizado para manejar un complejo específico
 */
export const useComplejo = (complejoId) => {
  const [complejo, setComplejo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!complejoId) return;

    const fetchComplejo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await complejosApi.getById(complejoId);
        const transformedData = transformComplejoData(data);
        setComplejo(transformedData);
      } catch (err) {
        setError('Error al cargar el complejo');
        console.error('Error fetching complejo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplejo();
  }, [complejoId]);

  return { complejo, loading, error };
};
