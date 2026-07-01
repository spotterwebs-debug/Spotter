import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero({ setSharedPhoto }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // seguimos guardando por compatibilidad (no rompe nada existente)
      setSharedPhoto(file);

      // 🔥 FIX REAL: enviamos la imagen al create correctamente
      navigate('/create', {
        state: {
          fileFromCamera: file
        }
      });
    }
  };

  return (
    <div className="hero-card">
      <input 
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />

      <h2 className="hero-title">Comienza la aventura</h2>

      <button
        className="btn-giant-camera"
        onClick={() => fileInputRef.current.click()}
      >
        <div className="camera-lens-inner">
          <img src="/favicon.png" alt="Spotter" className="hero-favicon-img" />
        </div>
      </button>

      <p>Presiona para capturar</p>
    </div>
  );
}

export default Hero;