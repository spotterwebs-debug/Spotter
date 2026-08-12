import React, {
  useEffect,
  useState
} from 'react';

import { supabase } from '../supabaseClient';
import CategoryCarousel from './CategoryCarousel';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import './Comunidad.css';


// =========================================================
// MENSAJES DE CARGA
// =========================================================

const MENSAJES_CARGA = [
  'Maquillando mascotas...',
  'Preparando las aves para la foto...',
  'Buscando los mejores paisajes...',
  'Acariciando a los gatitos...',
  'Ordenando las Aventuras del Día...',
  'Casi listo en la Comunidad Spotter...'
];


function Comunidad() {

  const navigate = useNavigate();


  // =========================================================
  // ESTADOS
  // =========================================================

  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // =========================================================
  // LOADING
  // =========================================================

  const [
    mensajeIndex,
    setMensajeIndex
  ] = useState(0);

  const [
    progreso,
    setProgreso
  ] = useState(10);


  // =========================================================
  // FOTO GRANDE
  // =========================================================

  const [
    fotoEnGrande,
    setFotoEnGrande
  ] = useState(null);


  // =========================================================
  // ANIMACIÓN DE CARGA
  // =========================================================

  useEffect(() => {

    if (!loading) {
      return;
    }


    const intervaloMensaje =
      setInterval(() => {

        setMensajeIndex(
          (prev) =>
            (
              prev + 1
            ) %
            MENSAJES_CARGA.length
        );

      }, 1500);


    const intervaloProgreso =
      setInterval(() => {

        setProgreso(
          (prev) =>
            prev < 90
              ? prev + 10
              : prev
        );

      }, 400);


    return () => {

      clearInterval(
        intervaloMensaje
      );

      clearInterval(
        intervaloProgreso
      );

    };

  }, [loading]);


  // =========================================================
  // CARGAR DATOS
  // =========================================================

  useEffect(() => {

    cargarDatos();

  }, []);


  const cargarDatos =
    async () => {

      setLoading(true);
      setProgreso(10);


      try {

        const [
          authResponse,
          cardsResponse,
          likesResponse
        ] =
          await Promise.all([

            // USUARIO
            supabase.auth
              .getUser(),


            // SOLO CARDS COMPARTIDAS
            supabase
              .from('cards')
              .select('*')
              .eq(
                'is_public',
                true
              )
              .order(
                'created_at',
                {
                  ascending:
                    false
                }
              ),


            // LIKES
            supabase
              .from('likes')
              .select('*')

          ]);


        // =====================================================
        // USUARIO
        // =====================================================

        setUser(
          authResponse.data
            ?.user ||
          null
        );


        // =====================================================
        // CARDS
        // =====================================================

        if (
          !cardsResponse.error
        ) {

          setPosts(
            cardsResponse.data ||
            []
          );

        } else {

          console.error(
            'Error cargando cards:',
            cardsResponse.error
          );

        }


        // =====================================================
        // LIKES
        // =====================================================

        if (
          !likesResponse.error
        ) {

          setLikes(
            likesResponse.data ||
            []
          );

        } else {

          console.error(
            'Error cargando likes:',
            likesResponse.error
          );

        }


      } catch (error) {

        console.error(
          'Error cargando Comunidad:',
          error
        );


      } finally {

        setProgreso(100);


        setTimeout(
          () =>
            setLoading(false),
          300
        );

      }

    };


  // =========================================================
  // LIKE
  // =========================================================

  const toggleLike =
    async (cardId) => {

      if (!user) {

        Swal.fire({

          icon:
            'warning',

          title:
            '¡Acceso denegado!',

          text:
            'Debes iniciar sesión para dar Me Gusta.',

          confirmButtonText:
            'Iniciar sesión',

          confirmButtonColor:
            '#ffc107',

          allowOutsideClick:
            false

        }).then(
          (result) => {

            if (
              result.isConfirmed
            ) {

              navigate(
                '/login'
              );

            }

          }
        );


        return;

      }


      // =======================================================
      // VER SI YA DIO LIKE
      // =======================================================

      const existe =
        likes.find(
          (like) =>

            String(
              like.card_id
            ) ===
            String(
              cardId
            ) &&

            String(
              like.user_id
            ) ===
            String(
              user.id
            )
        );


      // =======================================================
      // QUITAR LIKE
      // =======================================================

      if (existe) {

        const {
          error
        } =
          await supabase
            .from('likes')
            .delete()
            .eq(
              'id',
              existe.id
            );


        if (!error) {

          setLikes(
            (prev) =>
              prev.filter(
                (like) =>
                  like.id !==
                  existe.id
              )
          );

        } else {

          console.error(
            'Error quitando like:',
            error
          );

        }


        return;

      }


      // =======================================================
      // AGREGAR LIKE
      // =======================================================

      const {
        data,
        error
      } =
        await supabase
          .from('likes')
          .insert({
            card_id:
              cardId,

            user_id:
              user.id
          })
          .select()
          .single();


      if (
        !error &&
        data
      ) {

        setLikes(
          (prev) => [
            ...prev,
            data
          ]
        );

      } else {

        console.error(
          'Error agregando like:',
          error
        );

      }

    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="comunidad-loading-container">

        <div className="comunidad-loading-box">


          <h3 className="mb-3 text-white">

            🐾 Spotter

          </h3>


          <p className="loading-phrase">

            {
              MENSAJES_CARGA[
                mensajeIndex
              ]
            }

          </p>


          <div className="progress-bar-custom">

            <div

              className="progress-fill"

              style={{
                width:
                  `${progreso}%`
              }}

            />

          </div>


          <small className="text-muted mt-3 d-block">

            {progreso}%

          </small>


        </div>

      </div>

    );

  }


  // =========================================================
  // AVENTURAS DEL DÍA
  // =========================================================

  const aventuras =
    posts.filter(
      (post) =>
        post.origen ===
        'aventura'
    );


  // =========================================================
  // CATEGORÍAS NORMALES
  //
  // IMPORTANTE:
  // excluimos origen === aventura
  // para que NO se dupliquen.
  // =========================================================

  const categorias = {

    perros:
      posts.filter(
        (post) =>
          post.categoria ===
            'perros' &&
          post.origen !==
            'aventura'
      ),


    gatos:
      posts.filter(
        (post) =>
          post.categoria ===
            'gatos' &&
          post.origen !==
            'aventura'
      ),


    aves:
      posts.filter(
        (post) =>
          post.categoria ===
            'aves' &&
          post.origen !==
            'aventura'
      ),


    plantas:
      posts.filter(
        (post) =>
          post.categoria ===
            'plantas' &&
          post.origen !==
            'aventura'
      ),


    paisajes:
      posts.filter(
        (post) =>
          post.categoria ===
            'paisajes' &&
          post.origen !==
            'aventura'
      )

  };


  // =========================================================
  // VISTA
  // =========================================================

  return (

    <div className="comunidad-page">


      <div className="container comunidad-content">


        {/* ===================================================
            TÍTULO
        =================================================== */}

        <div className="comunidad-header">

          <h2 className="comunidad-title">

            Comunidad Spotter

          </h2>


          <p className="comunidad-subtitle">

            Descubrí los Spots compartidos por la comunidad.

          </p>

        </div>


        {/* ===================================================
            AVENTURAS DEL DÍA
        =================================================== */}

        <CategoryCarousel

          id="aventuras"

          title="✨ Aventuras del Día"

          cards={
            aventuras
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            PERROS
        =================================================== */}

        <CategoryCarousel

          id="perros"

          title="🐶 Perros"

          cards={
            categorias.perros
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            GATOS
        =================================================== */}

        <CategoryCarousel

          id="gatos"

          title="🐱 Gatos"

          cards={
            categorias.gatos
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            AVES
        =================================================== */}

        <CategoryCarousel

          id="aves"

          title="🐦 Aves"

          cards={
            categorias.aves
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            PLANTAS
        =================================================== */}

        <CategoryCarousel

          id="plantas"

          title="🌿 Plantas"

          cards={
            categorias.plantas
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            PAISAJES
        =================================================== */}

        <CategoryCarousel

          id="paisajes"

          title="🏞️ Paisajes"

          cards={
            categorias.paisajes
          }

          likes={
            likes
          }

          user={
            user
          }

          onToggleLike={
            toggleLike
          }

          onImageClick={
            (url) =>
              setFotoEnGrande(
                url
              )
          }

        />


        {/* ===================================================
            COMUNIDAD VACÍA
        =================================================== */}

        {posts.length === 0 && (

          <div
            className="
              text-center
              text-white
              py-5
            "
          >

            <h4>

              🌎 La comunidad está esperando sus primeros Spots

            </h4>


            <p className="opacity-75 mt-2">

              Cuando los usuarios compartan sus cards,
              aparecerán acá.

            </p>

          </div>

        )}


      </div>


      {/* =====================================================
          VISOR GRANDE
      ===================================================== */}

      {fotoEnGrande && (

        <div

          className="
            modal-foto-grande
            position-fixed
            top-0
            start-0
            w-100
            h-100
            d-flex
            align-items-center
            justify-content-center
          "

          style={{

            backgroundColor:
              'rgba(0, 0, 0, 0.92)',

            zIndex:
              99999,

            cursor:
              'zoom-out',

            padding:
              '20px'

          }}

          onClick={() =>
            setFotoEnGrande(
              null
            )
          }

        >


          <div

            className="
              position-relative
              text-center
            "

            onClick={
              (e) =>
                e.stopPropagation()
            }

            style={{

              maxWidth:
                '94vw',

              maxHeight:
                '90vh'

            }}

          >


            {/* =================================================
                CERRAR
            ================================================= */}

            <button

              type="button"

              className="
                btn
                btn-dark
                position-absolute
                top-0
                end-0
                m-2
                rounded-circle
              "

              onClick={() =>
                setFotoEnGrande(
                  null
                )
              }

              style={{

                width:
                  '40px',

                height:
                  '40px',

                fontSize:
                  '1.2rem',

                zIndex:
                  100000

              }}

            >

              ✕

            </button>


            {/* =================================================
                IMAGEN
            ================================================= */}

            <img

              src={
                fotoEnGrande
              }

              alt="Spot en grande"

              className="
                img-fluid
                rounded
                shadow-lg
              "

              style={{

                maxHeight:
                  '88vh',

                maxWidth:
                  '92vw',

                objectFit:
                  'contain'

              }}

            />


          </div>


        </div>

      )}


    </div>

  );

}


export default Comunidad;