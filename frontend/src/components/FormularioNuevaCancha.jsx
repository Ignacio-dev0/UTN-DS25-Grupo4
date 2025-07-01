import React, { useState } from 'react';

function FormularioNuevaCancha({ onCerrar, onGuardar }) {
    const [nombreCancha, setNombreCancha] = useState('');
    const [deporte, setDeporte] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombreCancha || !deporte) {
            alert('Por favor, completa el nombre y el deporte de la cancha.');
            return;
        }
        onGuardar({
            nombre: nombreCancha,
            deporte: deporte,
            descripcion: descripcion,
        });
    };

    return (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-primary">Agregar Nueva Cancha</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                    </div>
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
