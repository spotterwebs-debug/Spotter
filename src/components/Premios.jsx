import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import "./Premios.css";

const Premios = () => {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremios = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Sintaxis segura para el Join en Supabase especificando la relación por foreign key
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          completed_at,
          challenges:challenge_id (titulo, liston_color, categoria)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error al cargar premios:", error);
      } else {
        setPremios(data || []);
      }
      
      setLoading(false);
    };

    fetchPremios();
  }, []);

  if (loading) return <div className="text-center py-5 text-white">Cargando tus premios...</div>;

  return (
    <div className="premios-container py-5 text-white">
      <h2>Mis Logros y Listones</h2>
      
      <div className="listones-grid">
        {premios.length > 0 ? (
          premios.map((p, index) => (
            <div key={index} className="liston-card">
              <div className="liston-icono">🎖️</div>
              <p className="liston-titulo">{p.challenges?.titulo || 'Desafío completado'}</p>
              {p.challenges?.categoria && (
                <span className="badge bg-secondary text-capitalize">{p.challenges.categoria}</span>
              )}
            </div>
          ))
        ) : (
          <p>Aún no tienes listones. ¡Participa en los desafíos de tus categorías!</p>
        )}
      </div>

      {/* Copa Mensual */}
      {premios.length >= 4 && (
        <div className="copa-mensual mt-4">
          <span className="copa-icono">🏆</span>
          <h3>¡Felicidades! Ganaste la Copa Mensual</h3>
        </div>
      )}
    </div>
  );
};

export default Premios;