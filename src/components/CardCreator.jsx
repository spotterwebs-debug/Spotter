import React, {
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  useNavigate,
  useLocation
} from 'react-router-dom';

import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

import { supabase } from '../supabaseClient';

import Swal from 'sweetalert2';

import './CardCreator.css';

import template from '../data/Template.json';


function CardCreator({
  fileFromAlbum,
  categoriaInicial = '',
  cardToEdit = null
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const fileFromCamera =
    location.state?.fileFromCamera;

  const challengeId =
    location.state?.challengeId;


  // =========================================================
  // CATEGORÍA SUGERIDA
  // =========================================================
  //
  // Si viene desde un álbum, dejamos esa categoría
  // preseleccionada.
  //
  // PERO:
  // el usuario igualmente verá SIEMPRE la pantalla
  // de selección de categoría antes del crop.
  // =========================================================

  const categoriaSugerida =
    cardToEdit?.categoria ||
    categoriaInicial ||
    location.state?.categoriaInicial ||
    '';


  // =========================================================
  // PASOS
  // =========================================================

  const [paso, setPaso] = useState(
    cardToEdit
      ? 'formulario'
      : categoriaSugerida
        ? 'seleccionar_foto'
        : 'cargando'
  );


  // =========================================================
  // FOTO
  // =========================================================

  const [previewUrl, setPreviewUrl] =
    useState(null);


  const [categoria, setCategoria] =
    useState(categoriaSugerida);


  const [crop, setCrop] =
    useState({
      x: 0,
      y: 0
    });


  const [zoom, setZoom] =
    useState(1);


  const [rotation, setRotation] =
    useState(0);


  const [
    croppedAreaPixels,
    setCroppedAreaPixels
  ] = useState(null);


  const [
    croppedImage,
    setCroppedImage
  ] = useState(
    cardToEdit?.original_url ||
    cardToEdit?.imagen_url ||
    null
  );


  // =========================================================
  // FORMULARIO
  // =========================================================

  const [
    formValues,
    setFormValues
  ] = useState({

    nombre:
      cardToEdit?.nombre || '',

    raza:
      cardToEdit?.raza || '',

    personalidad:
      cardToEdit?.personalidad || '',

    dato:
      cardToEdit?.dato || '',

    caracteristica:
      cardToEdit?.caracteristica || '',

    lugar:
      cardToEdit?.lugar || ''

  });


  // =========================================================
  // IA
  // =========================================================

  const [
    generandoSpot,
    setGenerandoSpot
  ] = useState(false);


  const [
    spotGenerado,
    setSpotGenerado
  ] = useState(null);


  const [
    originalUrl,
    setOriginalUrl
  ] = useState(
    cardToEdit?.original_url ||
    null
  );


  const [
    originalPath,
    setOriginalPath
  ] = useState(null);


  const [
    estadoGeneracion,
    setEstadoGeneracion
  ] = useState('');


  const [
    progresoGeneracion,
    setProgresoGeneracion
  ] = useState(0);


  // =========================================================
  // CUPO
  // =========================================================

  const [
    generacionesRestantes,
    setGeneracionesRestantes
  ] = useState(null);


  const [
    limiteDiario,
    setLimiteDiario
  ] = useState(10);


  const [
    planUsuario,
    setPlanUsuario
  ] = useState('free');


  const [
    cargandoCupo,
    setCargandoCupo
  ] = useState(true);


  // =========================================================
  // UTILIDADES
  // =========================================================

  const esperar = (ms) =>
    new Promise(
      (resolve) =>
        setTimeout(resolve, ms)
    );


  const obtenerFechaUruguay = () => {

    return new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          'America/Montevideo',

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit'
      }
    ).format(
      new Date()
    );

  };


  const handleVolver = () => {

    navigate(-1);

  };


  // =========================================================
  // CUPO DEL USUARIO
  // =========================================================

  const cargarCupo = async () => {

    try {

      setCargandoCupo(true);


      const {
        data: {
          user
        }
      } =
        await supabase.auth
          .getUser();


      if (!user) {

        setGeneracionesRestantes(0);

        return;

      }


      const {
        data: profile,
        error: profileError
      } =
        await supabase
          .from('profiles')
          .select(
            'plan, subscription_status, subscription_expires_at'
          )
          .eq(
            'id',
            user.id
          )
          .maybeSingle();


      if (profileError) {

        console.error(
          'Error consultando perfil:',
          profileError
        );

      }


      let esPlus = false;


      if (
        profile?.plan === 'plus' &&
        profile?.subscription_status ===
          'active'
      ) {

        if (
          !profile
            .subscription_expires_at
        ) {

          esPlus = true;

        } else {

          esPlus =
            new Date(
              profile
                .subscription_expires_at
            ).getTime() >
            Date.now();

        }

      }


      const limite =
        esPlus
          ? 50
          : 10;


      setPlanUsuario(
        esPlus
          ? 'plus'
          : 'free'
      );


      setLimiteDiario(
        limite
      );


      const fechaHoy =
        obtenerFechaUruguay();


      const {
        data: generaciones,
        error
      } =
        await supabase
          .from(
            'card_generations'
          )
          .select(
            'generation_number'
          )
          .eq(
            'user_id',
            user.id
          )
          .eq(
            'generation_date',
            fechaHoy
          );


      if (error) {

        console.error(
          'Error consultando generaciones:',
          error
        );

        return;

      }


      const usadas =
        generaciones?.length ||
        0;


      setGeneracionesRestantes(
        Math.max(
          0,
          limite - usadas
        )
      );

    } catch (error) {

      console.error(
        'Error cargando cupo:',
        error
      );

    } finally {

      setCargandoCupo(false);

    }

  };


  useEffect(() => {

    cargarCupo();

  }, []);


  // =========================================================
  // FOTO RECIBIDA
  // =========================================================

  useEffect(() => {

    if (
      fileFromAlbum &&
      (
        fileFromAlbum.size ||
        fileFromAlbum.name
      )
    ) {

      procesarArchivo(
        fileFromAlbum
      );

      return;

    }


    if (
      fileFromCamera &&
      (
        fileFromCamera.size ||
        fileFromCamera.name
      )
    ) {

      procesarArchivo(
        fileFromCamera
      );

      return;

    }


    if (cardToEdit) {

      setPaso(
        'formulario'
      );

    } else if (
      categoriaSugerida
    ) {

      setPaso(
        'seleccionar_foto'
      );

    }

  }, [
    fileFromAlbum,
    fileFromCamera
  ]);


  // =========================================================
  // HEIC / HEIF + COMPRESIÓN
  // =========================================================

  const procesarArchivo =
    async (file) => {

      try {

        Swal.fire({

          title:
            'Procesando...',

          allowOutsideClick:
            false,

          didOpen:
            () =>
              Swal.showLoading()

        });


        await esperar(200);


        let fileToProcess =
          file;


        // =====================================================
        // HEIC / HEIF
        // =====================================================

        if (
          file.type ===
            'image/heic' ||

          file.type ===
            'image/heif' ||

          file.name?.match(
            /\.(heic|heif)$/i
          )
        ) {

          const converted =
            await heic2any({

              blob:
                file,

              toType:
                'image/jpeg',

              quality:
                0.8

            });


          const convertedBlob =
            Array.isArray(
              converted
            )
              ? converted[0]
              : converted;


          const jpgFile =
            new File(

              [
                convertedBlob
              ],

              file.name.replace(
                /\.(heic|heif)$/i,
                '.jpg'
              ),

              {
                type:
                  'image/jpeg'
              }

            );


          fileToProcess =
            await imageCompression(

              jpgFile,

              {
                maxSizeMB:
                  0.2,

                maxWidthOrHeight:
                  800,

                useWebWorker:
                  true,

                initialQuality:
                  0.7
              }

            );

        } else {

          fileToProcess =
            await imageCompression(

              file,

              {
                maxSizeMB:
                  0.2,

                maxWidthOrHeight:
                  800,

                useWebWorker:
                  true,

                initialQuality:
                  0.7
              }

            );

        }


        const reader =
          new FileReader();


        reader.onload =
          (e) => {

            setPreviewUrl(
              e.target.result
            );


            setRotation(0);

            setCrop({
              x: 0,
              y: 0
            });

            setZoom(1);

            setCroppedAreaPixels(
              null
            );


            // =============================================
            // CAMBIO IMPORTANTE
            //
            // SIEMPRE preguntamos categoría.
            //
            // Aunque venga desde /album/perros.
            // =============================================

            setPaso(
              'categoria'
            );


            Swal.close();

          };


        reader.readAsDataURL(
          fileToProcess
        );

      } catch (error) {

        Swal.fire(

          'Error',

          error.message ||
            'Error procesando imagen',

          'error'

        );

      }

    };


  // =========================================================
  // FORMULARIO
  // =========================================================

  const handleInputChange =
    (e) => {

      const {
        name,
        value
      } =
        e.target;


      setFormValues(
        (prev) => ({

          ...prev,

          [name]:
            value

        })
      );

    };


  // =========================================================
  // RANDOM
  // =========================================================

  const handleRandom = () => {

    const lista =
      template[
        categoria
      ];


    if (
      !lista ||
      lista.length === 0
    ) {

      return;

    }


    const random =
      lista[
        Math.floor(
          Math.random() *
          lista.length
        )
      ];


    setFormValues(
      (prev) => ({

        ...prev,

        ...random

      })
    );

  };


  // =========================================================
  // SELECCIONAR CATEGORÍA
  // =========================================================

  const seleccionarCategoria =
    (nuevaCategoria) => {

      setCategoria(
        nuevaCategoria
      );


      // Limpia campos que podrían haber quedado
      // de otra categoría durante la creación.

      if (!cardToEdit) {

        setFormValues(
          (prev) => ({

            ...prev,

            raza:
              '',

            personalidad:
              '',

            caracteristica:
              '',

            lugar:
              '',

            dato:
              ''

          })
        );

      }

    };


  // =========================================================
  // CROP
  // =========================================================

  const onCropComplete =
    useCallback(

      (
        _,
        pixels
      ) => {

        setCroppedAreaPixels(
          pixels
        );

      },

      []

    );


  const createImage =
    (url) =>

      new Promise(

        (
          resolve,
          reject
        ) => {

          const image =
            new Image();


          image.addEventListener(
            'load',
            () =>
              resolve(image)
          );


          image.addEventListener(
            'error',
            reject
          );


          image.setAttribute(
            'crossOrigin',
            'anonymous'
          );


          image.src =
            url;

        }

      );


  // =========================================================
  // ROTACIÓN
  // =========================================================

  const getRotatedImage =
    async (
      imageSrc,
      rot = 0
    ) => {

      const image =
        await createImage(
          imageSrc
        );


      const canvas =
        document.createElement(
          'canvas'
        );


      const ctx =
        canvas.getContext(
          '2d'
        );


      const rotRad =
        (
          rot *
          Math.PI
        ) / 180;


      const bBoxWidth =

        Math.abs(
          Math.cos(
            rotRad
          ) *
          image.width
        )

        +

        Math.abs(
          Math.sin(
            rotRad
          ) *
          image.height
        );


      const bBoxHeight =

        Math.abs(
          Math.sin(
            rotRad
          ) *
          image.width
        )

        +

        Math.abs(
          Math.cos(
            rotRad
          ) *
          image.height
        );


      canvas.width =
        bBoxWidth;


      canvas.height =
        bBoxHeight;


      ctx.translate(

        bBoxWidth / 2,

        bBoxHeight / 2

      );


      ctx.rotate(
        rotRad
      );


      ctx.drawImage(

        image,

        -image.width / 2,

        -image.height / 2

      );


      return canvas.toDataURL(

        'image/jpeg',

        0.9

      );

    };


  // =========================================================
  // GENERAR RECORTE
  // =========================================================

  const generarImagenRecortada =
    async () => {

      try {

        if (
          !croppedAreaPixels
        ) {

          throw new Error(
            'Seleccioná el área de la foto.'
          );

        }


        Swal.fire({

          title:
            'Recortando...',

          allowOutsideClick:
            false,

          didOpen:
            () =>
              Swal.showLoading()

        });


        const rotatedImageSrc =
          await getRotatedImage(

            previewUrl,

            rotation

          );


        const image =
          await createImage(
            rotatedImageSrc
          );


        const canvas =
          document.createElement(
            'canvas'
          );


        const ctx =
          canvas.getContext(
            '2d'
          );


        canvas.width =
          croppedAreaPixels.width;


        canvas.height =
          croppedAreaPixels.height;


        ctx.drawImage(

          image,

          croppedAreaPixels.x,

          croppedAreaPixels.y,

          croppedAreaPixels.width,

          croppedAreaPixels.height,

          0,

          0,

          croppedAreaPixels.width,

          croppedAreaPixels.height

        );


        const imageData =
          canvas.toDataURL(

            'image/jpeg',

            0.8

          );


        setCroppedImage(
          imageData
        );


        setOriginalUrl(
          null
        );


        setOriginalPath(
          null
        );


        setSpotGenerado(
          null
        );


        Swal.close();


        setPaso(
          'formulario'
        );

      } catch (error) {

        Swal.fire(

          'Error',

          error.message ||
            'No se pudo procesar el recorte',

          'error'

        );

      }

    };


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const validarFormulario =
    () => {

      if (!categoria) {

        return 'Seleccioná una categoría.';

      }


      if (
        !formValues.nombre
          .trim()
      ) {

        return 'Ingresá un nombre.';

      }


      if (
        formValues.nombre
          .trim()
          .length > 24
      ) {

        return 'El nombre puede tener hasta 24 caracteres.';

      }


      // =====================================================
      // PERROS / GATOS / AVES
      // =====================================================

      if (
        [
          'perros',
          'gatos',
          'aves'
        ].includes(
          categoria
        )
      ) {

        if (
          !formValues.raza
            .trim()
        ) {

          return 'Ingresá la raza o especie.';

        }


        if (
          !formValues
            .personalidad
            .trim()
        ) {

          return 'Ingresá la personalidad.';

        }


        if (
          !formValues.dato
            .trim()
        ) {

          return 'Ingresá el Fun Fact.';

        }

      }


      // =====================================================
      // PLANTAS
      // =====================================================

      if (
        categoria ===
        'plantas'
      ) {

        if (
          !formValues.raza
            .trim()
        ) {

          return 'Ingresá la especie.';

        }


        if (
          !formValues
            .caracteristica
            .trim()
        ) {

          return 'Ingresá el rasgo destacado.';

        }


        if (
          !formValues.dato
            .trim()
        ) {

          return 'Ingresá el Fun Fact.';

        }

      }


      // =====================================================
      // PAISAJES
      // =====================================================

      if (
        categoria ===
        'paisajes'
      ) {

        if (
          !formValues.lugar
            .trim()
        ) {

          return 'Ingresá el lugar.';

        }


        if (
          !formValues.dato
            .trim()
        ) {

          return 'Ingresá el Fun Fact.';

        }

      }


      return null;

    };


  // =========================================================
  // SUBIR ORIGINAL A STORAGE
  // =========================================================

  const subirOriginalAStorage =
    async (userId) => {

      if (originalUrl) {

        return originalUrl;

      }


      if (!croppedImage) {

        throw new Error(
          'No hay una imagen preparada.'
        );

      }


      const response =
        await fetch(
          croppedImage
        );


      const blob =
        await response.blob();


      const extension =

        blob.type ===
        'image/png'

          ? 'png'

          : 'jpg';


      const path =

        `originales/${userId}/${Date.now()}.${extension}`;


      const {
        error
      } =
        await supabase.storage
          .from(
            'cards'
          )
          .upload(

            path,

            blob,

            {

              contentType:
                blob.type ||
                'image/jpeg',

              upsert:
                false

            }

          );


      if (error) {

        throw new Error(

          `No pudimos subir la foto: ${error.message}`

        );

      }


      const {
        data
      } =
        supabase.storage
          .from(
            'cards'
          )
          .getPublicUrl(
            path
          );


      setOriginalPath(
        path
      );


      setOriginalUrl(
        data.publicUrl
      );


      return data.publicUrl;

    };


  // =========================================================
  // PROMPT IA
  //
  // SOLO:
  // - categoría
  // - nombre
  // - diseño
  //
  // NO mandamos los textos largos.
  // =========================================================

  const construirPromptSpot =
    () => {

      const estilos = {

        perros:
          'vintage parchment, green brown gold, paw ornaments',

        gatos:
          'vintage parchment, burgundy purple gold, feline ornaments',

        aves:
          'vintage parchment, teal gold, feather ornaments',

        plantas:
          'vintage botanical parchment, olive green gold, leaf ornaments',

        paisajes:
          'vintage explorer parchment, deep blue gold, mountain ornaments'

      };


      if (
        !estilos[
          categoria
        ]
      ) {

        throw new Error(
          'Categoría inválida.'
        );

      }


      const categoriaTexto =
        categoria
          .toUpperCase();


      const nombre =
        formValues.nombre
          .trim();


      const prompt =

        `Vertical 2:3 premium trading card, ${estilos[categoria]}. ` +

        `Use reference photo, preserve subject. ` +

        `Top text exactly "${categoriaTexto}". ` +

        `Large ornate portrait. ` +

        `Ribbon below with exactly "${nombre}". ` +

        `Decorative icons and stars only. ` +

        `No other text, numbers, labels or words.`;


      console.log(
        'Prompt Spot:',
        prompt.length,
        prompt
      );


      if (
        prompt.length >
        400
      ) {

        throw new Error(
          `El prompt supera el límite (${prompt.length}/400).`
        );

      }


      return prompt;

    };


  // =========================================================
  // LEER ERROR EDGE FUNCTION
  // =========================================================

  const obtenerDetalleErrorFuncion =
    async (
      error,
      data
    ) => {

      if (
        data?.error
      ) {

        return data;

      }


      try {

        if (
          error?.context &&
          typeof error
            .context
            .json ===
            'function'
        ) {

          return await error
            .context
            .json();

        }

      } catch {

        // nada

      }


      return {

        error:
          error?.message ||
          'Error desconocido'

      };

    };


  // =========================================================
  // ESPERAR RESULTADO IA
  // =========================================================

  const esperarResultadoSpot =
    async (
      predictionId,
      generationId
    ) => {

      let intentosPolling =
        0;


      const etapas = [

        [
          15,
          '🎨 Preparando el diseño...'
        ],

        [
          28,
          '🖼️ Enmarcando tu captura...'
        ],

        [
          40,
          '📜 Preparando el estilo vintage...'
        ],

        [
          55,
          '✨ Trabajando los detalles...'
        ],

        [
          68,
          '🎴 Construyendo tu Spot...'
        ],

        [
          80,
          '🪄 Agregando los últimos detalles...'
        ],

        [
          90,
          '🔎 Revisando tu card...'
        ],

        [
          95,
          '✨ Ya casi está listo...'
        ]

      ];


      while (
        intentosPolling <
        60
      ) {

        intentosPolling +=
          1;


        const indice =
          Math.min(

            Math.floor(

              (
                intentosPolling -
                1
              ) / 2

            ),

            etapas.length -
            1

          );


        setProgresoGeneracion(
          (actual) =>
            Math.max(
              actual,
              etapas[
                indice
              ][0]
            )
        );


        setEstadoGeneracion(
          etapas[
            indice
          ][1]
        );


        await esperar(
          4000
        );


        const {
          data,
          error
        } =
          await supabase.functions
            .invoke(

              'check-card',

              {

                body: {

                  predictionId,

                  generationId

                }

              }

            );


        if (error) {

          const detalle =
            await obtenerDetalleErrorFuncion(

              error,

              data

            );


          throw new Error(

            detalle?.error ||
            'No pudimos consultar la generación.'

          );

        }


        if (
          data?.finished &&
          data?.status ===
            'succeeded'
        ) {

          const resultado =

            Array.isArray(
              data.output
            )

              ? data.output[0]

              : data.output;


          if (
            !resultado
          ) {

            throw new Error(
              'La IA terminó pero no devolvió una imagen.'
            );

          }


          setProgresoGeneracion(
            100
          );


          setEstadoGeneracion(
            '🎉 ¡Tu Spot está listo!'
          );


          await esperar(
            500
          );


          return resultado;

        }


        if (
          data?.finished &&
          (
            data?.status ===
              'failed' ||

            data?.status ===
              'canceled'
          )
        ) {

          throw new Error(

            data?.error ||
            'No pudimos crear tu Spot.'

          );

        }

      }


      throw new Error(
        'La generación está demorando demasiado.'
      );

    };


  // =========================================================
  // SPOTTER PLUS
  // =========================================================

  const mostrarSpotterPlus =
    async () => {

      await Swal.fire({

        icon:
          'info',

        title:
          '✨ Spotter Plus',

        html:

          planUsuario ===
          'free'

            ? `

              <p>
                Ya utilizaste tus
                <strong>10 Spots de hoy</strong>.
              </p>

              <p>
                Con
                <strong>Spotter Plus</strong>
                tenés hasta
                <strong>50 Spots por día</strong>.
              </p>

              <p>
                <strong>USD 7 al mes</strong>
              </p>

            `

            : `

              <p>
                Ya utilizaste tus
                <strong>50 Spots de hoy</strong>.
              </p>

              <p>
                Mañana tendrás nuevamente tus Spots disponibles.
              </p>

            `,

        confirmButtonText:
          'Entendido'

      });

    };


  // =========================================================
  // CREAR SPOT
  // =========================================================

  const crearSpot =
    async () => {

      const errorFormulario =
        validarFormulario();


      if (
        errorFormulario
      ) {

        await Swal.fire({

          icon:
            'warning',

          title:
            'Revisá la información',

          text:
            errorFormulario

        });


        return;

      }


      if (
        generacionesRestantes ===
        0
      ) {

        await mostrarSpotterPlus();

        return;

      }


      try {

        setGenerandoSpot(
          true
        );


        setSpotGenerado(
          null
        );


        setProgresoGeneracion(
          5
        );


        setEstadoGeneracion(
          '📸 Preparando tu captura...'
        );


        const {
          data: {
            session
          }
        } =
          await supabase.auth
            .getSession();


        if (
          !session?.user
        ) {

          await Swal.fire({

            icon:
              'info',

            title:
              'Iniciá sesión',

            text:
              'Tenés que iniciar sesión para crear un Spot.',

            confirmButtonText:
              'Ir al login'

          });


          navigate(
            '/login'
          );


          return;

        }


        const userId =
          session.user.id;


        setEstadoGeneracion(
          '☁️ Preparando la foto...'
        );


        const imageUrl =
          await subirOriginalAStorage(
            userId
          );


        const prompt =
          construirPromptSpot();


        setProgresoGeneracion(
          10
        );


        setEstadoGeneracion(
          `🎴 Creando tu Spot de ${categoria}...`
        );


        const {
          data,
          error
        } =
          await supabase.functions
            .invoke(

              'generate-card',

              {

                body: {

                  image:
                    imageUrl,

                  prompt,

                  categoria

                }

              }

            );


        if (error) {

          const detalle =
            await obtenerDetalleErrorFuncion(

              error,

              data

            );


          if (
            detalle?.limitReached
          ) {

            setGeneracionesRestantes(
              0
            );


            await mostrarSpotterPlus();


            return;

          }


          throw new Error(

            detalle?.error ||
            'No pudimos iniciar la creación.'

          );

        }


        if (
          !data?.success
        ) {

          if (
            data?.limitReached
          ) {

            setGeneracionesRestantes(
              0
            );


            await mostrarSpotterPlus();


            return;

          }


          throw new Error(

            data?.error ||
            'No pudimos iniciar la creación.'

          );

        }


        if (
          !data.predictionId
        ) {

          throw new Error(
            'No recibimos el identificador de la generación.'
          );

        }


        if (
          typeof data
            .generationsRemaining ===
          'number'
        ) {

          setGeneracionesRestantes(
            data
              .generationsRemaining
          );

        }


        if (
          typeof data
            .dailyLimit ===
          'number'
        ) {

          setLimiteDiario(
            data.dailyLimit
          );

        }


        if (
          data?.plan
        ) {

          setPlanUsuario(
            data.plan
          );

        }


        const resultado =
          await esperarResultadoSpot(

            data.predictionId,

            data.generationId

          );


        setSpotGenerado(
          resultado
        );


        setPaso(
          'resultado'
        );

      } catch (error) {

        console.error(
          'Error creando Spot:',
          error
        );


        await Swal.fire({

          icon:
            'error',

          title:
            'No pudimos crear tu Spot',

          text:
            error.message ||
            'Intentá nuevamente.'

        });

      } finally {

        setGenerandoSpot(
          false
        );


        setEstadoGeneracion(
          ''
        );


        setProgresoGeneracion(
          0
        );


        cargarCupo();

      }

    };


  // =========================================================
  // GUARDAR RESULTADO IA EN STORAGE
  // =========================================================

  const guardarSpotEnStorage =
    async (userId) => {

      if (
        !spotGenerado
      ) {

        throw new Error(
          'No hay un Spot generado.'
        );

      }


      const response =
        await fetch(
          spotGenerado
        );


      if (
        !response.ok
      ) {

        throw new Error(
          'No pudimos preparar el Spot para guardarlo.'
        );

      }


      const blob =
        await response.blob();


      const extension =

        blob.type ===
        'image/jpeg'

          ? 'jpg'

          : 'png';


      const path =

        `generadas/${userId}/${Date.now()}.${extension}`;


      const {
        error
      } =
        await supabase.storage
          .from(
            'cards'
          )
          .upload(

            path,

            blob,

            {

              contentType:
                blob.type ||
                'image/png',

              upsert:
                false

            }

          );


      if (error) {

        throw new Error(

          `No pudimos guardar el Spot: ${error.message}`

        );

      }


      const {
        data
      } =
        supabase.storage
          .from(
            'cards'
          )
          .getPublicUrl(
            path
          );


      return data.publicUrl;

    };


  // =========================================================
  // GUARDAR EN ÁLBUM
  // =========================================================

  const handleGuardarEnAlbum =
    async () => {

      try {

        if (
          !spotGenerado
        ) {

          return;

        }


        Swal.fire({

          title:
            'Guardando Spot...',

          allowOutsideClick:
            false,

          didOpen:
            () =>
              Swal.showLoading()

        });


        const {
          data: {
            session
          }
        } =
          await supabase.auth
            .getSession();


        if (
          !session?.user
        ) {

          throw new Error(
            'Tenés que iniciar sesión.'
          );

        }


        const userId =
          session.user.id;


        const imagenPermanente =
          await guardarSpotEnStorage(
            userId
          );


        // =====================================================
        // DATOS
        //
        // IMPORTANTE:
        // categoria = categoría ELEGIDA por el usuario.
        //
        // No importa desde qué álbum comenzó.
        // =====================================================

        const payload = {

          user_id:
            userId,

          nombre:
            formValues.nombre,

          categoria,

          raza:
            formValues.raza,

          personalidad:
            formValues.personalidad,

          caracteristica:
            formValues.caracteristica,

          lugar:
            formValues.lugar,

          dato:
            formValues.dato,

          imagen_url:
            imagenPermanente,

          original_url:
            originalUrl

        };


        // =====================================================
        // EDICIÓN
        // =====================================================

        if (
          cardToEdit
        ) {

          const {
            error
          } =
            await supabase
              .from(
                'cards'
              )
              .update(
                payload
              )
              .eq(
                'id',
                cardToEdit.id
              );


          if (
            error
          ) {

            throw error;

          }


          Swal.close();


          await Swal.fire({

            icon:
              'success',

            title:
              '¡Spot actualizado! 🎉',

            timer:
              1400,

            showConfirmButton:
              false

          });


          navigate(
            `/album/${categoria}`
          );


          return;

        }


        // =====================================================
        // NUEVA CARD
        // SIEMPRE PRIVADA
        // =====================================================

        const nuevaCardPayload = {

          ...payload,

          is_public:
            false,

          publica:
            false

        };


        const {
          data: nuevaCard,
          error: cardError
        } =
          await supabase
            .from(
              'cards'
            )
            .insert([
              nuevaCardPayload
            ])
            .select()
            .single();


        if (
          cardError
        ) {

          throw cardError;

        }


        // =====================================================
        // DESAFÍO
        // =====================================================

        if (
          challengeId
        ) {

          const {
            error:
              challengeError
          } =
            await supabase
              .from(
                'user_challenges'
              )
              .insert([

                {

                  user_id:
                    userId,

                  challenge_id:
                    challengeId,

                  card_id:
                    nuevaCard.id,

                  completed_at:
                    new Date()
                      .toISOString()

                }

              ]);


          if (
            challengeError
          ) {

            throw challengeError;

          }


          Swal.close();


          await Swal.fire({

            icon:
              'success',

            title:
              '¡Desafío completado! 🏆',

            text:
              `Tu Spot se guardó en el álbum de ${categoria} y ganaste el listón.`,

            timer:
              1800,

            showConfirmButton:
              false

          });


          navigate(
            '/premios'
          );


          return;

        }


        Swal.close();


        await Swal.fire({

          icon:
            'success',

          title:
            '¡Spot guardado! 🎉',

          text:
            `Se agregó a tu álbum de ${categoria}.`,

          timer:
            1600,

          showConfirmButton:
            false

        });


        // =====================================================
        // REDIRECCIÓN
        //
        // Va al álbum de la categoría que eligió.
        // =====================================================

        navigate(
          `/album/${categoria}`
        );

      } catch (error) {

        Swal.fire(

          'Error',

          error.message ||
            'No pudimos guardar el Spot.',

          'error'

        );

      }

    };


  // =========================================================
  // ELIMINAR RESULTADO
  // =========================================================

  const handleEliminarSpot =
    async () => {

      const {
        isConfirmed
      } =
        await Swal.fire({

          icon:
            'warning',

          title:
            '¿Eliminar este Spot?',

          text:
            'La generación igualmente contará dentro de tu límite diario.',

          showCancelButton:
            true,

          confirmButtonText:
            'Sí, eliminar',

          cancelButtonText:
            'Volver'

        });


      if (
        !isConfirmed
      ) {

        return;

      }


      if (
        originalPath &&
        !cardToEdit
      ) {

        try {

          await supabase.storage
            .from(
              'cards'
            )
            .remove([
              originalPath
            ]);

        } catch (error) {

          console.error(
            'Error borrando original:',
            error
          );

        }

      }


      setSpotGenerado(
        null
      );


      setOriginalUrl(

        cardToEdit
          ?.original_url ||
        null

      );


      setOriginalPath(
        null
      );


      setPaso(
        'formulario'
      );

    };


  // =========================================================
  // BANNER CUPO
  // =========================================================

  const renderCupo =
    () => {

      if (
        cargandoCupo
      ) {

        return (

          <div
            className="
              alert
              alert-dark
              text-center
              mt-3
              mb-3
            "
          >

            <strong>
              ✨ Spotter
            </strong>

            <div className="small mt-1">
              Consultando tus Spots disponibles...
            </div>

          </div>

        );

      }


      const esPlus =
        planUsuario ===
        'plus';


      return (

        <div

          className={`alert ${
            esPlus
              ? 'alert-warning'
              : 'alert-info'
          } text-center mt-3 mb-3 shadow-sm`}

        >

          <div className="fw-bold">

            {esPlus
              ? '⭐ Spotter Plus'
              : '✨ Plan Free'}

          </div>


          <div className="mt-1">

            <strong>
              {limiteDiario}
            </strong>

            {' '}Spots diarios

          </div>


          <div className="small mt-1">

            Te quedan{' '}

            <strong>
              {generacionesRestantes}
            </strong>

            {' '}Spots hoy

          </div>

        </div>

      );

    };


  // =========================================================
  // VISTA
  // =========================================================

  return (

    <div
      className="
        card-creator-container
        container
        my-4
        text-white
      "
    >


      {/* =====================================================
          SELECCIONAR FOTO
      ===================================================== */}

      {paso ===
        'seleccionar_foto' && (

        <div
          className="
            category-card
            text-center
            p-5
          "
        >

          <div className="category-header">

            <div className="category-icon">

              📸

            </div>


            <h2>

              Subí tu foto

            </h2>


            <p>

              Elegí una imagen para crear tu nuevo Spot.

            </p>

          </div>


          {/* CUPO */}

          {renderCupo()}


          <div className="my-4">

            <input

              type="file"

              accept="image/*"

              id="file-upload-challenge"

              className="d-none"

              onChange={(e) => {

                if (
                  e.target.files &&
                  e.target.files[0]
                ) {

                  procesarArchivo(
                    e.target.files[0]
                  );

                }

              }}

            />


            <label

              htmlFor="file-upload-challenge"

              className="
                btn
                btn-warning
                btn-lg
                fw-bold
                px-4
                py-3
              "

              style={{
                cursor:
                  'pointer'
              }}

            >

              📁 Elegir foto

            </label>

          </div>


          <button

            type="button"

            className="
              btn
              btn-outline-danger
              mt-3
            "

            onClick={
              handleVolver
            }

          >

            ← Cancelar

          </button>

        </div>

      )}


      {/* =====================================================
          CATEGORÍA
      ===================================================== */}

      {paso ===
        'categoria' && (

        <div className="category-card">

          <div className="category-header">

            <div className="category-icon">

              🎴

            </div>


            <h2>

              ¿Qué estás spoteando?

            </h2>


            <p>

              Elegí la categoría correcta.
              La IA usará esta selección para diseñar tu card.

            </p>

          </div>


          {/* CUPO */}

          {renderCupo()}


          {/* FOTO PEQUEÑA */}

          {previewUrl && (

            <div className="text-center mb-4">

              <img

                src={previewUrl}

                alt="Foto seleccionada"

                style={{

                  width:
                    '120px',

                  height:
                    '120px',

                  objectFit:
                    'cover',

                  borderRadius:
                    '18px',

                  boxShadow:
                    '0 6px 18px rgba(0,0,0,.25)'

                }}

              />

            </div>

          )}


          <div className="category-grid">

            {[
              [
                'perros',
                '🐶',
                'Perros'
              ],
              [
                'gatos',
                '🐱',
                'Gatos'
              ],
              [
                'aves',
                '🐦',
                'Aves'
              ],
              [
                'plantas',
                '🌿',
                'Plantas'
              ],
              [
                'paisajes',
                '🏞️',
                'Paisajes'
              ]
            ].map(

              ([
                value,
                icon,
                label
              ]) => (

                <button

                  type="button"

                  key={value}

                  className={`category-option ${
                    categoria ===
                    value
                      ? 'active'
                      : ''
                  }`}

                  onClick={() =>
                    seleccionarCategoria(
                      value
                    )
                  }

                >

                  {icon}{' '}

                  <span>

                    {label}

                  </span>

                </button>

              )

            )}

          </div>


          {categoria && (

            <div
              className="
                alert
                alert-success
                text-center
                mt-4
              "
            >

              La IA creará una card de{' '}

              <strong>
                {categoria}
              </strong>

              .

            </div>

          )}


          <button

            type="button"

            className="continue-btn"

            disabled={
              !categoria
            }

            onClick={() =>
              setPaso(
                'crop'
              )
            }

          >

            Continuar →

          </button>

        </div>

      )}


      {/* =====================================================
          CROP
      ===================================================== */}

      {paso ===
        'crop' && (

        <div className="cropper-container-box">

          <Cropper

            image={
              previewUrl
            }

            crop={
              crop
            }

            zoom={
              zoom
            }

            rotation={
              rotation
            }

            aspect={
              3 / 4
            }

            onCropChange={
              setCrop
            }

            onZoomChange={
              setZoom
            }

            onRotationChange={
              setRotation
            }

            onCropComplete={
              onCropComplete
            }

          />


          <div
            className="
              cropper-floating-buttons
              d-flex
              gap-2
              flex-wrap
              justify-content-center
            "
          >

            <button

              type="button"

              className="
                btn
                btn-secondary
              "

              onClick={() =>
                setRotation(
                  (prev) =>
                    (
                      prev -
                      90
                    ) %
                    360
                )
              }

            >

              ↺ Girar Izquierda

            </button>


            <button

              type="button"

              className="
                btn
                btn-secondary
              "

              onClick={() =>
                setRotation(
                  (prev) =>
                    (
                      prev +
                      90
                    ) %
                    360
                )
              }

            >

              ↻ Girar Derecha

            </button>


            <button

              type="button"

              className="
                btn
                btn-warning
              "

              onClick={
                generarImagenRecortada
              }

            >

              Cortar y continuar

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      {paso ===
        'formulario' && (

        <div
          className="
            row
            g-4
            justify-content-center
          "
        >

          {/* FOTO */}

          <div className="col-md-5">

            <img

              src={
                croppedImage
              }

              className="
                img-fluid
                rounded
              "

              alt="Vista previa"

            />


            {/* CATEGORÍA */}

            <div
              className="
                text-center
                mt-3
              "
            >

              <span
                className="
                  badge
                  bg-warning
                  text-dark
                  px-3
                  py-2
                  text-capitalize
                "
              >

                {categoria}

              </span>

            </div>


            {/* CUPO */}

            {renderCupo()}

          </div>


          {/* DATOS */}

          <div
            className="
              col-md-7
              bg-dark-card
              p-4
              rounded-4
            "
          >

            <h4 className="mb-3">

              📋 Información del Spot

            </h4>


            <button

              type="button"

              className="random-btn"

              onClick={
                handleRandom
              }

              disabled={
                generandoSpot
              }

            >

              🎲 Completar al azar

            </button>


            {/* =================================================
                PERROS / GATOS / AVES
            ================================================= */}

            {[
              'perros',
              'gatos',
              'aves'
            ].includes(
              categoria
            ) && (

              <>

                <label className="field-title">

                  📝 Nombre

                </label>


                <input

                  name="nombre"

                  maxLength={
                    24
                  }

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.nombre
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  🐾 Raza / Especie

                </label>


                <input

                  name="raza"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.raza
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  😊 Personalidad

                </label>


                <input

                  name="personalidad"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues
                      .personalidad
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  ✨ Fun Fact

                </label>


                <textarea

                  name="dato"

                  rows="3"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.dato
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />

              </>

            )}


            {/* =================================================
                PLANTAS
            ================================================= */}

            {categoria ===
              'plantas' && (

              <>

                <label className="field-title">

                  📝 Nombre

                </label>


                <input

                  name="nombre"

                  maxLength={
                    24
                  }

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.nombre
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  🌿 Especie

                </label>


                <input

                  name="raza"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.raza
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  🍃 Rasgo destacado

                </label>


                <input

                  name="caracteristica"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues
                      .caracteristica
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  ✨ Fun Fact

                </label>


                <textarea

                  name="dato"

                  rows="3"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.dato
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />

              </>

            )}


            {/* =================================================
                PAISAJES
            ================================================= */}

            {categoria ===
              'paisajes' && (

              <>

                <label className="field-title">

                  📝 Nombre

                </label>


                <input

                  name="nombre"

                  maxLength={
                    24
                  }

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.nombre
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  📍 Lugar

                </label>


                <input

                  name="lugar"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.lugar
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />


                <label className="field-title">

                  ✨ Fun Fact

                </label>


                <textarea

                  name="dato"

                  rows="3"

                  className="
                    form-control
                    mb-3
                  "

                  value={
                    formValues.dato
                  }

                  onChange={
                    handleInputChange
                  }

                  disabled={
                    generandoSpot
                  }

                />

              </>

            )}


            {/* =================================================
                GENERANDO
            ================================================= */}

            {generandoSpot && (

              <div
                className="
                  text-center
                  mt-4
                  p-3
                "
              >

                <div
                  className="
                    spinner-border
                    text-warning
                    mb-3
                  "
                  role="status"
                />


                <h5>

                  {estadoGeneracion ||
                    '✨ Creando tu Spot...'}

                </h5>


                <div
                  className="
                    progress
                    mt-3
                  "
                >

                  <div

                    className="
                      progress-bar
                      progress-bar-striped
                      progress-bar-animated
                    "

                    role="progressbar"

                    style={{

                      width:
                        `${progresoGeneracion}%`

                    }}

                  >

                    {progresoGeneracion}%

                  </div>

                </div>


                <small
                  className="
                    d-block
                    mt-3
                  "
                >

                  No cierres esta pantalla.
                  La IA está preparando tu card.

                </small>

              </div>

            )}


            {!generandoSpot && (

              <button

                type="button"

                className="
                  btn
                  btn-warning
                  w-100
                  mt-4
                  fw-bold
                  py-3
                "

                onClick={
                  crearSpot
                }

              >

                ✨ Crear Spot

              </button>

            )}


            <button

              type="button"

              className="
                btn
                btn-outline-danger
                w-100
                mt-2
              "

              onClick={
                handleVolver
              }

              disabled={
                generandoSpot
              }

            >

              ← Cancelar

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          RESULTADO
      ===================================================== */}

      {paso ===
        'resultado' &&
        spotGenerado && (

        <div
          className="
            row
            g-4
            justify-content-center
          "
        >

          <div
            className="
              col-md-6
              text-center
            "
          >

            <div className="mb-3">

              <span
                className="
                  badge
                  bg-warning
                  text-dark
                  px-3
                  py-2
                "
              >

                ✨ TU NUEVO SPOT · {categoria.toUpperCase()}

              </span>

            </div>


            <img

              src={
                spotGenerado
              }

              alt="Trading Card Spot"

              className="
                img-fluid
                rounded-4
                shadow-lg
              "

              style={{
                maxHeight:
                  '760px'
              }}

            />


            {/* CUPO */}

            {renderCupo()}


            <button

              type="button"

              className="
                btn
                btn-success
                w-100
                mt-4
                fw-bold
                py-3
              "

              onClick={
                handleGuardarEnAlbum
              }

            >

              {challengeId
                ? '🏆 Guardar Spot y completar desafío'
                : `💾 Guardar en álbum de ${categoria}`}

            </button>


            <button

              type="button"

              className="
                btn
                btn-outline-danger
                w-100
                mt-2
              "

              onClick={
                handleEliminarSpot
              }

            >

              🗑️ Eliminar

            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default CardCreator;