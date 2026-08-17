import { supabase } from '../../supabaseClient';


const esperar = (ms) =>
  new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );


export const obtenerDetalleErrorFuncion = async (
  error,
  data
) => {
  if (data?.error) {
    return data;
  }

  try {
    if (
      error?.context &&
      typeof error.context.json === 'function'
    ) {
      return await error.context.json();
    }
  } catch {
    // No hacemos nada.
  }

  return {
    error:
      error?.message ||
      'Error desconocido'
  };
};


export const iniciarGeneracionSpot = async ({
  imageUrl,
  prompt,
  categoria
}) => {
  const {
    data,
    error
  } =
    await supabase.functions
      .invoke(
        'generate-card',
        {
          body: {
            image: imageUrl,
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

    return {
      success: false,
      ...detalle
    };
  }

  if (!data?.success) {
    return {
      success: false,
      ...data
    };
  }

  if (!data.predictionId) {
    throw new Error(
      'No recibimos el identificador de la generación.'
    );
  }

  return data;
};


export const esperarResultadoSpot = async ({
  predictionId,
  generationId,
  onProgress,
  onStatus
}) => {
  let intentosPolling = 0;

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
    intentosPolling < 60
  ) {
    intentosPolling += 1;

    const indice =
      Math.min(
        Math.floor(
          (
            intentosPolling - 1
          ) / 2
        ),
        etapas.length - 1
      );

    const [
      progreso,
      estado
    ] =
      etapas[indice];


    if (onProgress) {
      onProgress(progreso);
    }

    if (onStatus) {
      onStatus(estado);
    }


    await esperar(4000);


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
      data?.status === 'succeeded'
    ) {
      const resultado =
        Array.isArray(
          data.output
        )
          ? data.output[0]
          : data.output;

      if (!resultado) {
        throw new Error(
          'La IA terminó pero no devolvió una imagen.'
        );
      }

      if (onProgress) {
        onProgress(100);
      }

      if (onStatus) {
        onStatus(
          '🎉 ¡Tu Spot está listo!'
        );
      }

      await esperar(500);

      return resultado;
    }


    if (
      data?.finished &&
      (
        data?.status === 'failed' ||
        data?.status === 'canceled'
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