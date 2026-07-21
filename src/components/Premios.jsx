import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import "./Premios.css";

const Premios = () => {
  const navigate = useNavigate();
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [compartiendoId, setCompartiendoId] = useState(null);

  useEffect(() => {
    const fetchPremios = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          completed_at,
          challenges:challenge_id (titulo, liston_color, categoria),
          card:card_id (id, nombre, imagen_url, categoria, raza, personalidad, dato, caracteristica, lugar, is_public)
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

  const handleCompartirComunidad = async (cardId) => {
    setCompartiendoId(cardId);
    const { error } = await supabase
      .from('cards')
      .update({ is_public: true })
      .eq('id', cardId);

    if (error) {
      console.error("Error al compartir en comunidad:", error);
    } else {
      // Actualizamos el estado local para que refleje que ya es pública
      setPremios(prev => prev.map(p => {
        if (p.card.id === cardId) {
          return { ...p, card: { ...p.card, is_public: true } };
        }
        return p;
      }));
    }
    setCompartiendoId(null);
  };

  if (loading) return <div className="text-center py-5 text-white">Cargando tus premios...</div>;

  return (
    <div className="premios-container py-5 text-white container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2>Mis Logros y Listones</h2>
        
        {/* Controles de vista igual que en el álbum */}
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${viewMode === 'grid' ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setViewMode('grid')}
          >
            🔲 Cuadrícula
          </button>
          <button 
            type="button" 
            className={`btn ${viewMode === 'list' ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            📋 Lista
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'listones-grid' : 'album-list'}>
        {premios.length > 0 ? (
          premios.map((p, index) => {
            const card = p.card;
            const challenge = p.challenges;
            const listonColor = challenge?.liston_color || '#ffc107';

            return (
              <div key={index} className="premio-card-container position-relative">
                
                {/* Listón de completado cruzado en la esquina */}
                <div 
                  className="ribbon-completado"
                  style={{ backgroundColor: listonColor }}
                >
                  <span>¡Completado!</span>
                </div>

                {viewMode === 'grid' ? (
                  /* Modo Cuadrícula: Estructura trading-card-final con botón condicional que desaparece al compartirse */
                  <>
                    <div className="trading-card-final d-flex flex-column justify-content-between" style={{ cursor: 'default' }}>
                      <div className="card-inner-border">
                        <div className="card-image-box">
                          {card?.imagen_url ? (
                            <img src={card.imagen_url} alt={card.nombre || 'Tarjeta'} />
                          ) : (
                            <div className="bg-secondary d-flex align-items-center justify-content-center h-100">
                              <span className="fs-1">🖼️</span>
                            </div>
                          )}
                        </div>
                        <div className="card-info-box p-2 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="mb-0 fw-bold text-dark text-truncate">{card?.nombre || 'Sin nombre'}</h6>
                            <p className="text-muted small mb-1 text-capitalize">
                              {card?.raza || card?.lugar || card?.caracteristica || card?.categoria}
                            </p>
                          </div>
                          <div className="border-top pt-1 mt-1">
                            <small className="text-warning fw-bold d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                              🎖️ {challenge?.titulo || 'Desafío completado'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón de compartir en comunidad (solo aparece si no ha sido compartida) */}
                    {!card?.is_public && (
                      <div className="w-100 text-center">
                        <button 
                          className="btn btn-sm btn-outline-success fw-bold w-100 py-1"
                          style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                          onClick={() => handleCompartirComunidad(card.id)}
                          disabled={compartiendoId === card.id}
                        >
                          {compartiendoId === card.id ? 'Compartiendo...' : '🌍 Compartir en Comunidad'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Modo Lista */
                  <div className="card spotter-card shadow-sm border-0 bg-dark text-white p-2">
                    <div className="d-flex flex-row">
                      {card?.imagen_url ? (
                        <img 
                          src={card.imagen_url} 
                          alt={card.nombre || 'Tarjeta'} 
                          className="rounded object-fit-cover me-3" 
                          style={{ width: '130px', height: '130px' }}
                        />
                      ) : (
                        <div className="bg-secondary rounded d-flex align-items-center justify-content-center me-3" style={{ width: '130px', height: '130px', flexShrink: 0 }}>
                          <span className="fs-1">🖼️</span>
                        </div>
                      )}
                      <div className="card-body p-0 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          <h5 className="mb-1 text-truncate">{card?.nombre || 'Sin nombre'}</h5>
                          <p className="text-muted small mb-1 text-capitalize">
                            {card?.raza || card?.lugar || card?.caracteristica || card?.categoria}
                          </p>
                        </div>
                        <div className="border-top border-secondary pt-1 mt-1">
                          <small className="text-warning d-block fw-bold text-truncate">
                            🎖️ Desafío: {challenge?.titulo || 'Completado'}
                          </small>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            Completado el: {new Date(p.completed_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Botón de compartir en lista (solo aparece si no ha sido compartida) */}
                    {!card?.is_public && (
                      <div className="mt-2 pt-2 border-top border-secondary text-end">
                        <button 
                          className="btn btn-sm btn-outline-success fw-bold py-1 px-3"
                          style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                          onClick={() => handleCompartirComunidad(card.id)}
                          disabled={compartiendoId === card.id}
                        >
                          {compartiendoId === card.id ? 'Compartiendo...' : '🌍 Compartir en Comunidad'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <p className="text-center w-100">Aún no tienes listones. ¡Participa en los desafíos de tus categorías!</p>
        )}
      </div>

      {/* Copa Mensual */}
      {premios.length >= 4 && (
        <div className="copa-mensual mt-5 text-center p-4">
          <span className="copa-icono">🏆</span>
          <h3 className="text-dark mt-2 fw-bold">¡Felicidades! Ganaste la Copa Mensual</h3>
        </div>
      )}

      {/* Botón de continuar al inicio */}
      <div className="text-center mt-5 mb-4">
        <button 
          className="btn btn-warning btn-lg fw-bold px-5" 
          onClick={() => navigate('/')}
        >
          Continuar 
        </button>
      </div>
    </div>
  );
};

export default Premios;