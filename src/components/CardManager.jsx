// src/components/CardManager.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TradingCard from './TradingCard';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import { toPng } from 'html-to-image';

function CardManager({ carta, onUpdate, likesCount = 0 }) {
  const [showModal, setShowModal] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleEditar = () => {
    navigate(`/edit/${carta.id}`);
  };

  const handleCambiarCategoria = async () => {
    const { value: nuevaCategoria } = await Swal.fire({
      title: 'Selecciona nueva categoría',
      input: 'select',
      inputOptions: {
        perros: 'Perros',
        gatos: 'Gatos',
        plantas: 'Plantas',
        paisajes: 'Paisajes',
        aves: 'Aves'
      },
      inputPlaceholder: 'Elige una categoría',
      showCancelButton: true
    });

    if (nuevaCategoria) {
      await supabase
        .from('cards')
        .update({ categoria: nuevaCategoria })
        .eq('id', carta.id);

      setShowModal(false);
      onUpdate();

      Swal.fire(
        '¡Cambiado!',
        'La categoría fue actualizada',
        'success'
      );
    }
  };

  const handleDescargarParaCompartir = async () => {
    if (cardRef.current === null) {
      Swal.fire('Error', 'No se pudo capturar la carta', 'error');
      return;
    }

    try {
      // 1. Generamos la imagen PNG limpia a partir de la carta actual
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      
      // 2. Creamos la descarga directa al dispositivo
      const link = document.createElement('a');
      link.download = `spotter-${carta.nombre || 'carta'}.png`;
      link.href = dataUrl;
      link.click();

      // 3. Aviso claro y directo para el usuario
      Swal.fire({
        title: '¡Card descargada!',
        text: 'Ya se guardó en tu dispositivo. Sube la imagen a tus historias de Instagram o envíala por WhatsApp.',
        icon: 'success',
        confirmButtonText: '¡Genial!'
      });

    } catch (err) {
      console.error('Error al generar la imagen:', err);
      Swal.fire('Error', 'No se pudo descargar la imagen', 'error');
    }
  };

  const handleBorrar = async () => {
    const result = await Swal.fire({
      title: '¿Borrar?',
      icon: 'warning',
      showCancelButton: true
    });

    if (result.isConfirmed) {
      await supabase
        .from('cards')
        .delete()
        .eq('id', carta.id);

      setShowModal(false);
      onUpdate();
    }
  };

  return (
    <>
      {/* CARD MINI DEL ALBUM */}
      <div
        onClick={() => setShowModal(true)}
        style={{ cursor: 'pointer' }}
      >
        <TradingCard
          datos={carta}
          likes={likesCount}
          showLikes={true}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="custom-modal-content"
            onClick={e => e.stopPropagation()}
          >
            {/* CARD COMPLETA EN MODAL - ENVUELTA CON LA REF PARA DESCARGARLA */}
            <div ref={cardRef} className="modal-card-wrapper full-card">
              <TradingCard
                datos={carta}
                likes={likesCount}
                showLikes={true}
                enableImageZoom={true}
              />
            </div>

            {/* BOTONES */}
            <div className="d-grid gap-2 mt-3">
              <button
                className="btn btn-outline-primary fw-bold"
                onClick={handleEditar}
              >
                ✏️ Editar
              </button>

              <button
                className="btn btn-outline-warning fw-bold"
                onClick={handleCambiarCategoria}
              >
                📂 Cambiar Categoría
              </button>

              {/* ÚNICO BOTÓN DE DESCARGA PARA COMPARTIR */}
              <button
                className="btn btn-info text-white fw-bold"
                onClick={handleDescargarParaCompartir}
              >
                📥 Descarga tu card para compartirla!
              </button>

              {!carta.publica && (
                <button
                  className="btn btn-success fw-bold"
                  onClick={async () => {
                    await supabase
                      .from('cards')
                      .update({ publica: true })
                      .eq('id', carta.id);

                    setShowModal(false);
                    onUpdate();
                  }}
                >
                  🌐 Publicar en Comunidad
                </button>
              )}

              <button
                className="btn btn-danger fw-bold"
                onClick={handleBorrar}
              >
                🗑️ Borrar Card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CardManager;