import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import './FotoDelDia.css';

export const FotoDelDia = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [preview, setPreview] = useState(null);

  const [intentosRestantes, setIntentosRestantes] = useState(2);
  const [cargandoIntentos, setCargandoIntentos] = useState(true);

  const [guardando, setGuardando] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const [categoriaGuardada, setCategoriaGuardada] = useState(null);

  const [estadoGeneracion, setEstadoGeneracion] = useState('');
  const [progresoGeneracion, setProgresoGeneracion] = useState(0);

  const [aventuraActual, setAventuraActual] = useState({
    id: null,
    nombre: 'Cargando...',
    template: '',
    prompt: '',
  });

  // ==========================================
  // FECHA URUGUAY
  // ==========================================

  const obtenerFechaUruguay = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Montevideo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  // ==========================================
  // ESPERAR
  // ==========================================

  const esperar = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  // ==========================================
  // VERIFICAR USUARIO
  // ==========================================

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setCargandoUsuario(true);

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            'Error obteniendo usuario:',
            error
          );
        }

        setUsuario(user ?? null);

      } catch (error) {
        console.error(
          'Error verificando sesión:',
          error
        );

        setUsuario(null);

      } finally {
        setCargandoUsuario(false);
      }
    };

    cargarUsuario();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // AVENTURA DEL DÍA SEGÚN FECHA
  // ==========================================

  useEffect(() => {
    const fetchAventura = async () => {
      try {
        const fechaHoy = obtenerFechaUruguay();

        console.log(
          'Buscando aventura para:',
          fechaHoy
        );

        const { data, error } = await supabase
          .from('tematicas')
          .select('*')
          .eq('fecha', fechaHoy)
          .single();

        if (error) {
          console.error(
            'Error cargando temática del día:',
            error
          );

          setAventuraActual({
            id: null,
            nombre: 'Sin aventura disponible',
            template: '',
            prompt: '',
          });

          return;
        }

        if (data) {
          setAventuraActual({
            id: data.id,
            nombre: data.nombre_aventura,
            template: data.template_image || '',
            prompt: data.prompt_text || '',
          });
        }

      } catch (error) {
        console.error(
          'Error cargando aventura:',
          error
        );

        setAventuraActual({
          id: null,
          nombre: 'Sin aventura disponible',
          template: '',
          prompt: '',
        });
      }
    };

    fetchAventura();
  }, []);

  // ==========================================
  // CONSULTAR INTENTOS
  // ==========================================

  useEffect(() => {
    const fetchIntentos = async () => {
      if (!usuario) {
        setIntentosRestantes(0);
        setCargandoIntentos(false);
        return;
      }

      try {
        setCargandoIntentos(true);

        const fechaHoy =
          obtenerFechaUruguay();

        const { data, error } =
          await supabase
            .from('daily_generations')
            .select('attempt_number, status')
            .eq('user_id', usuario.id)
            .eq(
              'generation_date',
              fechaHoy
            );

        if (error) {
          console.error(
            'Error consultando intentos:',
            error
          );

          return;
        }

        const intentosUsados =
          data?.length || 0;

        setIntentosRestantes(
          Math.max(
            0,
            2 - intentosUsados
          )
        );

      } catch (error) {
        console.error(
          'Error cargando intentos:',
          error
        );

      } finally {
        setCargandoIntentos(false);
      }
    };

    if (!cargandoUsuario) {
      fetchIntentos();
    }

  }, [usuario, cargandoUsuario]);

  // ==========================================
  // CONSULTAR RESULTADO IA
  // ==========================================

  const esperarResultado = async (
    predictionId,
    generationId
  ) => {
    let intentosPolling = 0;

    const mensajes = [
      {
        progreso: 12,
        texto: '🐾 Conociendo a tu mascota...'
      },
      {
        progreso: 22,
        texto: '💄 Maquillando a tu mascota...'
      },
      {
        progreso: 32,
        texto: '👗 Preparando su disfraz...'
      },
      {
        progreso: 43,
        texto: '🎭 Aprendiendo el personaje...'
      },
      {
        progreso: 54,
        texto: '🌎 Construyendo su aventura...'
      },
      {
        progreso: 65,
        texto: '✨ Agregando un poquito de magia...'
      },
      {
        progreso: 75,
        texto: '🎨 Trabajando en los detalles...'
      },
      {
        progreso: 83,
        texto: '🐾 Dejando todo perfecto...'
      },
      {
        progreso: 88,
        texto: '🖌️ Retocando los últimos detalles...'
      },
      {
        progreso: 92,
        texto: '✨ Ya casi está lista...'
      }
    ];

    while (intentosPolling < 60) {
      intentosPolling += 1;

      const indiceMensaje = Math.min(
        Math.floor(
          (intentosPolling - 1) / 2
        ),
        mensajes.length - 1
      );

      const etapa =
        mensajes[indiceMensaje];

      setEstadoGeneracion(
        etapa.texto
      );

      setProgresoGeneracion(
        (progresoActual) =>
          Math.max(
            progresoActual,
            etapa.progreso
          )
      );

      await esperar(4000);

      const { data, error } =
        await supabase.functions.invoke(
          'check-daily-photo',
          {
            body: {
              predictionId,
              generationId,
            },
          }
        );

      if (error) {
        console.error(
          'Error consultando generación:',
          error
        );

        throw new Error(
          'Hubo un problema consultando la generación.'
        );
      }

      // ======================================
      // TERMINÓ CORRECTAMENTE
      // ======================================

      if (
        data?.finished &&
        data?.status === 'succeeded'
      ) {
        const imagenGenerada =
          Array.isArray(data.output)
            ? data.output[0]
            : data.output;

        if (!imagenGenerada) {
          throw new Error(
            'La IA terminó pero no devolvió una imagen.'
          );
        }

        setEstadoGeneracion(
          '🎉 ¡Tu aventura está lista!'
        );

        setProgresoGeneracion(100);

        await esperar(800);

        return imagenGenerada;
      }

      // ======================================
      // FALLÓ
      // ======================================

      if (
        data?.finished &&
        (
          data?.status === 'failed' ||
          data?.status === 'canceled'
        )
      ) {
        throw new Error(
          data?.error ||
            'La generación no pudo completarse.'
        );
      }
    }

    throw new Error(
      'La generación está demorando demasiado.'
    );
  };

  // ==========================================
  // GENERAR FOTO
  // ==========================================

  const procesarTransformacion = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // ========================================
    // USUARIO
    // ========================================

    if (!usuario) {
      await Swal.fire({
        icon: 'info',
        title: 'Iniciá sesión',
        text:
          'Foto del Día está disponible únicamente para usuarios registrados.',
        confirmButtonText: 'Ir al login',
      });

      navigate('/login');

      return;
    }

    // ========================================
    // VERIFICAR AVENTURA
    // ========================================

    if (!aventuraActual.id) {
      await Swal.fire({
        icon: 'info',
        title: 'No hay aventura disponible',
        text:
          'Todavía no hay una aventura programada para hoy.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    // ========================================
    // INTENTOS
    // ========================================

    if (intentosRestantes <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin intentos disponibles',
        text:
          'Ya utilizaste tus 2 intentos de Foto del Día.',
      });

      return;
    }

    // ========================================
    // REINICIAR ESTADOS
    // ========================================

    setLoading(true);
    setResultado(null);
    setGuardada(false);
    setCategoriaGuardada(null);

    setProgresoGeneracion(5);

    setEstadoGeneracion(
      '📸 Preparando tu fotografía...'
    );

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);

    try {
      // ======================================
      // 1. SUBIR FOTO
      // ======================================

      const nombreArchivo =
        `foto-dia/${Date.now()}-${file.name}`;

      const { error: uploadError } =
        await supabase.storage
          .from('desafios')
          .upload(
            nombreArchivo,
            file
          );

      if (uploadError) {
        throw new Error(
          `Error subiendo la foto: ${uploadError.message}`
        );
      }

      setProgresoGeneracion(8);

      setEstadoGeneracion(
        '🐾 Tu foto llegó a Spotter...'
      );

      // ======================================
      // 2. URL PÚBLICA
      // ======================================

      const { data: publicUrlData } =
        supabase.storage
          .from('desafios')
          .getPublicUrl(
            nombreArchivo
          );

      const imageUrl =
        publicUrlData.publicUrl;

      // ======================================
      // 3. PROMPT DE LA AVENTURA DEL DÍA
      // ======================================

      const prompt =
        aventuraActual.prompt ||
        `
Transform the pet in the reference image into a ${aventuraActual.nombre} adventurer.

Keep exactly the same pet clearly recognizable.

Preserve:
- the same face
- fur colors
- markings
- breed
- eyes
- physical characteristics

Create a cinematic fantasy scene based on the theme "${aventuraActual.nombre}".

Premium collectible trading card artwork.
Highly detailed.
The pet must remain the main subject.
Do not replace it with another animal.
`;

      setEstadoGeneracion(
        '🎬 Preparando la aventura...'
      );

      setProgresoGeneracion(10);

      // ======================================
      // 4. CREAR PREDICCIÓN
      // ======================================

      const { data, error } =
        await supabase.functions.invoke(
          'generate-daily-photo',
          {
            body: {
              image: imageUrl,
              prompt,
              tematicaId:
                aventuraActual.id,
              nombreAventura:
                aventuraActual.nombre,
            },
          }
        );

      if (error) {
        console.error(
          'Error iniciando generación:',
          error
        );

        throw new Error(
          'No pudimos iniciar la aventura.'
        );
      }

      if (!data?.success) {
        if (data?.limitReached) {
          setIntentosRestantes(0);
        }

        throw new Error(
          data?.error ||
            'No pudimos iniciar la generación.'
        );
      }

      if (!data.predictionId) {
        throw new Error(
          'No recibimos el identificador de la generación.'
        );
      }

      // ======================================
      // 5. ESPERAR RESULTADO
      // ======================================

      const imagenGenerada =
        await esperarResultado(
          data.predictionId,
          data.generationId
        );

      // ======================================
      // 6. ACTUALIZAR INTENTOS
      // ======================================

      if (
        typeof data.attemptsRemaining ===
        'number'
      ) {
        setIntentosRestantes(
          data.attemptsRemaining
        );
      }

      // ======================================
      // 7. MOSTRAR RESULTADO
      // ======================================

      setResultado(
        imagenGenerada
      );

    } catch (error) {
      console.error(
        'Error en la transformación:',
        error
      );

      await Swal.fire({
        icon: 'error',

        title:
          'No pudimos crear la aventura',

        text:
          error.message,

        confirmButtonText:
          'Aceptar',
      });

    } finally {
      setLoading(false);

      setEstadoGeneracion('');

      e.target.value = '';
    }
  };

  // ==========================================
  // GUARDAR EN ÁLBUM
  // ==========================================

  const guardarEnAlbum = async () => {
    if (
      !resultado ||
      guardando ||
      guardada
    ) {
      return;
    }

    if (!usuario) {
      navigate('/login');
      return;
    }

    const { value: categoria } =
      await Swal.fire({
        title:
          '¿Qué mascota aparece?',

        text:
          'Elegí el álbum donde querés guardar esta aventura.',

        input: 'select',

        inputOptions: {
          perros: '🐶 Perros',
          gatos: '🐱 Gatos',
          aves: '🐦 Aves',
        },

        inputPlaceholder:
          'Seleccioná una categoría',

        showCancelButton: true,

        confirmButtonText:
          'Guardar en álbum',

        cancelButtonText:
          'Cancelar',

        customClass: {
          popup: 'spotter-popup',
        },

        inputValidator:
          (value) => {
            if (!value) {
              return 'Elegí una categoría';
            }
          },
      });

    if (!categoria) return;

    try {
      setGuardando(true);

      // ======================================
      // DESCARGAR IMAGEN GENERADA
      // ======================================

      const response =
        await fetch(
          resultado
        );

      if (!response.ok) {
        throw new Error(
          'No pudimos preparar la imagen para guardarla.'
        );
      }

      const blob =
        await response.blob();

      // ======================================
      // GUARDAR EN STORAGE
      // ======================================

      const extension =
        blob.type === 'image/jpeg'
          ? 'jpg'
          : 'png';

      const nombreResultado =
        `foto-dia/resultados/${usuario.id}-${Date.now()}.${extension}`;

      const {
        error: storageError
      } =
        await supabase.storage
          .from('desafios')
          .upload(
            nombreResultado,
            blob,
            {
              contentType:
                blob.type ||
                'image/png',

              upsert:
                false,
            }
          );

      if (storageError) {
        throw new Error(
          `No pudimos guardar la imagen: ${storageError.message}`
        );
      }

      // ======================================
      // URL PERMANENTE
      // ======================================

      const { data: urlData } =
        supabase.storage
          .from('desafios')
          .getPublicUrl(
            nombreResultado
          );

      const imagenPermanente =
        urlData.publicUrl;

      // ======================================
      // CREAR CARD
      // ======================================

      const { error: cardError } =
        await supabase
          .from('cards')
          .insert({
            user_id:
              usuario.id,

            categoria,

            nombre:
              `Aventura ${aventuraActual.nombre}`,

            imagen_url:
              imagenPermanente,

            raza:
              'Edición IA',

            personalidad:
              aventuraActual.nombre,

            caracteristica:
              'Foto del día',

            dato:
              `Aventura especial: ${aventuraActual.nombre}`,

            publica:
              false,

            is_public:
              false,
          });

      if (cardError) {
        throw new Error(
          `No pudimos crear la card: ${cardError.message}`
        );
      }

      setGuardada(true);

      setCategoriaGuardada(
        categoria
      );

      await Swal.fire({
        icon: 'success',

        title:
          '¡Guardada! 🎉',

        html: `
          Tu aventura fue guardada en
          <strong>${categoria}</strong>.
        `,

        confirmButtonText:
          'Genial',
      });

    } catch (error) {
      console.error(
        'Error guardando en álbum:',
        error
      );

      await Swal.fire({
        icon: 'error',

        title:
          'No pudimos guardarla',

        text:
          error.message,
      });

    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // CREAR OTRA
  // ==========================================

  const crearOtra = () => {
    setResultado(null);
    setPreview(null);
    setGuardada(false);
    setCategoriaGuardada(null);
    setEstadoGeneracion('');
    setProgresoGeneracion(0);
  };

  // ==========================================
  // VISTA
  // ==========================================

  return (
    <section className="foto-dia-section">

      <div className="foto-dia-card">

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="foto-dia-header">

          <span className="foto-dia-eyebrow">
            ✨ Aventura del día
          </span>

          
          <p>
            Convertí a tu mascota en protagonista
            de una aventura.
          </p>

        </div>

        {/* ====================================
            AVENTURA
        ==================================== */}

        <div className="foto-dia-aventura">

          <span>
            Aventura de hoy
          </span>

          <strong>
            ✨ {aventuraActual.nombre}
          </strong>

        </div>

        {/* ====================================
            CARGANDO USUARIO
        ==================================== */}

        {cargandoUsuario ? (

          <div className="foto-dia-loading">

            <div className="foto-dia-spinner" />

            <p>
              Verificando sesión...
            </p>

          </div>

        ) : !usuario ? (

          <div className="foto-dia-login-required">

            <div className="foto-dia-login-icon">
              🔐
            </div>

            <h3>
              Iniciá sesión para participar
            </h3>

            <p>
              Foto del Día es una experiencia
              exclusiva para usuarios registrados
              de Spotter.
            </p>

            <button
              type="button"
              className="foto-dia-login-btn"
              onClick={() =>
                navigate('/login')
              }
            >
              Iniciar sesión
            </button>

          </div>

        ) : aventuraActual.id === null ? (

          /* ==================================
             SIN AVENTURA PROGRAMADA
          ================================== */

          <div className="foto-dia-limit">

            <span>
              📅
            </span>

            <h3>
              Hoy todavía no hay una aventura
            </h3>

            <p>
              Muy pronto habrá una nueva misión
              para tu mascota.
            </p>

          </div>

        ) : (

          <>
            {/* ===============================
                INTENTOS
            =============================== */}

            <div className="foto-dia-intentos">

              <span>
                Intentos disponibles
              </span>

              {cargandoIntentos ? (

                <strong>
                  ...
                </strong>

              ) : (

                <>
                  <div className="foto-dia-dots">

                    <span
                      className={
                        intentosRestantes >= 1
                          ? 'intento-dot activo'
                          : 'intento-dot'
                      }
                    />

                    <span
                      className={
                        intentosRestantes >= 2
                          ? 'intento-dot activo'
                          : 'intento-dot'
                      }
                    />

                  </div>

                  <strong>
                    {intentosRestantes} de 2
                  </strong>
                </>

              )}

            </div>

            {/* ===============================
                SUBIR / GENERAR
            =============================== */}

            {!resultado &&
              (intentosRestantes > 0 || loading) &&
              !cargandoIntentos && (

                <div className="foto-dia-upload-area">

                  {!preview &&
                    !loading && (

                      <>
                        <div className="foto-dia-upload-icon">
                          📸
                        </div>

                        <h3>
                          Elegí una foto de tu mascota
                        </h3>

                        <p>
                          Usá una imagen clara donde
                          se vea bien su cara.
                        </p>
                      </>

                    )}

                  {!loading && (

                    <label className="foto-dia-upload-btn">

                      {preview
                        ? 'Elegir otra foto'
                        : 'Subir foto'}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          procesarTransformacion
                        }
                      />

                    </label>

                  )}

                  {/* ===========================
                      PREVIEW
                  =========================== */}

                  {preview && (

                    <div className="foto-dia-preview">

                      <img
                        src={preview}
                        alt="Mascota original"
                      />

                      <span>
                        Foto original
                      </span>

                    </div>

                  )}

                  {/* ===========================
                      GENERANDO IA
                  =========================== */}

                  {loading && (

                    <div className="foto-dia-loading">

                      <div className="foto-dia-spinner" />

                      <h3>
                        {estadoGeneracion ||
                          '✨ Creando tu aventura...'}
                      </h3>

                      <p className="foto-dia-wait-message">
                        Esto puede demorar un poquito,
                        <strong>
                          {' '}
                          ¡pero te aseguramos que vale la pena!
                        </strong>
                      </p>

                      <div className="foto-dia-progress-container">

                        <div className="foto-dia-progress-track">

                          <div
                            className="foto-dia-progress-bar"
                            style={{
                              width:
                                `${progresoGeneracion}%`
                            }}
                          />

                        </div>

                        <span className="foto-dia-progress-number">
                          {progresoGeneracion}%
                        </span>

                      </div>

                      <p className="foto-dia-loading-help">
                        No cierres esta pantalla.
                        Tu mascota está viviendo una
                        transformación muy importante.
                        🐾
                      </p>

                    </div>

                  )}

                </div>

              )}

            {/* ===============================
                RESULTADO
            =============================== */}

            {resultado && (

              <div className="foto-dia-result">

                <div className="foto-dia-result-badge">
                  ✨ RESULTADO
                </div>

                <h3>
                  Tu mascota se fue de aventura
                </h3>

                <div className="foto-dia-image-frame">

                  <img
                    src={resultado}
                    alt={
                      `Mascota en aventura ${aventuraActual.nombre}`
                    }
                  />

                </div>

                <p className="foto-dia-result-text">

                  Te quedan{' '}

                  <strong>
                    {intentosRestantes}
                  </strong>{' '}

                  de 2 intentos.

                </p>

                {!guardada ? (

                  <button
                    type="button"
                    className="foto-dia-save-btn"
                    onClick={
                      guardarEnAlbum
                    }
                    disabled={
                      guardando
                    }
                  >
                    {guardando
                      ? 'Guardando...'
                      : '💾 Guardar en mi álbum'}
                  </button>

                ) : (

                  <div className="foto-dia-guardada">

                    ✅ Guardada en tu álbum de{' '}

                    <strong>
                      {categoriaGuardada}
                    </strong>

                  </div>

                )}

                {intentosRestantes > 0 && (

                  <button
                    type="button"
                    className="foto-dia-secondary-btn"
                    onClick={
                      crearOtra
                    }
                  >
                    ✨ Intentar otra vez
                  </button>

                )}

              </div>

            )}

            {/* ===============================
                SIN INTENTOS
            =============================== */}

            {!cargandoIntentos &&
              intentosRestantes === 0 &&
              !resultado &&
              !loading && (

                <div className="foto-dia-limit">

                  <span>
                    🔒
                  </span>

                  <h3>
                    Ya usaste tus 2 intentos de hoy
                  </h3>

                  <p>
                    Volvé mañana para descubrir una
                    nueva aventura.
                  </p>

                </div>

              )}

          </>

        )}

      </div>

    </section>
  );
};