import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import "./Challenges.css";

const Challenge = () => {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const categoriaFormateada = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : null;
  const fileInputRef = useRef(null);

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yaParticipo, setYaParticipo] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Obtener el desafío activo
      const { data: chal } = await supabase
        .from('challenges')
        .select('*')
        .eq('categoria', categoriaFormateada)
        .eq('activo', true)
        .single();
      
      if (chal) {
        setChallenge(chal);
        // 2. Verificar si ya participó
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Swal.fire({ title: 'Subiendo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      await supabase.storage.from('desafios').upload(fileName, file);

      await supabase.from('user_challenges').insert([{ 
        user_id: user.id, 
        challenge_id: challenge.id,
        completed_at: new Date().toISOString()
      }]);

      setYaParticipo(true);

      Swal.fire({
        title: '¡Felicidades!',
        text: `Gracias por participar. ¡Has ganado el listón ${challenge.titulo}!`,
        icon: 'success',
        confirmButtonText: 'Ver mis listones'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/badges/${categoria}`); // <-- Corregido para redirigir a los listones de esta categoría
        }
      });

    } catch (err) {
      Swal.fire('Error', 'No pudimos registrar tu participación.', 'error');
    }
  };

  if (loading) return <div className="challenge-loading">Cargando...</div>;
  if (!challenge) return <div>No se encontró el desafío.</div>;

  return (
    <div className="challenge-container">
      <h2>Desafío: {challenge.titulo}</h2>
      <p>{challenge.descripcion}</p>
      
      {yaParticipo ? (
        <p className="status-msg">✅ Ya participaste. Espera la próxima semana para un nuevo desafío.</p>
      ) : (
        <button className="participate-btn" onClick={() => fileInputRef.current.click()}>
          Participar
        </button>
      )}
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
    </div>
  );
};

export default Challenge;