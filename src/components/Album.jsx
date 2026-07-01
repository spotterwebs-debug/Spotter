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

  const fondosPorCategoria = {
    perros: '/fondopatitas.jpg', 
    gatos: '/fondopatitas.jpg',
    plantas: '/fondoplantas.jpg',
    paisajes: '/fondopaisajes.jpg',
    aves: '/fondoaves.jpg'
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

    if (!error && data) setCartasFiltradas(data);
    setLoading(false);
  };

  useEffect(() => { fetchCartas(); }, [categoria]); 


  
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
    <div className="album-container py-5 text-white" style={{ minHeight: '92vh', backgroundImage: fondoActual ? `url(${fondoActual})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="album-overlay"></div>
      <div className="container px-4 position-relative text-center text-md-start" style={{ zIndex: 2 }}>
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3 border-bottom border-secondary pb-4">
          <h1 className="display-5 fw-bold text-capitalize m-0">Álbum de <span className="text-warning">{categoria}</span></h1>
          <div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <button className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={() => fileInputRef.current.click()}>
              📁 Subir desde Galería
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 justify-content-center">
            {cartasFiltradas.map((carta) => (
              <div className="col d-flex justify-content-center" key={carta.id}>
                <CardManager carta={carta} onUpdate={fetchCartas} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Album;