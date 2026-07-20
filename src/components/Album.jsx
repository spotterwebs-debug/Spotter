import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CardManager from '../components/CardManager';
import './Album.css';

function Album({ setSharedPhoto }) {
  const { categoria } = useParams();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [cartasFiltradas, setCartasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('grid');
  const [likes, setLikes] = useState([]);

  const fondosPorCategoria = {
    perros: '/fondopatitas.png',
    gatos: '/fondopatitas.png',
    plantas: '/fondoplantas.png',
    paisajes: '/fondopaisajes.png',
    aves: '/fondoaves.png'
  };

  const fondoActual = fondosPorCategoria[categoria] || '';

  const fetchCartas = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setCartasFiltradas([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('categoria', categoria);

    if (!error) setCartasFiltradas(data || []);

    setLoading(false);
  };

  const fetchLikes = async () => {
    const { data } = await supabase
      .from('likes')
      .select('card_id');

    setLikes(data || []);
  };

  useEffect(() => {
    fetchCartas();
    fetchLikes();
  }, [categoria]);

  const getLikesCount = (cardId) => {
    return likes.filter(
      like => String(like.card_id) === String(cardId)
    ).length;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSharedPhoto({ file, categoria });
      navigate('/create');
    }
  };

  return (
    <div
      className="album-container py-5 text-white"
      style={{
        '--bg': fondoActual ? `url(${fondoActual})` : 'none'
      }}
    >

      <div className="album-overlay"></div>

      <div className="container px-4 position-relative album-content">

        {/* HEADER DEL ÁLBUM */}
        <div className="d-flex flex-column mb-5">

          {/* TÍTULO */}
          <div className="text-center mb-3 w-100">
            <h1 className="display-4 fw-bold text-capitalize title-green">
              Álbum de {categoria}
            </h1>
          </div>

          {/* ICONOS */}
          <div className="album-top-icons">

            <button
              className="icon-btn"
              title="Desafío"
              onClick={() => navigate(`/challenges/${categoria}`)}
            >
              🎯
            </button>

            <button
              className="icon-btn"
              title="Listones"
              onClick={() => navigate(`/badges/${categoria}`)}
            >
              🏆
            </button>

          </div>


          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />


          {/* BOTONES */}
          <div className="album-buttons">

            <button
              className="album-small-btn"
              onClick={() => fileInputRef.current.click()}
            >
              📁 Subir
            </button>


            <button
              className="album-small-btn"
              onClick={() => setVista(vista === 'grid' ? 'list' : 'grid')}
            >
              👁️ {vista === 'grid' ? 'Ver lista' : 'Ver cuadricula'}
            </button>

          </div>


        </div>


        {loading ? (

          <div className="text-center py-5">
            <div className="spinner-border text-warning"></div>
          </div>

        ) : (

          <div className={vista === 'grid' ? 'album-grid' : 'album-list'}>

            {cartasFiltradas.map((carta) => (

              <div
                key={carta.id}
                className="card-item-wrapper"
              >
                <CardManager
                  carta={carta}
                  onUpdate={fetchCartas}
                  likesCount={getLikesCount(carta.id)}
                />
              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Album;