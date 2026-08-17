import {
  createImage,
  getRotatedImage
} from './imageUtils';


export const generarImagenRecortada = async ({
  previewUrl,
  rotation,
  croppedAreaPixels
}) => {
  if (!croppedAreaPixels) {
    throw new Error(
      'Seleccioná el área de la foto.'
    );
  }

  if (!previewUrl) {
    throw new Error(
      'No hay una imagen para recortar.'
    );
  }

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

  if (!ctx) {
    throw new Error(
      'No se pudo preparar el recorte.'
    );
  }

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

  return canvas.toDataURL(
    'image/jpeg',
    0.8
  );
};