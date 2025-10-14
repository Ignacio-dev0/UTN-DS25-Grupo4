import React, { useState, useRef } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { getImageUrl, getPlaceholderImage } from '../config/api.js';

function GaleriaFotosEditable({ imageUrl, otrasImagenes = [], setCancha }) {
  const fileInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // Para saber qué imagen se está cargando

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tamaño del archivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCancha(prevCancha => {
          if (currentImageIndex === 'main') {
            return { 
              ...prevCancha, 
              image: [reader.result], // Actualizar array principal
              imageUrl: reader.result,
              imageData: reader.result
            };
          } else if (typeof currentImageIndex === 'number') {
            const updatedOtrasImagenes = [...(prevCancha.otrasImagenes || [])];
            updatedOtrasImagenes[currentImageIndex] = reader.result;
            return { ...prevCancha, otrasImagenes: updatedOtrasImagenes };
          } else if (currentImageIndex === 'new') {
            // Si se hace clic en el último '+' para agregar una nueva imagen
            return { 
              ...prevCancha, 
              otrasImagenes: [...(prevCancha.otrasImagenes || []), reader.result] 
            };
          }
          return prevCancha;
        });
      };
      reader.readAsDataURL(file);
    }
    setCurrentImageIndex(null); 
  };

  const handleAddImageClick = (index) => {
    setCurrentImageIndex(index);
    fileInputRef.current.click();
  };

  const handleDeleteImage = (index) => {
    if (index === 'main') {
      // Eliminar imagen principal
      setCancha(prevCancha => ({
        ...prevCancha,
        image: [],
        imageUrl: null,
        imageData: null
      }));
    } else if (typeof index === 'number') {
      // Eliminar imagen de thumbnails
      setCancha(prevCancha => {
        const updatedOtrasImagenes = [...(prevCancha.otrasImagenes || [])];
        updatedOtrasImagenes.splice(index, 1);
        return { ...prevCancha, otrasImagenes: updatedOtrasImagenes };
      });
    }
  };

  // Pre-generamos espacios para 3 thumbnails adicionales si no existen
  const thumbnailsParaMostrar = [...otrasImagenes];
  while (thumbnailsParaMostrar.length < 3) {
    thumbnailsParaMostrar.push(null); // Rellenar con nulos si faltan imágenes
  }

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
        <div className="col-span-1 row-span-2 bg-accent rounded-lg overflow-hidden relative group">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl?.startsWith('data:') ? imageUrl : getImageUrl(imageUrl) || getPlaceholderImage('Cancha')} 
                alt="Imagen principal de la cancha"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getPlaceholderImage('Cancha');
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <button 
                  onClick={() => handleAddImageClick('main')} 
                  className="bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-primary transition-colors"
                  title="Cambiar imagen principal"
                >
                  <FaPlus className="text-lg" />
                </button>
                <button 
                  onClick={() => handleDeleteImage('main')} 
                  className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Eliminar imagen principal"
                >
                  <FaTrash className="text-lg" />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => handleAddImageClick('main')} 
              className="w-full h-full flex items-center justify-center text-primary text-4xl hover:bg-gray-200 transition-colors"
              title="Agregar imagen principal"
            >
              <FaPlus />
            </button>
          )}
        </div>
        <div className="col-span-1 row-span-1 bg-accent rounded-lg flex items-center justify-center overflow-hidden relative group">
            {thumbnailsParaMostrar[0] ? (
              <>
                <img 
                  src={thumbnailsParaMostrar[0]?.startsWith('data:') ? thumbnailsParaMostrar[0] : getImageUrl(thumbnailsParaMostrar[0]) || getPlaceholderImage('Miniatura')} 
                  alt="Miniatura 1" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage('Miniatura');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleAddImageClick(0)} 
                    className="bg-secondary text-white p-2 rounded-full shadow-lg hover:bg-primary transition-colors"
                    title="Cambiar miniatura"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(0)} 
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Eliminar miniatura"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => handleAddImageClick(0)} 
                className="w-full h-full flex items-center justify-center text-primary text-4xl hover:bg-gray-200 transition-colors"
                title="Agregar miniatura"
              >
                <FaPlus />
              </button>
            )}
        </div>
        <div className="col-span-1 row-span-1 grid grid-cols-2 gap-2">
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden relative group">
            {thumbnailsParaMostrar[1] ? (
              <>
                <img 
                  src={thumbnailsParaMostrar[1]?.startsWith('data:') ? thumbnailsParaMostrar[1] : getImageUrl(thumbnailsParaMostrar[1]) || getPlaceholderImage('Miniatura')} 
                  alt="Miniatura 2" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage('Miniatura');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1">
                  <button 
                    onClick={() => handleAddImageClick(1)} 
                    className="bg-secondary text-white p-1.5 rounded-full shadow-lg hover:bg-primary transition-colors"
                    title="Cambiar miniatura"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(1)} 
                    className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Eliminar miniatura"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => handleAddImageClick(1)} 
                className="w-full h-full flex items-center justify-center text-primary text-4xl hover:bg-gray-200 transition-colors"
                title="Agregar miniatura"
              >
                <FaPlus />
              </button>
            )}
          </div>
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden relative group">
            {thumbnailsParaMostrar[2] ? (
              <>
                <img 
                  src={thumbnailsParaMostrar[2]?.startsWith('data:') ? thumbnailsParaMostrar[2] : getImageUrl(thumbnailsParaMostrar[2]) || getPlaceholderImage('Miniatura')} 
                  alt="Miniatura 3" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage('Miniatura');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1">
                  <button 
                    onClick={() => handleAddImageClick(2)} 
                    className="bg-secondary text-white p-1.5 rounded-full shadow-lg hover:bg-primary transition-colors"
                    title="Cambiar miniatura"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(2)} 
                    className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Eliminar miniatura"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => handleAddImageClick(2)} 
                className="w-full h-full flex items-center justify-center text-primary text-4xl hover:bg-gray-200 transition-colors"
                title="Agregar miniatura"
              >
                <FaPlus />
              </button>
            )}
          </div>
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept="image/*"
      />
    </div>
  );
}

export default GaleriaFotosEditable;