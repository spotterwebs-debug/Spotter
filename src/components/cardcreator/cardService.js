import { supabase } from '../../supabaseClient';


export const actualizarCard = async ({
  cardId,
  payload
}) => {
  const { error } =
    await supabase
      .from('cards')
      .update(payload)
      .eq('id', cardId);

  if (error) {
    throw error;
  }

  return true;
};


export const crearCard = async ({
  payload
}) => {
  const nuevaCardPayload = {
    ...payload,
    is_public: false,
    publica: false
  };

  const {
    data: nuevaCard,
    error
  } =
    await supabase
      .from('cards')
      .insert([
        nuevaCardPayload
      ])
      .select()
      .single();

  if (error) {
    throw error;
  }

  return nuevaCard;
};


export const registrarDesafioCompletado = async ({
  userId,
  challengeId,
  cardId
}) => {
  const {
    error
  } =
    await supabase
      .from('user_challenges')
      .insert([
        {
          user_id: userId,
          challenge_id: challengeId,
          card_id: cardId,
          completed_at:
            new Date().toISOString()
        }
      ]);

  if (error) {
    throw error;
  }

  return true;
};


export const crearPayloadCard = ({
  userId,
  formValues,
  categoria,
  imagenUrl,
  originalUrl
}) => {
  return {
    user_id: userId,

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
      imagenUrl,

    original_url:
      originalUrl
  };
};