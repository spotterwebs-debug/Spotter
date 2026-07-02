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

    const {
      data: { session }
    } = await supabase.auth.getSession();

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

    if (!error && data) {
      setCartasFiltradas(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCartas();
  }, [categoria]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSharedPhoto({
        file,
        categoria
      });

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

        {/* HEADER */}
        <div className="d-flex flex-column mb-5">

          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-capitalize">
              Álbum de <span className="text-warning">{categoria}</span>
            </h1>

            <p className="fs-5 text-light opacity-75">
              Explora, organiza y disfruta tus {categoria}
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="album-buttons">

  <div className="album-left">

    <button
      className="album-big-btn blue"
      onClick={() => fileInputRef.current.click()}
    >
      <div className="btn-icon">📁</div>

      <div className="btn-info">
        <h3>Subir desde Galería</h3>
        <span>Añade tus {categoria}</span>
      </div>

      <div className="btn-arrow">❯</div>
    </button>

    <button
      
      className="album-big-btn green"
      onClick={() =>
       
        setVista(vista === 'grid' ? 'list' : 'grid')
      }
    >
      <div className="btn-icon">👁️</div>

      <div className="btn-info">
        <h3>Vista</h3>

        <span>
          {vista === 'grid'
            ? 'Cambiar a lista'
            : 'Cambiar a cuadrícula'}
        </span>

      </div>

      <div className="btn-arrow">❯</div>
    </button>

  </div>

  <div className="album-right">

    <button
      className="album-big-btn red"
      onClick={() => {}}
    >
      <div className="btn-icon">🎯</div>

      <div className="btn-info">
        <h3>Desafío</h3>
        <span>Acepta el reto</span>
      </div>

      <div className="btn-arrow">❯</div>
    </button>

    <button
      className="album-big-btn yellow"
      onClick={() => {}}
    >
      <div className="btn-icon">📊</div>

      <div className="btn-info">
        <h3>Listones</h3>
        <span>Ver estadísticas</span>
      </div>

      <div className="btn-arrow">❯</div>
    </button>

  </div>

</div>
</div>

        {/* CONTENIDO */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning"></div>
          </div>
        ) : (
          <>
           
  
  
   <div className={vista === 'grid' ? 'album-grid' : 'album-list'}>
  {cartasFiltradas.map((carta) => (
    <div key={carta.id} className="card-item-wrapper">
      <CardManager 
        carta={carta} 
        onUpdate={fetchCartas} 
      />
    </div>
  ))}
</div>

            <div className="text-center mt-5">
              <button
                className="btn btn-primary px-4 py-2 rounded-pill"
                onClick={() => fileInputRef.current.click()}
              >
                ➕ Subir nueva card
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Album;