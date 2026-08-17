import {
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  useNavigate,
  useLocation
} from 'react-router-dom';

import { supabase } from '../../supabaseClient';

import '../CardCreator.css';

import PhotoStep from './PhotoStep';
import CategoryStep from './CategoryStep';
import CropStep from './CropStep';
import FormStep from './FormStep';
import ResultStep from './ResultStep';

import {
  PASOS_CARD_CREATOR
} from './cardCreatorConstants';

import {
  obtenerCategoriaSugerida,
  crearFormValuesIniciales,
  obtenerPasoInicial,
  limpiarCamposCategoria
} from './cardCreatorHelpers';

import {
  validarFormulario,
  obtenerDatosRandom
} from './formUtils';

import {
  procesarImagen,
  fileToDataUrl
} from './imageProcessingService';

import {
  generarImagenRecortada
} from './cropService';

import {
  construirPromptSpot
} from './aiUtils';

import {
  iniciarGeneracionSpot,
  esperarResultadoSpot
} from './aiService';

import {
  obtenerCupoUsuario
} from './quotaService';

import {
  subirOriginalAStorage,
  guardarSpotEnStorage,
  eliminarArchivoStorage
} from './storageService';

import {
  crearPayloadCard,
  actualizarCard,
  crearCard,
  registrarDesafioCompletado
} from './cardService';

import {
  mostrarProcesandoImagen,
  mostrarRecortandoImagen,
  mostrarGuardandoSpot,
  cerrarAlerta,
  mostrarError,
  mostrarAdvertenciaFormulario,
  mostrarLoginRequerido,
  mostrarSpotterPlus,
  mostrarSpotActualizado,
  mostrarSpotGuardado,
  mostrarDesafioCompletado,
  confirmarEliminarSpot
} from './spotterAlerts';


function CardCreator({
  fileFromAlbum,
  categoriaInicial = '',
  cardToEdit = null
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  // =========================================================
  // DATOS RECIBIDOS
  // =========================================================

  const fileFromCamera =
    location.state?.fileFromCamera;

  const challengeId =
    location.state?.challengeId;


  const categoriaSugerida =
    obtenerCategoriaSugerida({
      cardToEdit,
      categoriaInicial,
      location
    });


  // =========================================================
  // PASO
  // =========================================================

  const [paso, setPaso] =
    useState(() =>
      obtenerPasoInicial({
        cardToEdit,
        categoriaSugerida
      })
    );


  // =========================================================
  // FOTO
  // =========================================================

  const [
    previewUrl,
    setPreviewUrl
  ] =
    useState(null);


  const [
    categoria,
    setCategoria
  ] =
    useState(
      categoriaSugerida
    );


  const [
    crop,
    setCrop
  ] =
    useState({
      x: 0,
      y: 0
    });


  const [
    zoom,
    setZoom
  ] =
    useState(1);


  const [
    rotation,
    setRotation
  ] =
    useState(0);


  const [
    croppedAreaPixels,
    setCroppedAreaPixels
  ] =
    useState(null);


  const [
    croppedImage,
    setCroppedImage
  ] =
    useState(
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
  ] =
    useState(() =>
      crearFormValuesIniciales(
        cardToEdit
      )
    );


  // =========================================================
  // IA
  // =========================================================

  const [
    generandoSpot,
    setGenerandoSpot
  ] =
    useState(false);


  const [
    spotGenerado,
    setSpotGenerado
  ] =
    useState(null);


  const [
    originalUrl,
    setOriginalUrl
  ] =
    useState(
      cardToEdit?.original_url ||
      null
    );


  const [
    originalPath,
    setOriginalPath
  ] =
    useState(null);


  const [
    estadoGeneracion,
    setEstadoGeneracion
  ] =
    useState('');


  const [
    progresoGeneracion,
    setProgresoGeneracion
  ] =
    useState(0);


  // =========================================================
  // CUPO
  // =========================================================

  const [
    generacionesRestantes,
    setGeneracionesRestantes
  ] =
    useState(null);


  const [
    limiteDiario,
    setLimiteDiario
  ] =
    useState(10);


  const [
    planUsuario,
    setPlanUsuario
  ] =
    useState('free');


  const [
    cargandoCupo,
    setCargandoCupo
  ] =
    useState(true);


  // =========================================================
  // UTILIDADES
  // =========================================================

  const esperar = (ms) =>
    new Promise(
      (resolve) =>
        setTimeout(resolve, ms)
    );


  const handleVolver = () => {
    navigate(-1);
  };


  // =========================================================
  // CUPO
  // =========================================================

  const cargarCupo =
    async () => {
      try {
        setCargandoCupo(true);

        const cupo =
          await obtenerCupoUsuario();

        setPlanUsuario(
          cupo.planUsuario
        );

        setLimiteDiario(
          cupo.limiteDiario
        );

        setGeneracionesRestantes(
          cupo.generacionesRestantes
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
  // PROCESAR FOTO
  // =========================================================

  const procesarArchivo =
    async (file) => {
      try {
        mostrarProcesandoImagen();

        await esperar(200);

        const archivoProcesado =
          await procesarImagen(
            file
          );

        const preview =
          await fileToDataUrl(
            archivoProcesado
          );

        setPreviewUrl(
          preview
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

        setPaso(
          PASOS_CARD_CREATOR.CATEGORIA
        );

        cerrarAlerta();

      } catch (error) {
        cerrarAlerta();

        await mostrarError({
          message:
            error.message ||
            'Error procesando imagen'
        });
      }
    };


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
        PASOS_CARD_CREATOR.FORMULARIO
      );

    } else if (
      categoriaSugerida
    ) {
      setPaso(
        PASOS_CARD_CREATOR.SELECCIONAR_FOTO
      );
    }

  }, [
    fileFromAlbum,
    fileFromCamera
  ]);


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
          [name]: value
        })
      );
    };


  // =========================================================
  // RANDOM
  // =========================================================

  const handleRandom = () => {
    const random =
      obtenerDatosRandom(
        categoria
      );

    if (!random) {
      return;
    }

    setFormValues(
      (prev) => ({
        ...prev,
        ...random
      })
    );
  };


  // =========================================================
  // CATEGORÍA
  // =========================================================

  const seleccionarCategoria =
    (nuevaCategoria) => {
      setCategoria(
        nuevaCategoria
      );

      if (!cardToEdit) {
        setFormValues(
          (prev) =>
            limpiarCamposCategoria(
              prev
            )
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


  const handleGenerarImagenRecortada =
    async () => {
      try {
        mostrarRecortandoImagen();

        const imageData =
          await generarImagenRecortada({
            previewUrl,
            rotation,
            croppedAreaPixels
          });

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

        cerrarAlerta();

        setPaso(
          PASOS_CARD_CREATOR.FORMULARIO
        );

      } catch (error) {
        cerrarAlerta();

        await mostrarError({
          message:
            error.message ||
            'No se pudo procesar el recorte'
        });
      }
    };


  // =========================================================
  // CREAR SPOT
  // =========================================================

  const crearSpot =
    async () => {
      const errorFormulario =
        validarFormulario(
          categoria,
          formValues
        );


      if (errorFormulario) {
        await mostrarAdvertenciaFormulario(
          errorFormulario
        );

        return;
      }


      if (
        generacionesRestantes === 0
      ) {
        await mostrarSpotterPlus({
          planUsuario
        });

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


        if (!session?.user) {
          await mostrarLoginRequerido();

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


        const original =
          await subirOriginalAStorage({
            userId,
            croppedImage,
            originalUrl
          });


        setOriginalUrl(
          original.publicUrl
        );


        if (original.path) {
          setOriginalPath(
            original.path
          );
        }


        const prompt =
          construirPromptSpot(
            categoria,
            formValues.nombre
          );


        setProgresoGeneracion(
          10
        );


        setEstadoGeneracion(
          `🎴 Creando tu Spot de ${categoria}...`
        );


        const data =
          await iniciarGeneracionSpot({
            imageUrl:
              original.publicUrl,

            prompt,

            categoria
          });


        if (!data?.success) {
          if (
            data?.limitReached
          ) {
            setGeneracionesRestantes(
              0
            );

            await mostrarSpotterPlus({
              planUsuario
            });

            return;
          }

          throw new Error(
            data?.error ||
            'No pudimos iniciar la creación.'
          );
        }


        if (
          typeof data
            .generationsRemaining ===
          'number'
        ) {
          setGeneracionesRestantes(
            data.generationsRemaining
          );
        }


        if (
          typeof data.dailyLimit ===
          'number'
        ) {
          setLimiteDiario(
            data.dailyLimit
          );
        }


        if (data?.plan) {
          setPlanUsuario(
            data.plan
          );
        }


        const resultado =
          await esperarResultadoSpot({
            predictionId:
              data.predictionId,

            generationId:
              data.generationId,

            onProgress:
              (progreso) =>
                setProgresoGeneracion(
                  (actual) =>
                    Math.max(
                      actual,
                      progreso
                    )
                ),

            onStatus:
              setEstadoGeneracion
          });


        setSpotGenerado(
          resultado
        );


        setPaso(
          PASOS_CARD_CREATOR.RESULTADO
        );

      } catch (error) {
        console.error(
          'Error creando Spot:',
          error
        );

        await mostrarError({
          title:
            'No pudimos crear tu Spot',

          message:
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
  // GUARDAR EN ÁLBUM
  // =========================================================

  const handleGuardarEnAlbum =
    async () => {
      try {
        if (!spotGenerado) {
          return;
        }


        mostrarGuardandoSpot();


        const {
          data: {
            session
          }
        } =
          await supabase.auth
            .getSession();


        if (!session?.user) {
          throw new Error(
            'Tenés que iniciar sesión.'
          );
        }


        const userId =
          session.user.id;


        const spotGuardado =
          await guardarSpotEnStorage({
            userId,
            spotGenerado
          });


        const payload =
          crearPayloadCard({
            userId,

            formValues,

            categoria,

            imagenUrl:
              spotGuardado.publicUrl,

            originalUrl
          });


        // =====================================================
        // EDICIÓN
        // =====================================================

        if (cardToEdit) {
          await actualizarCard({
            cardId:
              cardToEdit.id,

            payload
          });

          cerrarAlerta();

          await mostrarSpotActualizado();

          navigate(
            `/album/${categoria}`
          );

          return;
        }


        // =====================================================
        // NUEVA CARD
        // =====================================================

        const nuevaCard =
          await crearCard({
            payload
          });


        // =====================================================
        // DESAFÍO
        // =====================================================

        if (challengeId) {
          await registrarDesafioCompletado({
            userId,

            challengeId,

            cardId:
              nuevaCard.id
          });

          cerrarAlerta();

          await mostrarDesafioCompletado({
            categoria
          });

          navigate(
            '/premios'
          );

          return;
        }


        cerrarAlerta();

        await mostrarSpotGuardado({
          categoria
        });


        navigate(
          `/album/${categoria}`
        );

      } catch (error) {
        cerrarAlerta();

        await mostrarError({
          message:
            error.message ||
            'No pudimos guardar el Spot.'
        });
      }
    };


  // =========================================================
  // ELIMINAR SPOT
  // =========================================================

  const handleEliminarSpot =
    async () => {
      const {
        isConfirmed
      } =
        await confirmarEliminarSpot();


      if (!isConfirmed) {
        return;
      }


      if (
        originalPath &&
        !cardToEdit
      ) {
        try {
          await eliminarArchivoStorage(
            originalPath
          );

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
        cardToEdit?.original_url ||
        null
      );


      setOriginalPath(
        null
      );


      setPaso(
        PASOS_CARD_CREATOR.FORMULARIO
      );
    };


  // =========================================================
  // VISTA
  // =========================================================

  return (
    <div className="card-creator-container container my-4 text-white">

      {paso ===
        PASOS_CARD_CREATOR.SELECCIONAR_FOTO && (

        <PhotoStep
          cargandoCupo={
            cargandoCupo
          }

          planUsuario={
            planUsuario
          }

          limiteDiario={
            limiteDiario
          }

          generacionesRestantes={
            generacionesRestantes
          }

          onSeleccionarArchivo={
            procesarArchivo
          }

          onCancelar={
            handleVolver
          }
        />

      )}


      {paso ===
        PASOS_CARD_CREATOR.CATEGORIA && (

        <CategoryStep
          previewUrl={
            previewUrl
          }

          categoria={
            categoria
          }

          seleccionarCategoria={
            seleccionarCategoria
          }

          cargandoCupo={
            cargandoCupo
          }

          planUsuario={
            planUsuario
          }

          limiteDiario={
            limiteDiario
          }

          generacionesRestantes={
            generacionesRestantes
          }

          onContinuar={() =>
            setPaso(
              PASOS_CARD_CREATOR.CROP
            )
          }
        />

      )}


      {paso ===
        PASOS_CARD_CREATOR.CROP && (

        <CropStep
          previewUrl={
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

          setCrop={
            setCrop
          }

          setZoom={
            setZoom
          }

          setRotation={
            setRotation
          }

          onCropComplete={
            onCropComplete
          }

          onGenerarRecorte={
            handleGenerarImagenRecortada
          }
        />

      )}


      {paso ===
        PASOS_CARD_CREATOR.FORMULARIO && (

        <FormStep
          croppedImage={
            croppedImage
          }

          categoria={
            categoria
          }

          formValues={
            formValues
          }

          handleInputChange={
            handleInputChange
          }

          handleRandom={
            handleRandom
          }

          generandoSpot={
            generandoSpot
          }

          estadoGeneracion={
            estadoGeneracion
          }

          progresoGeneracion={
            progresoGeneracion
          }

          cargandoCupo={
            cargandoCupo
          }

          planUsuario={
            planUsuario
          }

          limiteDiario={
            limiteDiario
          }

          generacionesRestantes={
            generacionesRestantes
          }

          onCrearSpot={
            crearSpot
          }

          onCancelar={
            handleVolver
          }
        />

      )}


      {paso ===
        PASOS_CARD_CREATOR.RESULTADO &&
        spotGenerado && (

        <ResultStep
          categoria={
            categoria
          }

          spotGenerado={
            spotGenerado
          }

          challengeId={
            challengeId
          }

          cargandoCupo={
            cargandoCupo
          }

          planUsuario={
            planUsuario
          }

          limiteDiario={
            limiteDiario
          }

          generacionesRestantes={
            generacionesRestantes
          }

          onGuardar={
            handleGuardarEnAlbum
          }

          onEliminar={
            handleEliminarSpot
          }
        />

      )}

    </div>
  );
}


export default CardCreator;