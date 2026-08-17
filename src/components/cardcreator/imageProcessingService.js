import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';


export const procesarImagen = async (file) => {
  let fileToProcess = file;

  const esHeicOHeif =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name?.match(/\.(heic|heif)$/i);

  if (esHeicOHeif) {
    const converted =
      await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });

    const convertedBlob =
      Array.isArray(converted)
        ? converted[0]
        : converted;

    const jpgFile =
      new File(
        [convertedBlob],
        file.name.replace(
          /\.(heic|heif)$/i,
          '.jpg'
        ),
        {
          type: 'image/jpeg'
        }
      );

    fileToProcess =
      await imageCompression(
        jpgFile,
        {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.7
        }
      );

  } else {
    fileToProcess =
      await imageCompression(
        file,
        {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.7
        }
      );
  }

  return fileToProcess;
};


export const fileToDataUrl = (
  file
) => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload =
        (e) => {
          resolve(
            e.target.result
          );
        };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );
};