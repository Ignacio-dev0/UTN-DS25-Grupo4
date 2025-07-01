import React, { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

function GaleriaFotos({ imageUrl, otrasImagenes = [] }) {
  const [open, setOpen] = useState(false);

  const todasLasImagenes = [imageUrl, ...otrasImagenes]
    .filter(url => url)
    .map(url => ({ src: url }));
  
  if (!imageUrl) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
        <div className="col-span-2 row-span-2 bg-accent rounded-lg flex items-center justify-center">
            <p className="text-primary font-semibold">No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80 cursor-pointer" onClick={() => setOpen(true)}>
        <div className="col-span-1 row-span-2 bg-accent rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Imagen principal de la cancha"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="col-span-1 row-span-1 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
            {otrasImagenes[0] ? 
              <img src={otrasImagenes[0]} alt="Miniatura 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/> : 
              <p className="text-primary">Thumb 1</p>}
        </div>
        <div className="col-span-1 row-span-1 grid grid-cols-2 gap-2">
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden">
            {otrasImagenes[1] ? 
              <img src={otrasImagenes[1]} alt="Miniatura 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/> : 
              <p className="text-primary">Thumb 2</p>}
          </div>
          <div className="bg-accent rounded-lg flex items-center justify-center overflow-hidden">
            {otrasImagenes[2] ? 
              <img src={otrasImagenes[2]} alt="Miniatura 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/> : 
              <p className="text-primary">Thumb 3</p>}
          </div>
        </div>
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={todasLasImagenes}
        plugins={[Zoom, Thumbnails]}
      />
    </div>
  );
}

export default GaleriaFotos;
