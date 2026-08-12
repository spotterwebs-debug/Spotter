import React, {
  useEffect,
  useState,
  useRef
} from 'react';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';


function LatestCaptures() {

  const navigate = useNavigate();

  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Referencias para detectar swipe táctil
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);


  // =========================================================
  // CARGAR ÚLTIMOS SPOTS PÚBLICOS
  // =========================================================

  useEffect(() => {

    const fetchLatest = async () => {

      setLoading(true);

      const {
        data,
        error
      } = await supabase
        .from('cards')
        .select('*')
        .eq('is_public', true)
        .order(
          'created_at',
          {
            ascending: false
          }
        )
        .limit(5);


      if (error) {

        console.error(
          'Error al cargar los últimos Spots:',
          error
        );

        setCaptures([]);

      } else {

        setCaptures(
          data || []
        );

      }

      setLoading(false);

    };


    fetchLatest();

  }, []);


  // =========================================================
  // SIGUIENTE CARD
  // =========================================================

  const handleNext = () => {

    if (
      captures.length === 0
    ) {
      return;
    }


    if (
      currentIndex <
      captures.length - 1
    ) {

      setCurrentIndex(
        (prev) => prev + 1
      );

    } else {

      setCurrentIndex(0);

    }

  };


  // =========================================================
  // CARD ANTERIOR
  // =========================================================

  const handlePrev = () => {

    if (
      captures.length === 0
    ) {
      return;
    }


    if (
      currentIndex > 0
    ) {

      setCurrentIndex(
        (prev) => prev - 1
      );

    } else {

      setCurrentIndex(
        captures.length - 1
      );

    }

  };


  // =========================================================
  // SWIPE CON EL DEDO
  // =========================================================

  const handleTouchStart = (e) => {

    touchStartX.current =
      e.touches[0].clientX;

  };


  const handleTouchMove = (e) => {

    touchEndX.current =
      e.touches[0].clientX;

  };


  const handleTouchEnd = () => {

    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {

      return;

    }


    const distance =
      touchStartX.current -
      touchEndX.current;


    // Swipe hacia la izquierda
    if (
      distance > 50
    ) {

      handleNext();

    }

    // Swipe hacia la derecha
    else if (
      distance < -50
    ) {

      handlePrev();

    }


    touchStartX.current = null;
    touchEndX.current = null;

  };


  // =========================================================
  // CARGANDO
  // =========================================================

  if (loading) {

    return (

      <div className="text-center py-5">

        Cargando lo más nuevo...

      </div>

    );

  }


  // =========================================================
  // VISTA
  // =========================================================

  return (

    <section className="bg-light py-5 w-100">

      <div className="container-fluid px-4">


        {/* ===================================================
            TÍTULO
        =================================================== */}

        <h2 className="h4 fw-bold mb-4 text-dark text-uppercase border-bottom pb-2">

          <i className="bi bi-clock-history me-2 text-danger"></i>

          Últimos Spots

        </h2>


        {/* ===================================================
            SIN SPOTS
        =================================================== */}

        {captures.length === 0 ? (

          <p className="text-muted">

            Aún no hay Spots para mostrar.

          </p>

        ) : (

          <div
            className="
              swipe-deck-wrapper
              position-relative
              d-flex
              flex-column
              align-items-center
              justify-content-center
              my-3
            "
          >

            <div
              className="
                d-flex
                flex-column
                align-items-center
                w-100
              "
            >


              {/* =================================================
                  MAZO DE SPOTS
              ================================================= */}

              <div

                className="
                  deck-container
                  position-relative
                  my-2
                "

                style={{

                  minHeight:
                    '390px',

                  width:
                    '260px',

                  touchAction:
                    'pan-y'

                }}

                onTouchStart={
                  handleTouchStart
                }

                onTouchMove={
                  handleTouchMove
                }

                onTouchEnd={
                  handleTouchEnd
                }

              >


                {captures.map(
                  (
                    card,
                    index
                  ) => {

                    const offset =
                      index -
                      currentIndex;


                    // Solo mostramos las cards cercanas
                    if (
                      Math.abs(offset) > 2
                    ) {

                      return null;

                    }


                    return (

                      <div

                        key={
                          card.id
                        }

                        className={`swipe-card ${
                          index === currentIndex
                            ? 'active-card'
                            : 'stacked-card'
                        }`}

                        style={{

                          transform:
                            `translateX(${offset * 15}px) translateY(${offset * 10}px) scale(${1 - Math.abs(offset) * 0.05})`,

                          zIndex:
                            captures.length -
                            Math.abs(offset),

                          opacity:
                            Math.abs(offset) > 1
                              ? 0.4
                              : 1,

                          transition:
                            'all 0.3s ease-in-out',

                          position:
                            index === currentIndex
                              ? 'relative'
                              : 'absolute',

                          top:
                            0,

                          left:
                            0,

                          width:
                            '100%',

                          cursor:
                            'pointer'

                        }}

                        onClick={() =>
                          navigate(
                            '/comunidad'
                          )
                        }

                      >


                        {/* =====================================
                            SOLO MOSTRAMOS LA CARD IA
                        ===================================== */}

                        <div

                          className="latest-spot-card"

                          style={{

                            width:
                              '100%',

                            aspectRatio:
                              '2 / 3',

                            borderRadius:
                              '18px',

                            overflow:
                              'hidden',

                            background:
                              'transparent',

                            boxShadow:
                              '0 10px 28px rgba(0,0,0,.18)'

                          }}

                        >


                          {card?.imagen_url ? (

                            <img

                              src={
                                card.imagen_url
                              }

                              alt={
                                card.nombre ||
                                'Spot'
                              }

                              style={{

                                display:
                                  'block',

                                width:
                                  '100%',

                                height:
                                  '100%',

                                objectFit:
                                  'contain',

                                objectPosition:
                                  'center'

                              }}

                            />

                          ) : (

                            <div
                              className="
                                bg-secondary
                                d-flex
                                align-items-center
                                justify-content-center
                                h-100
                              "
                            >

                              <span className="fs-1">

                                🖼️

                              </span>

                            </div>

                          )}


                        </div>


                      </div>

                    );

                  }
                )}


              </div>


              {/* =================================================
                  CONTROLES DEL SWIPE
                  AMBOS BOTONES IGUALES
              ================================================= */}

              <div
                className="
                  d-flex
                  gap-3
                  mt-3
                  align-items-center
                "
              >


                {/* ANTERIOR */}

                <button

                  type="button"

                  className="
                    btn
                    btn-outline-danger
                    rounded-circle
                    px-3
                    py-2
                    fw-bold
                    shadow-sm
                  "

                  onClick={
                    handlePrev
                  }

                  aria-label="Spot anterior"

                >

                  ⬅️

                </button>


                {/* CONTADOR */}

                <span className="text-dark fw-bold">

                  {currentIndex + 1}

                  {' / '}

                  {captures.length}

                </span>


                {/* SIGUIENTE */}

                <button

                  type="button"

                  className="
                    btn
                    btn-outline-danger
                    rounded-circle
                    px-3
                    py-2
                    fw-bold
                    shadow-sm
                  "

                  onClick={
                    handleNext
                  }

                  aria-label="Siguiente Spot"

                >

                  ➡️

                </button>


              </div>


              {/* =================================================
                  IR A COMUNIDAD
              ================================================= */}

              <div className="mt-4">


                <button

                  type="button"

                  className="
                    btn
                    btn-success
                    px-4
                    py-2
                    rounded-pill
                    fw-semibold
                    shadow
                  "

                  onClick={() =>
                    navigate(
                      '/comunidad'
                    )
                  }

                >

                  <i className="bi bi-people-fill me-2"></i>

                  Ver comunidad

                </button>


              </div>


            </div>

          </div>

        )}


      </div>

    </section>

  );

}


export default LatestCaptures;