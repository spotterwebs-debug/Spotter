import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CategoryCarousel from './CategoryCarousel';
import "./Comunidad.css";

function Comunidad() {

  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el índice del mazo estilo swipe/carrusel de tarjetas
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    // Usuario logueado
    const {
      data: { user }
    } = await supabase.auth.getUser();

    setUser(user);

    // Cards
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPosts(cards || []);
    }

    // Likes
    const { data: likesData } = await supabase
      .from("likes")
      .select("*");

    setLikes(likesData || []);

    setLoading(false);
  };

  const toggleLike = async (cardId) => {

  if (!user) return;

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

  // Funciones de navegación para el mazo swipe de tarjetas
  const handleNext = () => {
    if (posts.length === 0) return;
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Vuelve al inicio del mazo
    }
  };

  const handlePrev = () => {
    if (posts.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(posts.length - 1); // Va al final del mazo
    }
  };

  if (loading) {
    return (
      <div className="comunidad-loading">
        Cargando comunidad...
      </div>
    );
  }

  // Agrupar cards por categoría
  const categorias = {
    perros: posts.filter(post => post.categoria === "perros"),
    gatos: posts.filter(post => post.categoria === "gatos"),
    plantas: posts.filter(post => post.categoria === "plantas"),
    aves: posts.filter(post => post.categoria === "aves"),
    paisajes: posts.filter(post => post.categoria === "paisajes")
  };

  // Scroll a la categoría
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

        {/* =========================================================
            NUEVO: Mazo de Figuritas / Swipe Deck de la Comunidad
        ========================================================= */}
        <div className="swipe-deck-wrapper position-relative d-flex flex-column align-items-center justify-content-center mb-5">
          <h4 className="mb-3 text-white">✨ Mazo de desafios!</h4>
          
          {posts.length > 0 ? (
            <div className="d-flex flex-column align-items-center w-100">
              <div className="deck-container position-relative my-2" style={{ minHeight: '320px', width: '250px' }}>
                {posts.map((card, index) => {
                  const offset = index - currentIndex;
                  if (Math.abs(offset) > 2) return null;

                  const isLiked = likes.some(l => l.card_id === card.id && l.user_id === user?.id);

                  return (
                    <div 
                      key={card.id}
                      className={`swipe-card trading-card-final ${index === currentIndex ? 'active-card' : 'stacked-card'}`}
                      style={{
                        transform: `translateX(${offset * 15}px) translateY(${offset * 10}px) scale(${1 - Math.abs(offset) * 0.05})`,
                        zIndex: posts.length - Math.abs(offset),
                        opacity: Math.abs(offset) > 1 ? 0.4 : 1,
                        transition: 'all 0.3s ease-in-out',
                        position: index === currentIndex ? 'relative' : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%'
                      }}
                    >
                      <div className="card-inner-border">
                        <div className="card-image-box">
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
                          </div>
                          <div className="border-top pt-1 mt-1 d-flex justify-content-between align-items-center">
                            <small className="text-success fw-bold text-truncate" style={{ fontSize: '0.7rem' }}>
                              🌍 Comunidad
                            </small>
                            <button 
                              className="btn btn-sm p-0 border-0 bg-transparent"
                              onClick={() => toggleLike(card.id)}
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

              {/* Controles de deslizamiento */}
              <div className="d-flex gap-3 mt-3 align-items-center">
                <button 
                  className="btn btn-outline-warning rounded-circle px-3 py-2 fw-bold"
                  onClick={handlePrev}
                >
                  ⬅️
                </button>
                <span className="text-white fw-bold">
                  {currentIndex + 1} / {posts.length}
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
            <p className="text-muted">No hay figuras públicas disponibles en este momento.</p>
          )}
        </div>
        {/* ========================================================= */}

        <div className="community-nav">

          <button className="cat-perros" onClick={() => scrollTo("perros")}>
            🐶 Perros
          </button>

          <button className="cat-gatos" onClick={() => scrollTo("gatos")}>
            🐱 Gatos
          </button>

          <button className="cat-plantas" onClick={() => scrollTo("plantas")}>
            🌿 Plantas
          </button>

          <button className="cat-aves" onClick={() => scrollTo("aves")}>
            🐦 Aves
          </button>

          <button className="cat-paisajes" onClick={() => scrollTo("paisajes")}>
            🏞️ Paisajes
          </button>

        </div>

        <CategoryCarousel
          id="perros"
          title="🐶 Perros"
          cards={categorias.perros}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          id="gatos"
          title="🐱 Gatos"
          cards={categorias.gatos}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          id="plantas"
          title="🌿 Plantas"
          cards={categorias.plantas}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          id="aves"
          title="🐦 Aves"
          cards={categorias.aves}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          id="paisajes"
          title="🏞️ Paisajes"
          cards={categorias.paisajes}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

      </div>

    </div>
  );
}

export default Comunidad;