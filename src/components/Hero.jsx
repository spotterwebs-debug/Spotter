import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Hero.css';

function Hero() {

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ==========================================
  // ABRIR CÁMARA
  // ==========================================

  const triggerCamera = () => {

    if (!fileInputRef.current) {
      console.error(
        'No existe referencia al input de cámara'
      );

      return;
    }

    // Vacía el input para permitir volver
    // a sacar una foto aunque sea el mismo archivo
    fileInputRef.current.value = '';

    fileInputRef.current.click();
  };


  // ==========================================
  // TUTORIAL
  // ==========================================

  const handleTutorial = async () => {

    const esPrimeraVez =
      localStorage.getItem(
        'spotter_tutorial_visto'
      );

    if (!esPrimeraVez) {

      const result = await Swal.fire({

        title:
          '¡Bienvenido a Spotter!',

        html: `
          <div style="text-align: left; font-size: 0.9rem;">

            <p>
              📸 <b>Tomá</b> una foto o elegí una de tu galería.
            </p>

            <p>
              🐶 <b>Seleccioná</b> una categoría:
              Perros, Gatos, Aves, Plantas o Paisajes.
            </p>

            <p>
              🃏 <b>Spotter</b> generará una Trading Card automática.
            </p>

            <p>
              📚 <b>Guardala</b> en tu álbum o compartila.
            </p>

          </div>
        `,

        icon:
          'info',

        confirmButtonText:
          '¡Entendido!',

        confirmButtonColor:
          '#4A90E2',

        allowOutsideClick:
          false
      });

      if (result.isConfirmed) {

        localStorage.setItem(
          'spotter_tutorial_visto',
          'true'
        );

        triggerCamera();
      }

      return;
    }

    triggerCamera();
  };


  // ==========================================
  // FOTO RECIBIDA
  // ==========================================

  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    navigate(
      '/create',
      {
        state: {
          fileFromCamera: file
        }
      }
    );
  };


  // ==========================================
  // VISTA
  // ==========================================

  return (

    <div className="hero-card">

      {/* INPUT OCULTO DE CÁMARA */}

      <input
        type="file"
        accept="image/*"
        capture="environment"

        ref={fileInputRef}

        onChange={
          handleFileChange
        }

        style={{
          display: 'none'
        }}
      />


      <h2>
        Comienza la aventura
      </h2>


      <button
        type="button"
        className="btn-giant-camera"
        onClick={handleTutorial}
      >

        <div className="camera-lens-inner">

          <img
            src="/favicon.png"
            alt="Spotter"
            className="hero-favicon-img"
          />

        </div>

      </button>


      <p>
        Presiona para capturar
      </p>

    </div>

  );
}

export default Hero;