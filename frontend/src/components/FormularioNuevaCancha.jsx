import React, { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../config/api.js';

function FormularioNuevaCancha({ onCerrar, onGuardar }) {
    const [nombreCancha, setNombreCancha] = useState('');
    const [deporte, setDeporte] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [deportes, setDeportes] = useState([]);
    const [loadingDeportes, setLoadingDeportes] = useState(true);

    // Cargar deportes desde la API
    useEffect(() => {
        const cargarDeportes = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/deportes`);
                if (response.ok) {
                    const data = await response.json();
                    setDeportes(data.deportes || data || []);
                }
            } catch (error) {
                console.error('Error al cargar deportes:', error);
                // Deportes por defecto en caso de error
                setDeportes([
                    { id: 33, nombre: 'Fútbol 5' },
                    { id: 34, nombre: 'Fútbol 11' },
                    { id: 35, nombre: 'Vóley' },
                    { id: 36, nombre: 'Básquet' },
                    { id: 37, nombre: 'Handball' },
                    { id: 38, nombre: 'Tenis' },
                    { id: 39, nombre: 'Pádel' },
                    { id: 40, nombre: 'Hockey' }
                ]);
            } finally {
                setLoadingDeportes(false);
            }
        };

        cargarDeportes();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones mejoradas
        if (!nombreCancha || !nombreCancha.trim()) {
            alert('Por favor, ingresa el nombre de la cancha.');
            return;
        }
        
        if (!deporte) {
            alert('Por favor, selecciona un deporte.');
            return;
        }
        
        if (!imagenes || imagenes.length === 0) {
            alert('Por favor, sube al menos una imagen de la cancha.');
            return;
        }
        
        // Validar que todas las imágenes sean archivos válidos
        const imagenesValidas = Array.from(imagenes).every(file => 
            file && file instanceof File && file.type.startsWith('image/')
        );
        
        if (!imagenesValidas) {
            alert('Por favor, asegúrate de que todos los archivos sean imágenes válidas.');
            return;
        }
        
        onGuardar({
            nombre: nombreCancha.trim(),
            deporte: deporte,
            descripcion: descripcion.trim(),
            imagenes: Array.from(imagenes),
        });
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const archivos = Array.from(e.target.files);
            
            // Validar que todos los archivos sean imágenes
            const imagenesValidas = archivos.filter(file => 
                file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // máximo 5MB
            );
            
            if (imagenesValidas.length !== archivos.length) {
                alert('Algunos archivos no son imágenes válidas o son demasiado grandes (máximo 5MB).');
            }
            
            setImagenes(imagenesValidas);
        } else {
            setImagenes([]);
        }
    };

    return (                                    
        <div className="fixed inset-0 bg-opacity-40 bg-opacity-60 backdrop-blur-sm flex justify-center items-start z-50 p-8 overflow-y-auto pt-30">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary">Agregar Nueva Cancha</h2>
            <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} noValidate>
                <div className="space-y-6">
                {/* Campo Nombre de Cancha */}
                        <div>
                            <label htmlFor="nombreCancha" className="block text-sm font-medium text-gray-700">Número o Nombre de Cancha</label>
                            <input
                                type="text"
                                id="nombreCancha"
                                value={nombreCancha}
                                onChange={(e) => setNombreCancha(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                required
                                placeholder="Ej: Cancha N° 7"
                            />
                        </div>

                        {/* Campo Deporte */}
                        <div>
                            <label htmlFor="deporte" className="block text-sm font-medium text-gray-700">Deporte</label>
                            <select
                                id="deporte"
                                value={deporte}
                                onChange={(e) => setDeporte(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                required
                                disabled={loadingDeportes}
                            >
                                <option value="">
                                    {loadingDeportes ? 'Cargando deportes...' : 'Selecciona un deporte'}
                                </option>
                                {deportes.map(dep => (
                                    <option key={dep.id} value={dep.nombre}>
                                        {dep.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campo Descripción */}
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                            <textarea
                                id="descripcion"
                                rows="3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="Ej: Césped sintético, con buena iluminación."
                            />
                        </div>

                        {/* Campo para subir imágenes */}
                        <div>
                            <label htmlFor="imagenesCancha" className="block text-sm font-medium text-gray-700 mb-2">Imágenes de la cancha</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                <div className="text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-secondary"
                                        >
                                            <span>Sube los archivos</span>
                                            <input 
                                                id="file-upload" 
                                                name="file-upload" 
                                                type="file" 
                                                className="sr-only" 
                                                multiple 
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                                                onChange={handleImageChange} 
                                            />
                                        </label>
                                        <p className="pl-1">o arrástralos aquí</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, etc. Mínimo 1 imagen.</p>
                                </div>
                            </div>
                            {/* Vista previa de los nombres de los archivos seleccionados */}
                            {imagenes.length > 0 && (
                                <div className="mt-4 text-xs text-gray-500">
                                    <p className="font-bold">Archivos seleccionados ({imagenes.length}):</p>
                                    <ul className="list-disc list-inside">
                                        {imagenes.map((file, index) => <li key={index}>{file.name}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Botones de acción del formulario */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onCerrar} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-secondary text-light font-bold py-2 px-4 rounded-lg hover:bg-primary transition-colors">
                            Guardar Cancha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioNuevaCancha;