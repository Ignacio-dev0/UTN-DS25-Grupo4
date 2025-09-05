import React, { useState, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';

function GaleriaFotosEditable({ imageUrl, otrasImagenes = [], setCancha }) {
  const fileInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // Para saber qué imagen se está cargando

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setCancha(prevCancha => {
        if (currentImageIndex === 'main') {
          return { ...prevCancha, imageUrl: newImageUrl };
        } else if (typeof currentImageIndex === 'number') {
          const updatedOtrasImagenes = [...prevCancha.otrasImagenes];
          updatedOtrasImagenes[currentImageIndex] = newImageUrl;
          return { ...prevCancha, otrasImagenes: updatedOtrasImagenes };
        } else if (currentImageIndex === 'new') {
          // Si se hace clic en el último '+' para agregar una nueva imagen
          return { ...prevCancha, otrasImagenes: [...prevCancha.otrasImagenes, newImageUrl] };
        }
        return prevCancha;
      });
    }
    setCurrentImageIndex(null); 
  };

  const handleAddImageClick = (index) => {
    setCurrentImageIndex(index);
    fileInputRef.current.click();
  };

  // Pre-generamos espacios para 3 thumbnails adicionales si no existen
  const thumbnailsParaMostrar = [...otrasImagenes];
  while (thumbnailsParaMostrar.length < 3) {
    thumbnailsParaMostrar.push(null); // Rellenar con nulos si faltan imágenes
  }

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
        <div className="col-span-1 row-span-2 bg-accent rounded-lg overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt="Imagen principal de la cancha"
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => handleAddImageClick('main')} 
            className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300"
            title="Cambiar imagen principal"
          >
            <FaPlus />
          </button>
        </div>
        <div className="col-span-1 row-span-1 bg-accent rounded-lg flex items-center justify-center overflow-hidden relative">
            {thumbnailsParaMostrar[0] ? (
              <>
                <img src={thumbnailsParaMostrar[0]} alt="Miniatura 1" className="w-full h-full object-cover"/>
                <button 
                  onClick={() => handleAddImageClick(0)} 
                  className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  title="Cambiar miniatura"
                >
                  <FaPlus />
                </button>
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
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden relative">
            {thumbnailsParaMostrar[1] ? (
              <>
                <img src={thumbnailsParaMostrar[1]} alt="Miniatura 2" className="w-full h-full object-cover"/>
                <button 
                  onClick={() => handleAddImageClick(1)} 
                  className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  title="Cambiar miniatura"
                >
                  <FaPlus />
                </button>
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
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden relative">
            {thumbnailsParaMostrar[2] ? (
              <>
                <img src={thumbnailsParaMostrar[2]} alt="Miniatura 3" className="w-full h-full object-cover"/>
                <button 
                  onClick={() => handleAddImageClick(2)} 
                  className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  title="Cambiar miniatura"
                >
                  <FaPlus />
                </button>
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