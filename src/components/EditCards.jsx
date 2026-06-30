// src/pages/EditCards.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CardCreator from '../components/CardCreator';

function EditCards() {
  const { id } = useParams();
  const [carta, setCarta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarta = async () => {
      const { data } = await supabase.from('cards').select('*').eq('id', id).single();
      setCarta(data);
    };
    fetchCarta();
  }, [id]);

  if (!carta) return <div className="text-center mt-5 text-white">Cargando editor...</div>;

  return (
    <CardCreator 
      cardToEdit={carta} 
      // Al cancelar o guardar, volvemos a la categoría del álbum de la carta
      onCancel={() => navigate(`/album/${carta.categoria}`)} 
    />
  );
}

export default EditCards;