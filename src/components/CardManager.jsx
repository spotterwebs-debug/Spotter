// src/components/CardManager.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TradingCard from './TradingCard';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

function CardManager({ carta, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // 1. EDITAR: Redirige a /edit/:id (asumiendo que tu ruta de edición es esa)
  const handleEditar = () => {
    navigate(`/edit/${carta.id}`);
  };

  // 2. CAMBIAR CATEGORÍA: SweetAlert con select
  const handleCambiarCategoria = async () => {
    const { value: nuevaCategoria } = await Swal.fire({
      title: 'Selecciona nueva categoría',
      input: 'select',
      inputOptions: {
        'perros': 'Perros',
        'gatos': 'Gatos',
        'plantas': 'Plantas',
        'paisajes': 'Paisajes',
        'aves': 'Aves'
      },
      inputPlaceholder: 'Elige una categoría',
      showCancelButton: true
    });

    if (nuevaCategoria) {
      await supabase.from('cards').update({ categoria: nuevaCategoria }).eq('id', carta.id);
      setShowModal(false);
      onUpdate();
      Swal.fire('¡Cambiado!', 'La categoría fue actualizada', 'success');
    }
  };

  // 3. COMPARTIR: Web Share API (WhatsApp, Instagram, etc)
  const handleCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¡Mira mi spot!',
          text: `Mira esta increíble carta de: ${carta.nombre}`,
          url: window.location.href, // O el link de tu web pública
        });
      } catch (err) { console.log("Error al compartir", err); }
    } else {
      Swal.fire('Copiado al portapapeles', 'El enlace ha sido copiado', 'info');
    }
  };

  // 4. BORRAR
  const handleBorrar = async () => {
    const result = await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      await supabase.from('cards').delete().eq('id', carta.id);
      setShowModal(false);
      onUpdate();
    }
  };

  return (
    <>
      <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
        <TradingCard datos={carta} />
      </div>

      {showModal && (
        <div className="custom-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-card-wrapper"><TradingCard datos={carta} /></div>
            
            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-outline-primary fw-bold" onClick={handleEditar}>✏️ Editar</button>
              <button className="btn btn-outline-warning fw-bold" onClick={handleCambiarCategoria}>📂 Cambiar Categoría</button>
              <button className="btn btn-info text-white fw-bold" onClick={handleCompartir}>📲 Compartir</button>
              
              {!carta.publica && (
                <button className="btn btn-success fw-bold" onClick={async () => {
                  await supabase.from('cards').update({ publica: true }).eq('id', carta.id);
                  setShowModal(false);
                  onUpdate();
                }}>🌐 Publicar en Comunidad</button>
              )}
              <button className="btn btn-danger fw-bold" onClick={handleBorrar}>🗑️ Borrar Card</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CardManager;