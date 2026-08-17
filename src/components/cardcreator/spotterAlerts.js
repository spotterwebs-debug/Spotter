import Swal from 'sweetalert2';


export const mostrarProcesandoImagen = () => {
  return Swal.fire({
    title: 'Procesando...',
    allowOutsideClick: false,
    didOpen: () =>
      Swal.showLoading()
  });
};


export const mostrarRecortandoImagen = () => {
  return Swal.fire({
    title: 'Recortando...',
    allowOutsideClick: false,
    didOpen: () =>
      Swal.showLoading()
  });
};


export const mostrarGuardandoSpot = () => {
  return Swal.fire({
    title: 'Guardando Spot...',
    allowOutsideClick: false,
    didOpen: () =>
      Swal.showLoading()
  });
};


export const cerrarAlerta = () => {
  Swal.close();
};


export const mostrarError = ({
  title = 'Error',
  message
}) => {
  return Swal.fire({
    icon: 'error',
    title,
    text:
      message ||
      'Ocurrió un error.'
  });
};


export const mostrarAdvertenciaFormulario = (
  message
) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Revisá la información',
    text: message
  });
};


export const mostrarLoginRequerido = () => {
  return Swal.fire({
    icon: 'info',
    title: 'Iniciá sesión',
    text:
      'Tenés que iniciar sesión para crear un Spot.',
    confirmButtonText:
      'Ir al login'
  });
};


export const mostrarSpotterPlus = ({
  planUsuario
}) => {
  const esFree =
    planUsuario === 'free';

  return Swal.fire({
    icon: 'info',

    title:
      '✨ Spotter Plus',

    html:
      esFree
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


export const mostrarSpotActualizado = () => {
  return Swal.fire({
    icon: 'success',

    title:
      '¡Spot actualizado! 🎉',

    timer: 1400,

    showConfirmButton:
      false
  });
};


export const mostrarSpotGuardado = ({
  categoria
}) => {
  return Swal.fire({
    icon: 'success',

    title:
      '¡Spot guardado! 🎉',

    text:
      `Se agregó a tu álbum de ${categoria}.`,

    timer: 1600,

    showConfirmButton:
      false
  });
};


export const mostrarDesafioCompletado = ({
  categoria
}) => {
  return Swal.fire({
    icon: 'success',

    title:
      '¡Desafío completado! 🏆',

    text:
      `Tu Spot se guardó en el álbum de ${categoria} y ganaste el listón.`,

    timer: 1800,

    showConfirmButton:
      false
  });
};


export const confirmarEliminarSpot = () => {
  return Swal.fire({
    icon: 'warning',

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
};