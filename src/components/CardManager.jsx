// src/components/CardManager.jsx

import React, {
  useState,
  useRef,
  useEffect
} from 'react';

import { useNavigate } from 'react-router-dom';
import TradingCard from './TradingCard';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import { toPng } from 'html-to-image';

function CardManager({
  carta,
  onUpdate,
  likesCount = 0
}) {

  // ==========================================
  // ESTADOS
  // ==========================================

  const [showModal, setShowModal] =
    useState(false);

  const [shareFile, setShareFile] =
    useState(null);

  const [shareReady, setShareReady] =
    useState(false);

  const [preparingShare, setPreparingShare] =
    useState(false);

  const cardRef =
    useRef(null);

  const navigate =
    useNavigate();


  // ==========================================
  // EDITAR CARD
  // ==========================================

  const handleEditar = () => {

    navigate(
      `/edit/${carta.id}`
    );

  };


  // ==========================================
  // CAMBIAR CATEGORÍA
  // ==========================================

  const handleCambiarCategoria = async () => {

    const {
      value: nuevaCategoria
    } = await Swal.fire({

      title:
        'Selecciona nueva categoría',

      input:
        'select',

      inputOptions: {
        perros:
          'Perros',

        gatos:
          'Gatos',

        plantas:
          'Plantas',

        paisajes:
          'Paisajes',

        aves:
          'Aves'
      },

      inputPlaceholder:
        'Elige una categoría',

      showCancelButton:
        true,

      confirmButtonText:
        'Cambiar',

      cancelButtonText:
        'Cancelar'

    });


    if (!nuevaCategoria) {
      return;
    }


    const { error } =
      await supabase
        .from('cards')
        .update({
          categoria:
            nuevaCategoria
        })
        .eq(
          'id',
          carta.id
        );


    if (error) {

      console.error(
        'Error cambiando categoría:',
        error
      );


      Swal.fire({

        icon:
          'error',

        title:
          'No se pudo cambiar',

        text:
          'Ocurrió un error al cambiar la categoría.'

      });


      return;
    }


    setShowModal(false);


    await onUpdate();


    Swal.fire({

      icon:
        'success',

      title:
        '¡Cambiado!',

      text:
        'La categoría fue actualizada.',

      timer:
        1600,

      showConfirmButton:
        false

    });

  };


  // ==========================================
  // PREPARAR CARD PARA COMPARTIR
  // ==========================================

  useEffect(() => {

    let cancelado = false;


    const prepararCard = async () => {

      if (!showModal) {

        setShareFile(null);
        setShareReady(false);
        setPreparingShare(false);

        return;
      }


      try {

        setPreparingShare(true);
        setShareReady(false);
        setShareFile(null);


        // Esperamos dos frames para asegurar
        // que la card completa esté renderizada.
        await new Promise((resolve) => {

          requestAnimationFrame(() => {

            requestAnimationFrame(
              resolve
            );

          });

        });


        if (
          cancelado ||
          !cardRef.current
        ) {
          return;
        }


        // ======================================
        // CONVERTIR CARD A PNG
        // ======================================

        const dataUrl =
          await toPng(
            cardRef.current,
            {
              cacheBust:
                true,

              pixelRatio:
                2
            }
          );


        if (cancelado) {
          return;
        }


        // ======================================
        // CONVERTIR PNG A FILE
        // ======================================

        const response =
          await fetch(
            dataUrl
          );


        const blob =
          await response.blob();


        const file =
          new File(
            [blob],

            `spotter-${carta.nombre || 'card'}.png`,

            {
              type:
                'image/png'
            }
          );


        if (cancelado) {
          return;
        }


        setShareFile(
          file
        );

        setShareReady(
          true
        );


      } catch (error) {

        console.error(
          'Error preparando card para compartir:',
          error
        );


        setShareFile(
          null
        );

        setShareReady(
          false
        );


      } finally {

        if (!cancelado) {

          setPreparingShare(
            false
          );

        }

      }

    };


    prepararCard();


    return () => {

      cancelado =
        true;

    };

  }, [
    showModal,
    carta.id,
    carta.nombre
  ]);


  // ==========================================
  // COMPARTIR CARD NATIVAMENTE
  // ==========================================

  const handleCompartirCard = async () => {

    // ========================================
    // CARD TODAVÍA NO PREPARADA
    // ========================================

    if (
      !shareReady ||
      !shareFile
    ) {

      await Swal.fire({

        icon:
          'info',

        title:
          'Preparando tu Card',

        text:
          'Esperá un instante y volvé a tocar Compartir Card.',

        timer:
          1500,

        showConfirmButton:
          false

      });


      return;
    }


    // ========================================
    // CONTEXTO NO SEGURO
    // ========================================

    if (!window.isSecureContext) {

      await Swal.fire({

        icon:
          'info',

        title:
          'Compartir no disponible',

        text:
          'La función Compartir Card necesita abrirse desde la versión segura HTTPS de Spotter.',

        confirmButtonText:
          'Entendido'

      });


      return;
    }


    // ========================================
    // NAVEGADOR SIN WEB SHARE
    // ========================================

    if (!navigator.share) {

      await Swal.fire({

        icon:
          'info',

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

      const puedeCompartirArchivo =
        !navigator.canShare ||
        navigator.canShare({
          files:
            [shareFile]
        });


      // ======================================
      // EL NAVEGADOR NO ACEPTA ARCHIVOS
      // ======================================

      if (!puedeCompartirArchivo) {

        await Swal.fire({

          icon:
            'info',

          title:
            'No se puede compartir esta imagen directamente',

          html: `
            <p>
              Tu navegador no permite enviar la Card
              como archivo desde Spotter.
            </p>

            <p>
              Probá abrir Spotter directamente en
              <strong>Chrome o Safari</strong>.
            </p>

            <p>
              También podés usar
              <strong>📥 Descargar Card</strong>.
            </p>
          `,

          confirmButtonText:
            'Entendido'

        });


        return;
      }


      // ======================================
      // ABRIR MENÚ NATIVO
      // ======================================

      await navigator.share({

        title:
          `Mi Card Spotter${
            carta.nombre
              ? ` - ${carta.nombre}`
              : ''
          }`,

        text:
          '📸 Mirá mi nueva Card de Spotter',

        files:
          [shareFile]

      });


    } catch (error) {

      // El usuario simplemente cerró
      // el menú de compartir.
      if (
        error?.name ===
        'AbortError'
      ) {

        return;

      }


      console.error(
        'Error navigator.share:',
        error
      );


      await Swal.fire({

        icon:
          'error',

        title:
          'No se pudo compartir',

        text:
          error?.message ||
          'El navegador no pudo abrir el menú para compartir la Card.'

      });

    }

  };


  // ==========================================
  // DESCARGAR CARD
  // ==========================================

  const handleDescargarParaCompartir = async () => {

    if (
      cardRef.current === null
    ) {

      Swal.fire(
        'Error',
        'No se pudo capturar la carta',
        'error'
      );


      return;
    }


    try {

      const dataUrl =
        await toPng(
          cardRef.current,
          {
            cacheBust:
              true,

            pixelRatio:
              2
          }
        );


      const link =
        document.createElement(
          'a'
        );


      link.download =
        `spotter-${carta.nombre || 'carta'}.png`;


      link.href =
        dataUrl;


      link.click();


      Swal.fire({

        title:
          '¡Card descargada!',

        text:
          'Ya se guardó en tu dispositivo. Podés compartirla desde tu galería.',

        icon:
          'success',

        confirmButtonText:
          '¡Genial!'

      });


    } catch (err) {

      console.error(
        'Error al generar la imagen:',
        err
      );


      Swal.fire(

        'Error',

        'No se pudo descargar la imagen',

        'error'

      );

    }

  };


  // ==========================================
  // COMPARTIR EN COMUNIDAD
  // ==========================================

  const handlePublicarEnComunidad = async () => {

    try {

      const result =
        await Swal.fire({

          title:
            '¿Compartir en Comunidad? 🌐',

          text:
            'Tu card será visible para los demás usuarios de Spotter.',

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

            publica:
              true,

            is_public:
              true

          })
          .eq(
            'id',
            carta.id
          );


      if (error) {
        throw error;
      }


      setShowModal(
        false
      );


      await onUpdate();


      await Swal.fire({

        icon:
          'success',

        title:
          '¡Compartida! 🌐',

        text:
          'Tu card ya está disponible en la Comunidad Spotter.',

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


      Swal.fire({

        icon:
          'error',

        title:
          'No se pudo compartir',

        text:
          'Ocurrió un error al compartir la card en la comunidad.'

      });

    }

  };


  // ==========================================
  // BORRAR CARD
  // ==========================================

  const handleBorrar = async () => {

    const result =
      await Swal.fire({

        title:
          '¿Borrar?',

        text:
          'Esta acción eliminará la card de tu álbum.',

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Sí, borrar',

        cancelButtonText:
          'Cancelar',

        confirmButtonColor:
          '#dc3545'

      });


    if (!result.isConfirmed) {
      return;
    }


    const { error } =
      await supabase
        .from('cards')
        .delete()
        .eq(
          'id',
          carta.id
        );


    if (error) {

      console.error(
        'Error borrando card:',
        error
      );


      Swal.fire({

        icon:
          'error',

        title:
          'No se pudo borrar',

        text:
          'Ocurrió un error al eliminar la card.'

      });


      return;
    }


    setShowModal(
      false
    );


    await onUpdate();


    Swal.fire({

      icon:
        'success',

      title:
        'Card eliminada',

      timer:
        1400,

      showConfirmButton:
        false

    });

  };


  // ==========================================
  // VISTA
  // ==========================================

  return (

    <>

      {/* ======================================
          CARD MINI DEL ÁLBUM
      ====================================== */}

      <div className="album-card-block">


        <div

          onClick={() =>
            setShowModal(true)
          }

          style={{
            cursor:
              'pointer'
          }}
        >

          <TradingCard

            datos={
              carta
            }

            likes={
              likesCount
            }

            compact={
              true
            }

            showLikes={
              true
            }

          />

        </div>


        {/* ======================================
            COMPARTIR EN COMUNIDAD DESDE GRID
        ====================================== */}

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


      {/* ======================================
          MODAL
      ====================================== */}

      {showModal && (

        <div

          className="custom-modal-overlay"

          onClick={() =>
            setShowModal(false)
          }
        >

          <div

            className="custom-modal-content"

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================
                CARD COMPLETA
            ================================= */}

            <div

              ref={
                cardRef
              }

              className="modal-card-wrapper full-card"
            >

              <TradingCard

                datos={
                  carta
                }

                likes={
                  likesCount
                }

                showLikes={
                  true
                }

                enableImageZoom={
                  true
                }

              />

            </div>


            {/* =================================
                BOTONES
            ================================= */}

            <div className="d-grid gap-2 mt-3">


              {/* EDITAR */}

              <button

                className="btn btn-outline-primary fw-bold"

                onClick={
                  handleEditar
                }
              >

                ✏️ Editar

              </button>


              {/* CAMBIAR CATEGORÍA */}

              <button

                className="btn btn-outline-warning fw-bold"

                onClick={
                  handleCambiarCategoria
                }
              >

                📂 Cambiar Categoría

              </button>


              {/* =================================
                  COMPARTIR CARD
              ================================= */}

              <button

                type="button"

                className="btn btn-primary fw-bold"

                onClick={
                  handleCompartirCard
                }

                disabled={
                  preparingShare ||
                  !shareReady
                }
              >

                {preparingShare
                  ? '⏳ Preparando Card...'
                  : '📤 Compartir Card'
                }

              </button>


              {/* =================================
                  DESCARGAR CARD
              ================================= */}

              <button

                type="button"

                className="btn btn-info text-white fw-bold"

                onClick={
                  handleDescargarParaCompartir
                }
              >

                📥 Descargar Card

              </button>


              {/* =================================
                  COMPARTIR EN COMUNIDAD
              ================================= */}

              {!carta.is_public && (

                <button

                  className="btn btn-success fw-bold"

                  onClick={
                    handlePublicarEnComunidad
                  }
                >

                  🌐 Compartir en Comunidad

                </button>

              )}


              {/* =================================
                  YA COMPARTIDA
              ================================= */}

              {carta.is_public && (

                <div
                  className="alert alert-success text-center fw-bold mb-0"
                >

                  🌐 Compartida en Comunidad

                </div>

              )}


              {/* =================================
                  BORRAR
              ================================= */}

              <button

                className="btn btn-danger fw-bold"

                onClick={
                  handleBorrar
                }
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