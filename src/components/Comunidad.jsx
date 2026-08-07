import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import CategoryCarousel from './CategoryCarousel';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "./Comunidad.css";

// Frases divertidas para la pantalla de carga
const MENSAJES_CARGA = [
  "Maquillando mascotas...",
  "Preparando las aves para la foto...",
  "Buscando los mejores paisajes...",
  "Acariciando a los gatitos...",
  "Ordenando el mazo de desafíos...",
  "Casi listo en la Comunidad Spotter..."
];

function Comunidad() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para la animación de carga divertida
  const [mensajeIndex, setMensajeIndex] = useState(0);
  const [progreso, setProgreso] = useState(10);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPremiosComunidad, setCardsPremiosComunidad] = useState([]);
  const [fotoEnGrande, setFotoEnGrande] = useState(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Efecto para rotar los mensajes y simular progreso mientras carga
  useEffect(() => {
    if (!loading) return;

    const intervaloMensaje = setInterval(() => {
      setMensajeIndex((prev) => (prev + 1) % MENSAJES_CARGA.length);
    }, 1500);

    const intervaloProgreso = setInterval(() => {
      setProgreso((prev) => (prev < 90 ? prev + 10 : prev));
    }, 400);

    return () => {
      clearInterval(intervaloMensaje);
      clearInterval(intervaloProgreso);
    };
  }, [loading]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setProgreso(10);

    try {
      const [
        authResponse,
        cardsResponse,
        likesResponse,
        premiosResponse
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("cards")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("likes")
          .select("*"),
        supabase
          .from('user_challenges')
          .select(`
            card:card_id (*),
            challenge:challenge_id (
              titulo,
              descripcion
            )
          `)
          .limit(30)
      ]);

      setUser(authResponse.data?.user || null);

      if (!cardsResponse.error) {
        setPosts(cardsResponse.data || []);
      }

      if (!likesResponse.error) {
        setLikes(likesResponse.data || []);
      }

      if (!premiosResponse.error && premiosResponse.data) {
        const unicasCards = [];
        const idsVistos = new Set();
        
        premiosResponse.data.forEach(item => {
          if (item.card && item.card.is_public && !idsVistos.has(item.card.id)) {
            idsVistos.add(item.card.id);
            unicasCards.push({
              ...item.card,
              consigna: item.challenge?.titulo || item.challenge?.descripcion || "Desafío completado"
            });
          }
        });

        setCardsPremiosComunidad(unicasCards);
      }

    } catch (error) {
      console.error("Error cargando datos de la comunidad:", error);
    } finally {
      setProgreso(100);
      setTimeout(() => setLoading(false), 300);
    }
  };

  const toggleLike = async (cardId) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: '¡Acceso denegado!',
        text: 'Debes iniciar sesión para dar Me Gusta.',
        confirmButtonText: 'Iniciar sesión',
        confirmButtonColor: '#ffc107',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    const existe = likes.find(
      like =>
        like.card_id == cardId &&
        like.user_id == user?.id
    );

    if (existe) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existe.id);

      if (!error) {
        setLikes(prev =>
          prev.filter(like => like.id !== existe.id)
        );
      }
    } else {
      const { data, error } = await supabase
        .from("likes")
        .insert({
          card_id: cardId,
          user_id: user?.id
        })
        .select()
        .single();

      if (!error && data) {
        setLikes(prev => [...prev, data]);
      }
    }
  };

  const handleNext = () => {
    if (cardsPremiosComunidad.length === 0) return;
    if (currentIndex < cardsPremiosComunidad.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (cardsPremiosComunidad.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(cardsPremiosComunidad.length - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    touchEndX.current = e.clientX;
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <div className="comunidad-loading-container">
        <div className="comunidad-loading-box">
          <h3 className="mb-3 text-white">🐾 Spotter</h3>
          <p className="loading-phrase">{MENSAJES_CARGA[mensajeIndex]}</p>
          <div className="progress-bar-custom">
            <div className="progress-fill" style={{ width: `${progreso}%` }}></div>
          </div>
          <small className="text-muted mt-3 d-block">{progreso}%</small>
        </div>
      </div>
    );
  }

  const categorias = {
    perros: posts.filter(post => post.categoria === "perros"),
    gatos: posts.filter(post => post.categoria === "gatos"),
    plantas: posts.filter(post => post.categoria === "plantas"),
    aves: posts.filter(post => post.categoria === "aves"),
    paisajes: posts.filter(post => post.categoria === "paisajes")
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="comunidad-page">
      <div className="container comunidad-content">

        <h2 className="comunidad-title">
          Comunidad Spotter
        </h2>

        <div className="swipe-deck-wrapper position-relative d-flex flex-column align-items-center justify-content-center mb-5">
          <h4 className="mb-3 text-white">✨ ¡Mazo de desafíos de la comunidad!</h4>
          
          {cardsPremiosComunidad.length > 0 ? (
            <div className="d-flex flex-column align-items-center w-100">
              <div 
                className="deck-container position-relative my-2" 
                style={{ minHeight: '340px', width: '250px', touchAction: 'pan-y' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                {cardsPremiosComunidad.map((card, index) => {
                  const offset = index - currentIndex;
                  if (Math.abs(offset) > 2) return null;

                  const isLiked = likes.some(l => l.card_id === card.id && l.user_id === user?.id);

                  return (
                    <div 
                      key={card.id}
                      className={`swipe-card trading-card-final ${index === currentIndex ? 'active-card' : 'stacked-card'}`}
                      style={{
                        transform: `translateX(${offset * 15}px) translateY(${offset * 10}px) scale(${1 - Math.abs(offset) * 0.05})`,
                        zIndex: cardsPremiosComunidad.length - Math.abs(offset),
                        opacity: Math.abs(offset) > 1 ? 0.4 : 1,
                        transition: 'all 0.3s ease-in-out',
                        position: index === currentIndex ? 'relative' : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        cursor: 'grab'
                      }}
                    >
                      <div className="card-inner-border">
                        <div 
                          className="card-image-box"
                          style={{ cursor: card?.imagen_url ? 'pointer' : 'default' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (card?.imagen_url) {
                              setFotoEnGrande(card.imagen_url);
                            }
                          }}
                          title="Click para ver la foto en grande"
                        >
                          {card?.imagen_url ? (
                            <img src={card.imagen_url} alt={card.nombre || 'Tarjeta'} />
                          ) : (
                            <div className="bg-secondary d-flex align-items-center justify-content-center h-100">
                              <span className="fs-1">🖼️</span>
                            </div>
                          )}
                        </div>
                        <div className="card-info-box p-2 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="mb-0 fw-bold text-dark text-truncate">{card?.nombre || 'Sin nombre'}</h6>
                            <p className="text-muted small mb-1 text-capitalize">
                              {card?.raza || card?.lugar || card?.caracteristica || card?.categoria}
                            </p>
                            <div className="bg-light p-1 rounded mt-1 border" style={{ fontSize: '0.65rem' }}>
                              <span className="fw-bold text-dark">Consigna: </span>
                              <span className="text-muted text-truncate d-inline-block w-100" style={{ verticalAlign: 'middle' }}>
                                {card.consigna}
                              </span>
                            </div>
                          </div>
                          <div className="border-top pt-1 mt-1 d-flex justify-content-between align-items-center">
                            <small className="text-warning fw-bold text-truncate" style={{ fontSize: '0.7rem' }}>
                              🎖️ Premio Desafío
                            </small>
                            <button 
                              className="btn btn-sm p-0 border-0 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(card.id);
                              }}
                              style={{ fontSize: '1rem' }}
                            >
                              {isLiked ? '❤️' : '🤍'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex gap-3 mt-3 align-items-center">
                <button 
                  className="btn btn-outline-warning rounded-circle px-3 py-2 fw-bold"
                  onClick={handlePrev}
                >
                  ⬅️
                </button>
                <span className="text-white fw-bold">
                  {currentIndex + 1} / {cardsPremiosComunidad.length}
                </span>
                <button 
                  className="btn btn-warning rounded-circle px-3 py-2 fw-bold"
                  onClick={handleNext}
                >
                  ➡️
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted">No hay premios de desafíos compartidos en este momento.</p>
          )}
        </div>

        <div className="community-nav">
          <button className="cat-perros" onClick={() => scrollTo("perros")}>🐶 Perros</button>
          <button className="cat-gatos" onClick={() => scrollTo("gatos")}>🐱 Gatos</button>
          <button className="cat-plantas" onClick={() => scrollTo("plantas")}>🌿 Plantas</button>
          <button className="cat-aves" onClick={() => scrollTo("aves")}>🐦 Aves</button>
          <button className="cat-paisajes" onClick={() => scrollTo("paisajes")}>🏞️ Paisajes</button>
        </div>

        <CategoryCarousel
          id="perros"
          title="🐶 Perros"
          cards={categorias.perros}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
          onImageClick={(url) => setFotoEnGrande(url)}
        />

        <CategoryCarousel
          id="gatos"
          title="🐱 Gatos"
          cards={categorias.gatos}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
          onImageClick={(url) => setFotoEnGrande(url)}
        />

        <CategoryCarousel
          id="plantas"
          title="🌿 Plantas"
          cards={categorias.plantas}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
          onImageClick={(url) => setFotoEnGrande(url)}
        />

        <CategoryCarousel
          id="aves"
          title="🐦 Aves"
          cards={categorias.aves}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
          onImageClick={(url) => setFotoEnGrande(url)}
        />

        <CategoryCarousel
          id="paisajes"
          title="🏞️ Paisajes"
          cards={categorias.paisajes}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
          onImageClick={(url) => setFotoEnGrande(url)}
        />

      </div>

      {fotoEnGrande && (
        <div 
          className="modal-foto-grande position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9999, cursor: 'zoom-out' }}
          onClick={() => setFotoEnGrande(null)}
        >
          <div className="position-relative p-2 text-center" onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn btn-dark position-absolute top-0 end-0 m-3 rounded-circle"
              onClick={() => setFotoEnGrande(null)}
              style={{ width: '40px', height: '40px', fontSize: '1.2rem', zIndex: 10000 }}
            >
              ✕
            </button>
            <img 
              src={fotoEnGrande} 
              alt="Foto en grande" 
              className="img-fluid rounded shadow-lg"
              style={{ maxHeight: '85vh', maxWidth: '90vw', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Comunidad;