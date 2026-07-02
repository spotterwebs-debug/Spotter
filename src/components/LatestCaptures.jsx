import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TradingCard from './TradingCard';

function LatestCaptures() {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  if (loading) {
    return (
      <div className="text-center py-5">
        Cargando lo más nuevo...
      </div>
    );
  }

  return (
    <section className="bg-light py-5">
      <div className="container">

        <h2 className="h4 fw-bold mb-4 text-dark text-uppercase border-bottom pb-2">
          <i className="bi bi-clock-history me-2 text-danger"></i>
          Últimas Capturas
        </h2>

        {captures.length === 0 ? (
          <p>Aún no hay capturas para mostrar.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {captures.map((cap) => (
              <div key={cap.id} className="col d-flex justify-content-center">
                <TradingCard
                  data={cap}
                  userId={user?.id}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default LatestCaptures;