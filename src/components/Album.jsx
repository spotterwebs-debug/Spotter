// src/pages/Album.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 👈 Conexión oficial
import CardManager from '../components/CardManager'; // 👈 Usamos el contenedor con el modal
import './Album.css';

function Album({ onPhotoCaptured }) {
  const { categoria } = useParams(); 
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Estados para guardar las cartas reales de Supabase y el cargando
  const [cartasFiltradas, setCartasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo exacto de los fondos
  const fondosPorCategoria = {
    perros: '/fondopatitas.jpg', 
    gatos: '/fondopatitas.jpg',
    plantas: '/fondoplantas.jpg',
    paisajes: '/fondopaisajes.jpg',
    aves: '/fondoaves.jpg'
  };

  const fondoActual = fondosPorCategoria[categoria] || '';

  // 🔄 Función para ir a buscar las cartas a Supabase
  const fetchCartas = async () => {
    setLoading(true);
    
    // 1. Conseguimos la sesión del usuario conectado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setCartasFiltradas([]);
      setLoading(false);
      return;
    }

    // 2. Traemos de Supabase solo las cartas que coincidan con el dueño Y la categoría actual
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('categoria', categoria);

    if (!error && data) {
      setCartasFiltradas(data);
    } else if (error) {
      console.error("Error al traer las figuritas:", error.message);
    }
    
    setLoading(false);
  };

  // 🔄 EFECTO: Se ejecuta cada vez que entrás o cambiás de categoría en la navbar
  useEffect(() => {
    fetchCartas();
  }, [categoria]); 

  const handleGalleryClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onPhotoCaptured(imageUrl); 
      navigate('/'); 
    }
  };

  return (
    <div 
      className="album-container py-5 text-white position-relative" 
      style={{ 
        minHeight: '92vh',
        backgroundImage: fondoActual ? `url(${fondoActual})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="album-overlay"></div>

      <div className="container px-4 position-relative text-center text-md-start" style={{ zIndex: 2 }}>
        
        {/* PARTE SUPERIOR: TÍTULO Y BOTÓN DE GALERÍA */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3 border-bottom border-secondary pb-4">
          <div>
            <h1 className="display-5 fw-bold text-capitalize m-0">
              Álbum de <span className="text-warning">{categoria}</span>
            </h1>
          </div>

          <div>
            <input 
              type="file" accept="image/*" 
              ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} 
            />
            <button className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={handleGalleryClick}>
              📁 Subir desde Galería
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL ÁLBUM */}
        {loading ? (
          // Mientras carga el fetch de Supabase
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-2 text-white-50">Buscando tus spots en la base de datos...</p>
          </div>
        ) : cartasFiltradas.length > 0 ? (
          // Pasamos las cartas por el CardManager para darles la funcionalidad del Modal
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 justify-content-center">
            {cartasFiltradas.map((carta) => (
              <div className="col d-flex justify-content-center" key={carta.id}>
                <CardManager carta={carta} onUpdate={fetchCartas} />
              </div>
            ))}
          </div>
        ) : (
          /* MENSAJE EXCLUSIVO CUANDO REALMENTE ESTÁ VACÍO */
          <div className="text-center py-5 animate-fade-in my-5">
            <h2 className="display-6 fw-bold text-white mb-3">
              No hay spots en tu álbum...
            </h2>
            <p className="lead text-warning-glow fw-semibold text-uppercase tracking-wider">
              ¡Comienza la aventura!
            </p>
            <button className="btn btn-outline-light rounded-pill px-4 mt-3" onClick={() => navigate('/')}>
              📸 Ir a Capturar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Album;