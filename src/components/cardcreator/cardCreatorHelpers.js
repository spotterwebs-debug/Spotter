import {
  FORM_VALUES_INICIALES,
  PASOS_CARD_CREATOR
} from './cardCreatorConstants';


export const obtenerCategoriaSugerida = ({
  cardToEdit,
  categoriaInicial,
  location
}) => {
  return (
    cardToEdit?.categoria ||
    categoriaInicial ||
    location?.state?.categoriaInicial ||
    ''
  );
};


export const crearFormValuesIniciales = (
  cardToEdit
) => {
  if (!cardToEdit) {
    return {
      ...FORM_VALUES_INICIALES
    };
  }

  return {
    nombre:
      cardToEdit.nombre || '',

    raza:
      cardToEdit.raza || '',

    personalidad:
      cardToEdit.personalidad || '',

    dato:
      cardToEdit.dato || '',

    caracteristica:
      cardToEdit.caracteristica || '',

    lugar:
      cardToEdit.lugar || ''
  };
};


export const obtenerPasoInicial = ({
  cardToEdit,
  categoriaSugerida
}) => {
  if (cardToEdit) {
    return PASOS_CARD_CREATOR.FORMULARIO;
  }

  if (categoriaSugerida) {
    return PASOS_CARD_CREATOR.SELECCIONAR_FOTO;
  }

  return PASOS_CARD_CREATOR.CARGANDO;
};


export const limpiarCamposCategoria = (
  formValues
) => {
  return {
    ...formValues,

    raza: '',
    personalidad: '',
    caracteristica: '',
    lugar: '',
    dato: ''
  };
};