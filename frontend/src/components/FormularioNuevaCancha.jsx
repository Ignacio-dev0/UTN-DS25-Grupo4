import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

function FormularioNuevaCancha({ onCerrar, onGuardar }) {
    const [nombreCancha, setNombreCancha] = useState('');
    const [deporte, setDeporte] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagenes, setImagenes] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombreCancha || !deporte || imagenes.length === 0) {
            alert('Por favor, completa el nombre, el deporte y sube al menos una imagen.');
            return;
        }
        onGuardar({
            nombre: nombreCancha,
            deporte: deporte,
            descripcion: descripcion,
            imagenes: imagenes,
        });
    };
    
    const handleImageChange = (e) => {
        if (e.target.files) {
            setImagenes(Array.from(e.target.files));
        }
    };

    return (                                    
        <div className="fixed inset-0 bg-opacity-40 bg-opacity-60 backdrop-blur-sm flex justify-center items-start z-50 p-8 overflow-y-auto pt-30">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary">Agregar Nueva Cancha</h2>
            <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
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
                            >
                                <option value="">Selecciona un deporte</option>
                                <option value="Fútbol 5">Fútbol 5</option>
                                <option value="Fútbol 11">Fútbol 11</option>
                                <option value="Tenis">Tenis</option>
                                <option value="Pádel">Pádel</option>
                                <option value="Básquet">Básquet</option>
                                <option value="Vóley">Vóley</option>
                                <option value="Hockey">Hockey</option>
                                <option value="Handball">Handball</option>
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
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple required accept="image/*" onChange={handleImageChange} />
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