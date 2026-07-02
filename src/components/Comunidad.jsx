import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CategoryCarousel from './CategoryCarousel';
import "./Comunidad.css";

function Comunidad() {

  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

    const existe = likes.find(
      like =>
        like.card_id === cardId &&
        like.user_id === user.id
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
          user_id: user.id
        })
        .select()
        .single();

      if (!error && data) {
        setLikes(prev => [...prev, data]);
      }

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

  return (
    <div className="comunidad-page">

      <div className="container comunidad-content">

        <h2 className="comunidad-title">
          Comunidad Spotter
        </h2>

        <CategoryCarousel
          title="🐶 Perros"
          cards={categorias.perros}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          title="🐱 Gatos"
          cards={categorias.gatos}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          title="🌿 Plantas"
          cards={categorias.plantas}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
          title="🐦 Aves"
          cards={categorias.aves}
          likes={likes}
          user={user}
          onToggleLike={toggleLike}
        />

        <CategoryCarousel
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