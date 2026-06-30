import React, { useRef, useState } from 'react';
import './Hero.css';

function Hero() {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  return (
    <section className="spotter-hero d-flex align-items-center justify-content-center text-center">
      <div className="container px-4">
        
        {/* INPUT INVISIBLE DE LA CÁMARA */}
        <input 
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} 
        />

        <div className="hero-action-container">
          
          {/* TEXTO EN BLANCO ARRIBA DEL BOTÓN */}
          <h2 className="text-white fw-bold mb-4 animate-fade-in text-uppercase tracking-wide fs-4">
            Comienza la aventura
          </h2>
          
          {/* BOTÓN GIGANTE CON GRADIENTE Y FAVICON */}
          <button 
            className="btn-giant-camera shadow-lg" 
            onClick={handleButtonClick}
            aria-label="Iniciar cámara"
          >
            <div className="camera-lens-inner">
              {/* Tu imagen de favicon desde la carpeta public */}
              <img 
                src="/favicon.png" 
                alt="Spotter Icon" 
                className="hero-favicon-img"
              />
            </div>
          </button>
          
          <p className="text-white-50 mt-3 fw-semibold text-uppercase tracking-wider fs-7">
            {previewUrl ? '¿Capturar otra?' : 'Presiona para capturar'}
          </p>
        </div>

        {/* PREVIEW TEMPORAL DE LA FOTO CAPTURADA */}
        {previewUrl && (
          <div className="preview-container mt-5 animate-fade-in">
            <p className="fw-bold text-success mb-2">📸 ¡Foto de la aventura lista!</p>
            <div className="preview-frame mx-auto shadow">
              <img src={previewUrl} alt="Captura Spotter" className="img-fluid" />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default Hero;