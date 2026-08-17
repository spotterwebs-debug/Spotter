import { supabase } from '../../supabaseClient';


export const subirOriginalAStorage = async ({
  userId,
  croppedImage,
  originalUrl
}) => {
  if (originalUrl) {
    return {
      publicUrl: originalUrl,
      path: null
    };
  }

  if (!croppedImage) {
    throw new Error(
      'No hay una imagen preparada.'
    );
  }

  const response =
    await fetch(croppedImage);

  const blob =
    await response.blob();

  const extension =
    blob.type === 'image/png'
      ? 'png'
      : 'jpg';

  const path =
    `originales/${userId}/${Date.now()}.${extension}`;

  const { error } =
    await supabase.storage
      .from('cards')
      .upload(
        path,
        blob,
        {
          contentType:
            blob.type ||
            'image/jpeg',

          upsert: false
        }
      );

  if (error) {
    throw new Error(
      `No pudimos subir la foto: ${error.message}`
    );
  }

  const { data } =
    supabase.storage
      .from('cards')
      .getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    path
  };
};


export const guardarSpotEnStorage = async ({
  userId,
  spotGenerado
}) => {
  if (!spotGenerado) {
    throw new Error(
      'No hay un Spot generado.'
    );
  }

  const response =
    await fetch(spotGenerado);

  if (!response.ok) {
    throw new Error(
      'No pudimos preparar el Spot para guardarlo.'
    );
  }

  const blob =
    await response.blob();

  const extension =
    blob.type === 'image/jpeg'
      ? 'jpg'
      : 'png';

  const path =
    `generadas/${userId}/${Date.now()}.${extension}`;

  const { error } =
    await supabase.storage
      .from('cards')
      .upload(
        path,
        blob,
        {
          contentType:
            blob.type ||
            'image/png',

          upsert: false
        }
      );

  if (error) {
    throw new Error(
      `No pudimos guardar el Spot: ${error.message}`
    );
  }

  const { data } =
    supabase.storage
      .from('cards')
      .getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    path
  };
};


export const eliminarArchivoStorage = async (
  path
) => {
  if (!path) {
    return;
  }

  const { error } =
    await supabase.storage
      .from('cards')
      .remove([path]);

  if (error) {
    throw error;
  }
};