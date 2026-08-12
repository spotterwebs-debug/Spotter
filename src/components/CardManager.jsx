// src/components/CardManager.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TradingCard from './TradingCard';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

function CardManager({
  carta,
  onUpdate,
  likesCount = 0
}) {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [showModal, setShowModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const navigate = useNavigate();

  // =========================================================
  // EDITAR
  // =========================================================

  const handleEditar = () => {
    navigate(`/edit/${carta.id}`);
  };

  // =========================================================
  // CAMBIAR CATEGORÍA
  // =========================================================

  const handleCambiarCategoria = async () => {

    const {
      value: nuevaCategoria
    } = await Swal.fire({
      title: 'Seleccioná nueva categoría',

      input: 'select',

      inputOptions: {
        perros: 'Perros',
        gatos: 'Gatos',
        plantas: 'Plantas',
        paisajes: 'Paisajes',
        aves: 'Aves'
      },

      inputPlaceholder:
        'Elegí una categoría',

      showCancelButton: true,

      confirmButtonText:
        'Cambiar',

      cancelButtonText:
        'Cancelar'
    });

    if (!nuevaCategoria) return;

    const { error } = await supabase
      .from('cards')
      .update({
        categoria: nuevaCategoria
      })
      .eq('id', carta.id);

    if (error) {

      console.error(
        'Error cambiando categoría:',
        error
      );

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar',
        text:
          'Ocurrió un error al cambiar la categoría.'
      });

      return;
    }

    setShowModal(false);

    if (onUpdate) {
      await onUpdate();
    }

    await Swal.fire({
      icon: 'success',
      title: '¡Cambiado!',
      text:
        'La categoría fue actualizada.',
      timer: 1600,
      showConfirmButton: false
    });
  };

  // =========================================================
  // OBTENER IMAGEN COMO FILE
  // =========================================================

  const obtenerArchivoCard = async () => {

    if (!carta.imagen_url) {
      throw new Error(
        'Esta card no tiene una imagen disponible.'
      );
    }

    const response = await fetch(
      carta.imagen_url
    );

    if (!response.ok) {
      throw new Error(
        'No pudimos preparar la imagen.'
      );
    }

    const blob = await response.blob();

    const extension =
      blob.type === 'image/jpeg'
        ? 'jpg'
        : 'png';

    return new File(
      [blob],
      `spotter-${carta.nombre || 'card'}.${extension}`,
      {
        type:
          blob.type ||
          'image/png'
      }
    );
  };

  // =========================================================
  // COMPARTIR CARD
  // =========================================================

  const handleCompartirCard = async () => {

    if (!window.isSecureContext) {

      await Swal.fire({
        icon: 'info',
        title:
          'Compartir no disponible',
        text:
          'La función Compartir Card necesita abrirse desde la versión HTTPS de Spotter.',
        confirmButtonText:
          'Entendido'
      });

      return;
    }

    if (!navigator.share) {

      await Swal.fire({
        icon: 'info',
        title:
          'Compartir no disponible',
        text:
          'Este navegador no permite abrir el menú nativo de compartir. Podés usar Descargar Card.',
        confirmButtonText:
          'Entendido'
      });

      return;
    }

    try {

      Swal.fire({
        title:
          'Preparando tu Spot...',
        allowOutsideClick:
          false,
        didOpen: () =>
          Swal.showLoading()
      });

      const file =
        await obtenerArchivoCard();

      Swal.close();

      const puedeCompartir =
        !navigator.canShare ||
        navigator.canShare({
          files: [file]
        });

      if (!puedeCompartir) {

        await Swal.fire({
          icon: 'info',
          title:
            'No se puede compartir directamente',
          text:
            'Tu navegador no permite compartir esta imagen como archivo. Podés descargarla y compartirla desde tu galería.',
          confirmButtonText:
            'Entendido'
        });

        return;
      }

      await navigator.share({
        title:
          `Mi Spot${
            carta.nombre
              ? ` - ${carta.nombre}`
              : ''
          }`,

        text:
          '📸 Mirá mi nuevo Spot',

        files: [file]
      });

    } catch (error) {

      Swal.close();

      if (
        error?.name ===
        'AbortError'
      ) {
        return;
      }

      console.error(
        'Error compartiendo:',
        error
      );

      await Swal.fire({
        icon: 'error',
        title:
          'No se pudo compartir',
        text:
          error?.message ||
          'No pudimos compartir tu Spot.'
      });
    }
  };

  // =========================================================
  // DESCARGAR CARD
  // =========================================================

  const handleDescargarParaCompartir = async () => {

    try {

      if (!carta.imagen_url) {
        throw new Error(
          'Esta card no tiene una imagen disponible.'
        );
      }

      Swal.fire({
        title:
          'Preparando descarga...',
        allowOutsideClick:
          false,
        didOpen: () =>
          Swal.showLoading()
      });

      const response = await fetch(
        carta.imagen_url
      );

      if (!response.ok) {
        throw new Error(
          'No pudimos descargar la imagen.'
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const extension =
        blob.type === 'image/jpeg'
          ? 'jpg'
          : 'png';

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `spotter-${carta.nombre || 'card'}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      Swal.close();

      await Swal.fire({
        title:
          '¡Card descargada!',
        text:
          'Ya se guardó en tu dispositivo.',
        icon: 'success',
        confirmButtonText:
          '¡Genial!'
      });

    } catch (error) {

      Swal.close();

      console.error(
        'Error descargando:',
        error
      );

      await Swal.fire({
        icon: 'error',
        title:
          'No se pudo descargar',
        text:
          error.message ||
          'Ocurrió un error.'
      });
    }
  };

  // =========================================================
  // COMPARTIR EN COMUNIDAD
  // =========================================================

  const handlePublicarEnComunidad = async () => {

    try {

      const result =
        await Swal.fire({
          title:
            '¿Compartir en Comunidad? 🌐',

          text:
            'Tu Spot será visible para los demás usuarios.',

          icon:
            'question',

          showCancelButton:
            true,

          confirmButtonText:
            'Sí, compartir',

          cancelButtonText:
            'Cancelar',

          confirmButtonColor:
            '#198754'
        });

      if (!result.isConfirmed) {
        return;
      }

      const { error } =
        await supabase
          .from('cards')
          .update({
            publica: true,
            is_public: true
          })
          .eq(
            'id',
            carta.id
          );

      if (error) {
        throw error;
      }

      setShowModal(false);

      if (onUpdate) {
        await onUpdate();
      }

      await Swal.fire({
        icon:
          'success',

        title:
          '¡Compartida! 🌐',

        text:
          'Tu Spot ya está disponible en la Comunidad.',

        timer:
          1800,

        showConfirmButton:
          false
      });

    } catch (error) {

      console.error(
        'Error compartiendo en comunidad:',
        error
      );

      await Swal.fire({
        icon:
          'error',

        title:
          'No se pudo compartir',

        text:
          'Ocurrió un error al compartir el Spot.'
      });
    }
  };

  // =========================================================
  // BORRAR
  // =========================================================

  const handleBorrar = async () => {
  const result = await Swal.fire({
    title: '¿Borrar Spot?',
    text: 'Esta acción eliminará el Spot de tu álbum.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: 'Borrando Spot...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // ==========================================
    // 1. BORRAR LIKES
    // ==========================================

    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .eq('card_id', carta.id);

    if (likesError) {
      console.error('Error borrando likes:', likesError);
      throw likesError;
    }

    // ==========================================
    // 2. BORRAR REPORTES
    // ==========================================

    const { error: reportsError } = await supabase
      .from('reports')
      .delete()
      .eq('card_id', carta.id);

    if (reportsError) {
      console.error('Error borrando reports:', reportsError);
      throw reportsError;
    }

    // ==========================================
    // 3. BORRAR RELACIÓN CON DESAFÍOS
    // ==========================================

    const { error: challengesError } = await supabase
      .from('user_challenges')
      .delete()
      .eq('card_id', carta.id);

    if (challengesError) {
      console.error(
        'Error borrando user_challenges:',
        challengesError
      );

      throw challengesError;
    }

    // ==========================================
    // 4. BORRAR CARD
    // ==========================================

    const { error: cardError } = await supabase
      .from('cards')
      .delete()
      .eq('id', carta.id);

    if (cardError) {
      console.error(
        'Error borrando card:',
        cardError
      );

      throw cardError;
    }

    Swal.close();

    setShowModal(false);

    if (onUpdate) {
      await onUpdate();
    }

    await Swal.fire({
      icon: 'success',
      title: 'Spot eliminado',
      text: 'La card fue eliminada de tu álbum.',
      timer: 1400,
      showConfirmButton: false
    });

  } catch (error) {
    Swal.close();

    console.error(
      'ERROR COMPLETO AL BORRAR:',
      error
    );

    await Swal.fire({
      icon: 'error',
      title: 'No se pudo borrar',
      text:
        error?.message ||
        'Hay información relacionada con esta card que impide eliminarla.'
    });
  }
};

  // =========================================================
  // DATOS SEGÚN CATEGORÍA
  // =========================================================

  const renderInformacion = () => {

    // PERROS / GATOS / AVES
    if (
      [
        'perros',
        'gatos',
        'aves'
      ].includes(
        carta.categoria
      )
    ) {
      return (
        <>
          <div className="spot-info-row">
            <span className="spot-info-icon">
              🐾
            </span>

            <div>
              <span className="spot-info-label">
                Raza / Especie
              </span>

              <strong>
                {carta.raza || '-'}
              </strong>
            </div>
          </div>

          <div className="spot-info-row">
            <span className="spot-info-icon">
              😊
            </span>

            <div>
              <span className="spot-info-label">
                Personalidad
              </span>

              <strong>
                {carta.personalidad || '-'}
              </strong>
            </div>
          </div>

          <div className="spot-info-row">
            <span className="spot-info-icon">
              💡
            </span>

            <div>
              <span className="spot-info-label">
                Fun Fact
              </span>

              <strong>
                {carta.dato || '-'}
              </strong>
            </div>
          </div>
        </>
      );
    }

    // PLANTAS
    if (
      carta.categoria ===
      'plantas'
    ) {
      return (
        <>
          <div className="spot-info-row">
            <span className="spot-info-icon">
              🌿
            </span>

            <div>
              <span className="spot-info-label">
                Especie
              </span>

              <strong>
                {carta.raza || '-'}
              </strong>
            </div>
          </div>

          <div className="spot-info-row">
            <span className="spot-info-icon">
              🍃
            </span>

            <div>
              <span className="spot-info-label">
                Rasgo destacado
              </span>

              <strong>
                {carta.caracteristica || '-'}
              </strong>
            </div>
          </div>

          <div className="spot-info-row">
            <span className="spot-info-icon">
              💡
            </span>

            <div>
              <span className="spot-info-label">
                Fun Fact
              </span>

              <strong>
                {carta.dato || '-'}
              </strong>
            </div>
          </div>
        </>
      );
    }

    // PAISAJES
    if (
      carta.categoria ===
      'paisajes'
    ) {
      return (
        <>
          <div className="spot-info-row">
            <span className="spot-info-icon">
              📍
            </span>

            <div>
              <span className="spot-info-label">
                Lugar
              </span>

              <strong>
                {carta.lugar || '-'}
              </strong>
            </div>
          </div>

          <div className="spot-info-row">
            <span className="spot-info-icon">
              💡
            </span>

            <div>
              <span className="spot-info-label">
                Fun Fact
              </span>

              <strong>
                {carta.dato || '-'}
              </strong>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  // =========================================================
  // VISTA
  // =========================================================

  return (
    <>

      {/* =====================================================
          CARD MINI DEL ÁLBUM
      ===================================================== */}

      <div className="album-card-block">

        <div
          onClick={() =>
            setShowModal(true)
          }
          style={{
            cursor: 'pointer'
          }}
        >

          <TradingCard
            datos={carta}
            likes={likesCount}
            showLikes={true}
          />

        </div>


        {/* ===================================================
            PUBLICAR DESDE GRID
        =================================================== */}

        {!carta.is_public ? (

          <button
            type="button"
            className="album-publish-btn"

            onClick={(e) => {
              e.stopPropagation();
              handlePublicarEnComunidad();
            }}
          >
            🌐 Compartir en Comunidad
          </button>

        ) : (

          <div className="album-published-status">
            ✅ Compartida
          </div>

        )}

      </div>


      {/* =====================================================
          MODAL INFORMACIÓN
      ===================================================== */}

      {showModal && (

        <div
          className="custom-modal-overlay"

          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="custom-modal-content spot-detail-modal"

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CERRAR */}

            <button
              type="button"
              className="spot-modal-close"

              onClick={() =>
                setShowModal(false)
              }
            >
              ✕
            </button>


            {/* ===============================================
                CARD IA
            =============================================== */}

            <div
              className="spot-modal-image-wrapper"

              onClick={() =>
                setShowFullImage(true)
              }
            >

              <img
                src={carta.imagen_url}
                alt={
                  carta.nombre ||
                  'Spot'
                }
                className="spot-modal-image"
              />

              <div className="spot-image-hint">
                🔍 Tocar para ampliar
              </div>

            </div>


            {/* ===============================================
                INFORMACIÓN REAL
            =============================================== */}

            <div className="spot-info-panel">

              <div className="spot-info-heading">

                <div>
                  <span className="spot-category-label">
                    {carta.categoria}
                  </span>

                  <h2>
                    {carta.nombre ||
                      'Sin nombre'}
                  </h2>
                </div>

                {likesCount > 0 && (
                  <div className="spot-modal-likes">
                    ❤️ {likesCount}
                  </div>
                )}

              </div>

              <div className="spot-info-content">
                {renderInformacion()}
              </div>

            </div>


            {/* ===============================================
                ACCIONES
            =============================================== */}

            <div className="d-grid gap-2 mt-3">

              <button
                type="button"
                className="btn btn-outline-primary fw-bold"
                onClick={handleEditar}
              >
                ✏️ Editar información
              </button>

              <button
                type="button"
                className="btn btn-outline-warning fw-bold"
                onClick={
                  handleCambiarCategoria
                }
              >
                📂 Cambiar Categoría
              </button>

              <button
                type="button"
                className="btn btn-primary fw-bold"
                onClick={
                  handleCompartirCard
                }
              >
                📤 Compartir Spot
              </button>

              <button
                type="button"
                className="btn btn-info text-white fw-bold"
                onClick={
                  handleDescargarParaCompartir
                }
              >
                📥 Descargar Spot
              </button>


              {!carta.is_public ? (

                <button
                  type="button"
                  className="btn btn-success fw-bold"
                  onClick={
                    handlePublicarEnComunidad
                  }
                >
                  🌐 Compartir en Comunidad
                </button>

              ) : (

                <div className="alert alert-success text-center fw-bold mb-0">
                  🌐 Compartida en Comunidad
                </div>

              )}


              <button
                type="button"
                className="btn btn-danger fw-bold"
                onClick={
                  handleBorrar
                }
              >
                🗑️ Borrar Spot
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          CARD A PANTALLA COMPLETA
      ===================================================== */}

      {showFullImage && (

        <div
          className="image-viewer-overlay"

          onClick={() =>
            setShowFullImage(false)
          }
        >

          <button
            type="button"
            className="image-close-btn"

            onClick={(e) => {
              e.stopPropagation();

              setShowFullImage(false);
            }}
          >
            ✕
          </button>

          <img
            src={carta.imagen_url}

            alt={
              carta.nombre ||
              'Spot'
            }

            className="image-viewer-full"

            onClick={(e) =>
              e.stopPropagation()
            }
          />

        </div>
      )}

    </>
  );
}

export default CardManager;