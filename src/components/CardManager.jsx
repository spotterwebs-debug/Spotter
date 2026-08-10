// src/components/CardManager.jsx

import React, { useState, useRef } from 'react';
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

  const [showModal, setShowModal] =
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
  // DESCARGAR CARD PARA COMPARTIR
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
              true
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
          'Ya se guardó en tu dispositivo. Subí la imagen a tus historias de Instagram o envíala por WhatsApp.',

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
  // PUBLICAR EN COMUNIDAD
  // ==========================================

  const handlePublicarEnComunidad = async () => {

    try {

      const result =
        await Swal.fire({

          title:
            '¿Publicar en Comunidad? 🌐',

          text:
            'Tu card será visible para los demás usuarios de Spotter.',

          icon:
            'question',

          showCancelButton:
            true,

          confirmButtonText:
            'Sí, publicar',

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


      setShowModal(false);


      await onUpdate();


      await Swal.fire({

        icon:
          'success',

        title:
          '¡Publicada! 🌐',

        text:
          'Tu card ya está disponible en la Comunidad Spotter.',

        timer:
          1800,

        showConfirmButton:
          false

      });


    } catch (error) {

      console.error(
        'Error publicando en comunidad:',
        error
      );


      Swal.fire({

        icon:
          'error',

        title:
          'No se pudo publicar',

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


    setShowModal(false);


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
            PUBLICAR DESDE LA CUADRÍCULA
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

            {/* CARD COMPLETA */}

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


              <button
                className="btn btn-outline-primary fw-bold"

                onClick={
                  handleEditar
                }
              >

                ✏️ Editar

              </button>


              <button
                className="btn btn-outline-warning fw-bold"

                onClick={
                  handleCambiarCategoria
                }
              >

                📂 Cambiar Categoría

              </button>


              <button
                className="btn btn-info text-white fw-bold"

                onClick={
                  handleDescargarParaCompartir
                }
              >

                📥 Descarga tu card para compartirla

              </button>


              {/* =================================
                  PUBLICAR EN COMUNIDAD
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


              {/* SI YA ESTÁ PUBLICADA */}

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