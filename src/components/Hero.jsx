import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importamos SweetAlert
import './Hero.css';

function Hero({ setSharedPhoto }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Función que maneja la lógica de navegación real
  const triggerCamera = () => {
    fileInputRef.current.click();
  };

  const handleTutorial = () => {
    const esPrimeraVez = localStorage.getItem('spotter_tutorial_visto');

    if (!esPrimeraVez) {
      Swal.fire({
        title: '¡Bienvenido a Spotter!',
        html: `
          <div style="text-align: left; font-size: 0.9rem;">
            <p>📸 <b>Tomá</b> una foto o elegí una de tu galería.</p>
            <p>🐶 <b>Seleccioná</b> una categoría: Perros, Gatos, Aves, Plantas o Paisajes.</p>
            <p>🃏 <b>Spotter</b> generará una Trading Card automática.</p>
            <p>📚 <b>Guardala</b> en tu álbum o compartila.</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: '¡Entendido!',
        confirmButtonColor: '#4A90E2',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem('spotter_tutorial_visto', 'true');
          triggerCamera();
        }
      });
    } else {
      triggerCamera();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSharedPhoto(file);
      navigate('/create', { state: { fileFromCamera: file } });
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

      {/* Cambiamos el onClick para que llame al tutorial */}
      <button
        className="btn-giant-camera"
        onClick={handleTutorial}
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