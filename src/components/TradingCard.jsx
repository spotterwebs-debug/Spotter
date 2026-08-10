import React, { useState } from 'react';
import './TradingCard.css';

function TradingCard({
  datos,
  likes = 0,
  liked = false,
  onToggleLike,
  showLikes = true,
  enableImageZoom = false
}) {

  const [showImage, setShowImage] = useState(false);

  if (!datos) return null;

  const {
    nombre,
    categoria,
    imagen_url,
    raza,
    personalidad,
    caracteristica,
    lugar,
    dato
  } = datos;

  return (
    <>

      <div className="trading-card-final mx-auto shadow-lg mb-4">

        <div className="card-inner-border">


          {/* ==========================================
              ENCABEZADO
          ========================================== */}

          <div className="card-header-title d-flex justify-content-between px-2 py-1 bg-gradient-header align-items-center">

            <span className="fw-bold text-dark text-truncate">
              {nombre || 'Sin Nombre'}
            </span>

            <span className="badge bg-dark text-capitalize">
              {categoria}
            </span>

          </div>


          {/* ==========================================
              IMAGEN
          ========================================== */}

          <div
            className="card-image-box"

            onClick={(e) => {

              if (enableImageZoom && imagen_url) {

                e.stopPropagation();

                setShowImage(true);

              }

            }}

            style={{
              cursor:
                enableImageZoom && imagen_url
                  ? 'zoom-in'
                  : 'default'
            }}
          >

            {imagen_url ? (

              <img
                src={imagen_url}
                alt={nombre || 'Final'}
              />

            ) : (

              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white-50 small">
                Sin Imagen
              </div>

            )}


            {/* ==========================================
                LIKE FLOTANTE
            ========================================== */}

            {onToggleLike && (

              <button
                type="button"

                className={`like-btn-floating ${
                  liked ? 'liked' : ''
                }`}

                onClick={(e) => {

                  // Evita que al dar MG
                  // también se abra la imagen
                  e.stopPropagation();

                  onToggleLike(e);

                }}

                aria-label={
                  liked
                    ? 'Quitar Me Gusta'
                    : 'Dar Me Gusta'
                }
              >

                <span className="like-heart">
                  {liked ? '❤️' : '🤍'}
                </span>

                {showLikes && (

                  <span className="like-count">
                    {likes}
                  </span>

                )}

              </button>

            )}

          </div>


          {/* ==========================================
              INFORMACIÓN
          ========================================== */}

          <div className="card-info-box p-2 text-start text-dark">


            {/* PERROS / GATOS / AVES */}

            {['perros', 'gatos', 'aves'].includes(categoria) && (
              <>

                <p className="m-0 small">
                  <strong>Raza:</strong>{' '}
                  {raza || '-'}
                </p>

                <p className="m-0 small">
                  <strong>Carácter:</strong>{' '}
                  {personalidad || '-'}
                </p>

              </>
            )}


            {/* PLANTAS / PAISAJES */}

            {['plantas', 'paisajes'].includes(categoria) && (

              <p className="m-0 small">
                <strong>Ubicación:</strong>{' '}
                {lugar || '-'}
              </p>

            )}


            {/* PLANTAS */}

            {categoria === 'plantas' && (

              <p className="m-0 small">
                <strong>Detalle:</strong>{' '}
                {caracteristica || '-'}
              </p>

            )}


            {/* ==========================================
                DATO CURIOSO
            ========================================== */}

            <div className="card-dato-curioso mt-1 p-1 rounded">

              <p className="m-0 line-clamp">
                💡{' '}
                {dato ||
                  'Un espécimen único guardado en Spotter.'}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================================
          VISOR FOTO COMPLETA
      ========================================== */}

      {showImage && (

        <div
          className="image-viewer-overlay"

          onClick={() =>
            setShowImage(false)
          }
        >

          <button
            type="button"

            className="image-close-btn"

            onClick={() =>
              setShowImage(false)
            }
          >
            ✕
          </button>


          <img
            src={imagen_url}

            alt={nombre || 'Imagen'}

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

export default TradingCard;