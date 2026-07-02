import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import TradingCard from './TradingCard'; 
function Comunidad() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error al cargar el muro:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-white text-center mt-5">Cargando comunidad...</div>;

  return (
    <div className="container py-4">
      <h2 className="text-white mb-4">Comunidad Spotter</h2>
      
      
      <div className="row g-4 justify-content-center">
        {posts.map((post) => (
          
          <div key={post.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
            <TradingCard datos={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comunidad;