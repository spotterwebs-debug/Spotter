// COMPONENTE PRINCIPAL
export { default as CardCreator } from './CardCreator';


// PASOS VISUALES
export { default as PhotoStep } from './PhotoStep';
export { default as CategoryStep } from './CategoryStep';
export { default as CropStep } from './CropStep';
export { default as FormStep } from './FormStep';
export { default as ResultStep } from './ResultStep';


// FORMULARIOS
export { default as AnimalForm } from './AnimalForm';
export { default as PlantForm } from './PlantForm';
export { default as LandscapeForm } from './LandscapeForm';


// COMPONENTES
export { default as CupoBanner } from './CupoBanner';


// CONSTANTES
export {
  CATEGORIAS,
  CATEGORIAS_ANIMALES,
  FORM_VALUES_INICIALES,
  PASOS_CARD_CREATOR,
  LIMITES_PLAN,
  PLANES
} from './cardCreatorConstants';


// HELPERS
export {
  obtenerCategoriaSugerida,
  crearFormValuesIniciales,
  obtenerPasoInicial,
  limpiarCamposCategoria
} from './cardCreatorHelpers';


// FORM
export {
  validarFormulario,
  obtenerDatosRandom
} from './formUtils';


// IMÁGENES
export {
  createImage,
  getRotatedImage
} from './imageUtils';

export {
  procesarImagen,
  fileToDataUrl
} from './imageProcessingService';

export {
  generarImagenRecortada
} from './cropService';


// IA
export {
  construirPromptSpot
} from './aiUtils';

export {
  obtenerDetalleErrorFuncion,
  iniciarGeneracionSpot,
  esperarResultadoSpot
} from './aiService';


// CUPO
export {
  obtenerFechaUruguay,
  obtenerCupoUsuario
} from './quotaService';


// STORAGE
export {
  subirOriginalAStorage,
  guardarSpotEnStorage,
  eliminarArchivoStorage
} from './storageService';


// CARDS
export {
  actualizarCard,
  crearCard,
  registrarDesafioCompletado,
  crearPayloadCard
} from './cardService';


// ALERTAS
export {
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