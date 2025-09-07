import { useState, useEffect, useCallback } from 'react';

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
      const response = await fetch('http://localhost:3000/api/canchas');
      if (!response.ok) {
        throw new Error('Error al obtener canchas');
      }
      const data = await response.json();
      
      // Transformar datos manteniendo estructura compatible con CanchaCard
      const transformedData = data.map(cancha => {
        // Calcular precio mínimo desde los turnos reales
        const precios = cancha.turnos?.map(turno => turno.precio).filter(precio => precio > 0) || [];
        const precioMinimo = precios.length > 0 ? Math.min(...precios) : 15000;
        
        return {
          id: cancha.id,
          nroCancha: cancha.nroCancha, // Mantener nombre original
          numero: cancha.nroCancha, // Para compatibilidad
          deporte: cancha.deporte || { nombre: 'Sin deporte' },
          deporteId: cancha.deporteId,
          complejo: cancha.complejo, // Mantener objeto completo para que funcione cancha.complejo?.nombre
          complejoId: cancha.complejoId,
          localidad: cancha.complejo?.domicilio?.localidad?.nombre || 'Sin localidad',
          descripcion: cancha.descripcion || '',
          puntaje: cancha.puntaje || 0,
          image: cancha.image ? cancha.image.map(img => `http://localhost:3000${img}`) : [], // Mantener nombre 'image'
          imagenes: cancha.image ? cancha.image.map(img => `http://localhost:3000${img}`) : [], // Para compatibilidad
          turnos: cancha.turnos || [],
          precioDesde: precioMinimo,
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
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la cancha');
      }
      const data = await response.json();
      
      // Transformar datos manteniendo estructura compatible con CanchaCard
      const precios = data.turnos?.map(turno => turno.precio).filter(precio => precio > 0) || [];
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 15000;
      
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
        image: data.image ? data.image.map(img => `http://localhost:3000${img}`) : [], // Mantener nombre 'image'
        imagenes: data.image ? data.image.map(img => `http://localhost:3000${img}`) : [], // Para compatibilidad
        turnos: data.turnos || [],
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
      const response = await fetch('http://localhost:3000/api/deportes');
      if (!response.ok) {
        throw new Error('Error al obtener deportes');
      }
      const data = await response.json();
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
