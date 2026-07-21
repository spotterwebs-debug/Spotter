import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import "./Challenges.css";

const Challenge = () => {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const categoriaFormateada = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : null;

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yaParticipo, setYaParticipo] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: chal } = await supabase
        .from('challenges')
        .select('*')
        .eq('categoria', categoriaFormateada)
        .eq('activo', true)
        .maybeSingle();
      
      if (chal) {
        setChallenge(chal);
        if (user) {
          const { data: existing } = await supabase
            .from('user_challenges')
            .select('id')
            .eq('challenge_id', chal.id)
            .eq('user_id', user.id)
            .maybeSingle();
          if (existing) setYaParticipo(true);
        }
      }
      setLoading(false);
    };
    if (categoriaFormateada) checkStatus();
  }, [categoriaFormateada]);

  // Al hacer clic, redirigimos al creador de tarjetas oficial en /create
  const handleParticiparClick = () => {
    navigate('/create', { 
      state: { 
        challengeId: challenge.id, 
        categoriaInicial: categoria 
      } 
    });
  };

  if (loading) return <div className="challenge-loading">Cargando...</div>;
  if (!challenge) return <div className="text-center py-5">No se encontró un desafío activo para esta categoría.</div>;

  return (
    <div className="challenge-container py-5 text-center">
      <h2 className="challenge-subtitle">Desafío: {challenge.titulo}</h2>
      <p className="challenge-desc">{challenge.descripcion}</p>
      
      {yaParticipo ? (
        <div className="alert alert-success d-inline-block mt-3">
          ✅ Ya participaste en este desafío. ¡Revisa tu sección de Premios!
        </div>
      ) : (
        <div className="mt-4">
          <button className="btn btn-warning btn-lg fw-bold" onClick={handleParticiparClick}>
            🎨 ¡Participa!
          </button>
        </div>
      )}
    </div>
  );
};

export default Challenge;