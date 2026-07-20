import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import "./Premios.css";

const Premios = () => {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremios = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_challenges')
        .select(`
          completed_at,
          challenges (titulo, liston_color)
        `)
        .eq('user_id', user.id);

      setPremios(data || []);
      setLoading(false);
    };

    fetchPremios();
  }, []);

  if (loading) return <div>Cargando tus premios...</div>;

  return (
    <div className="premios-container">
      <h2>Mis Logros</h2>
      
      <div className="listones-grid">
        {premios.length > 0 ? (
          premios.map((p, index) => (
            <div key={index} className="liston-card">
              {/* Aquí usamos un emoji de listón. Si prefieres otro, puedes cambiarlo */}
              <div className="liston-icono">🎖️</div>
              <p className="liston-titulo">{p.challenges.titulo}</p>
            </div>
          ))
        ) : (
          <p>Aún no tienes listones. ¡Participa en los desafíos!</p>
        )}
      </div>

      {/* Copa Mensual */}
      {premios.length >= 4 && (
        <div className="copa-mensual">
          <span className="copa-icono">🏆</span>
          <h3>¡Felicidades! Ganaste la Copa Mensual</h3>
        </div>
      )}
    </div>
  );
};

export default Premios;