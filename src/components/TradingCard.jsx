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
    imagen_url
  } = datos;

  return (
    <>
      {/* =====================================================
          CARD IA
      ===================================================== */}

      <div className="trading-card-final mx-auto shadow-lg mb-4">

        <div
          className="card-image-box card-image-box-full"
          onClick={(e) => {
            if (
              enableImageZoom &&
              imagen_url
            ) {
              e.stopPropagation();
              setShowImage(true);
            }
          }}
          style={{
            cursor:
              enableImageZoom &&
              imagen_url
                ? 'zoom-in'
                : 'pointer'
          }}
        >

          {imagen_url ? (
            <img
              src={imagen_url}
              alt={
                nombre ||
                'Trading Card Spotter'
              }
              className="trading-card-ai-image"
            />
          ) : (
            <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white-50 small">
              Sin imagen
            </div>
          )}


          {/* =================================================
              LIKE
          ================================================= */}

          {onToggleLike && (
            <button
              type="button"
              className={`like-btn-floating ${
                liked
                  ? 'liked'
                  : ''
              }`}
              onClick={(e) => {
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
                {liked
                  ? '❤️'
                  : '🤍'}
              </span>

              {showLikes && (
                <span className="like-count">
                  {likes}
                </span>
              )}

            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          VISOR GRANDE
      ===================================================== */}

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
            onClick={(e) => {
              e.stopPropagation();
              setShowImage(false);
            }}
          >
            ✕
          </button>

          <img
            src={imagen_url}
            alt={
              nombre ||
              'Trading Card Spotter'
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

export default TradingCard;