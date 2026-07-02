import React from 'react';
import './TradingCard.css';

function TradingCard({ datos, likes = 0, liked = false, onToggleLike, showLikes = true }) {

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
    <div className="trading-card-final mx-auto shadow-lg mb-4">
      <div className="card-inner-border">

        {/* ENCABEZADO */}
        <div className="card-header-title d-flex justify-content-between px-2 py-1 bg-gradient-header align-items-center">
          <span className="fw-bold text-dark text-truncate">
            {nombre || 'Sin Nombre'}
          </span>
          <span className="badge bg-dark text-capitalize">
            {categoria}
          </span>
        </div>

        {/* IMAGEN VENTANA */}
        <div className="card-image-box">
          {imagen_url ? (
            <img src={imagen_url} alt={nombre || 'Final'} />
          ) : (
            <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white-50 small">
              Sin Imagen
            </div>
          )}
        </div>

        {/* INFORMACIÓN DINÁMICA */}
        <div className="card-info-box p-2 text-start text-dark">

          {['perros', 'gatos', 'aves'].includes(categoria) && (
            <>
              <p className="m-0 small">
                <strong>Raza:</strong> {raza || '-'}
              </p>
              <p className="m-0 small">
                <strong>Carácter:</strong> {personalidad || '-'}
              </p>
            </>
          )}

          {['plantas', 'paisajes'].includes(categoria) && (
            <p className="m-0 small">
              <strong>Ubicación:</strong> {lugar || '-'}
            </p>
          )}

          {categoria === 'plantas' && (
            <p className="m-0 small">
              <strong>Detalle:</strong> {caracteristica || '-'}
            </p>
          )}

          {/* DATO CURIOSO */}
          <div className="card-dato-curioso mt-1 p-1 rounded">
            <p className="m-0 line-clamp">
              💡 {dato || 'Un espécimen único guardado en Spotter.'}
            </p>
          </div>

        </div>

        {/* BOTÓN ME GUSTA */}
        <div className="card-actions d-flex justify-content-end align-items-center px-2 py-2">

      
 <button
  className={`like-btn ${liked ? "liked" : ""}`}
  onClick={onToggleLike}
>
  {liked ? "❤️" : "🤍"}

  {showLikes && (
    <span className="like-count">
      {likes}
    </span>
  )}
</button>



        </div>

      </div>
    </div>
  );
}

export default TradingCard;