import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

function LatestCaptures() {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Estado para el índice del mazo estilo swipe/carrusel de tarjetas
  const [currentIndex, setCurrentIndex] = useState(0);

  // Referencias para detectar el gesto táctil
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user || null);
    };

    const fetchLatest = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error al cargar las últimas capturas:", error);
        setCaptures([]);
      } else {
        setCaptures(data || []);
      }

      setLoading(false);
    };

    getSession();
    fetchLatest();
  }, []);

  // Funciones de navegación para el mazo
  const handleNext = () => {
    if (captures.length === 0) return;

    if (currentIndex < captures.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (captures.length === 0) return;

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(captures.length - 1);
    }
  };

  // ==========================
  // SWIPE CON EL DEDO
  // ==========================
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        Cargando lo más nuevo...
      </div>
    );
  }

  return (
    <section className="bg-light py-5 w-100">
      <div className="container-fluid px-4">

        <h2 className="h4 fw-bold mb-4 text-dark text-uppercase border-bottom pb-2">
          <i className="bi bi-clock-history me-2 text-danger"></i>
          Últimas Capturas
        </h2>

        {captures.length === 0 ? (
          <p className="text-muted">Aún no hay capturas para mostrar.</p>
        ) : (
          <div className="swipe-deck-wrapper position-relative d-flex flex-column align-items-center justify-content-center my-3">
            <div className="d-flex flex-column align-items-center w-100">

              <div
                className="deck-container position-relative my-2"
                style={{
                  minHeight: '340px',
                  width: '250px',
                  touchAction: 'pan-y'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >

                {captures.map((card, index) => {
                  const offset = index - currentIndex;

                  if (Math.abs(offset) > 2) return null;

                  return (
                    <div
                      key={card.id}
                      className={`swipe-card trading-card-final ${
                        index === currentIndex
                          ? 'active-card'
                          : 'stacked-card'
                      }`}
                      style={{
                        transform: `translateX(${offset * 15}px) translateY(${offset * 10}px) scale(${1 - Math.abs(offset) * 0.05})`,
                        zIndex: captures.length - Math.abs(offset),
                        opacity: Math.abs(offset) > 1 ? 0.4 : 1,
                        transition: 'all 0.3s ease-in-out',
                        position:
                          index === currentIndex
                            ? 'relative'
                            : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                      }}
                    >
                      <div className="card-inner-border">
                        <div className="card-image-box">
                          {card?.imagen_url ? (
                            <img
                              src={card.imagen_url}
                              alt={card.nombre || 'Tarjeta'}
                            />
                          ) : (
                            <div className="bg-secondary d-flex align-items-center justify-content-center h-100">
                              <span className="fs-1">🖼️</span>
                            </div>
                          )}
                        </div>

                        <div className="card-info-box p-2 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="mb-0 fw-bold text-dark text-truncate">
                              {card?.nombre || 'Sin nombre'}
                            </h6>

                            <p className="text-muted small mb-1 text-capitalize">
                              {card?.raza ||
                                card?.lugar ||
                                card?.caracteristica ||
                                card?.categoria}
                            </p>
                          </div>

                          <div className="border-top pt-1 mt-1 d-flex justify-content-between align-items-center">
                            <small
                              className="text-success fw-bold text-truncate"
                              style={{ fontSize: '0.7rem' }}
                            >
                              🌍 Comunidad
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
                            {/* Controles de deslizamiento */}
              <div className="d-flex gap-3 mt-3 align-items-center">
                <button
                  className="btn btn-outline-danger rounded-circle px-3 py-2 fw-bold shadow-sm"
                  onClick={handlePrev}
                >
                  ⬅️
                </button>

                <span className="text-dark fw-bold">
                  {currentIndex + 1} / {captures.length}
                </span>

                <button
                  className="btn btn-danger rounded-circle px-3 py-2 fw-bold shadow-sm"
                  onClick={handleNext}
                >
                  ➡️
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default LatestCaptures;