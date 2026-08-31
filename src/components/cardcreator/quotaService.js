import { supabase } from '../../supabaseClient';


export const obtenerFechaUruguay = () => {

  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'America/Montevideo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  ).format(new Date());

};


export const obtenerCupoUsuario = async () => {

  const {
    data: { user }
  } = await supabase.auth.getUser();


  // =========================================================
  // SIN USUARIO
  // =========================================================

  if (!user) {

    return {
      planUsuario: 'free',
      limiteDiario: 10,
      generacionesRestantes: 0,
      esIlimitado: false
    };

  }


  // =========================================================
  // OBTENER PERFIL
  // =========================================================

  const {
    data: profile,
    error: profileError
  } = await supabase
    .from('profiles')
    .select(
      `
        plan,
        subscription_status,
        subscription_expires_at,
        unlimited_creations
      `
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


  // =========================================================
  // USUARIO ILIMITADO
  // =========================================================

  const esIlimitado =
    profile?.unlimited_creations === true;


  if (esIlimitado) {

    return {
      planUsuario: 'unlimited',
      limiteDiario: null,
      generacionesRestantes: null,
      esIlimitado: true
    };

  }


  // =========================================================
  // COMPROBAR PLAN PLUS
  // =========================================================

  let esPlus = false;


  if (
    profile?.plan === 'plus' &&
    profile?.subscription_status === 'active'
  ) {

    if (!profile.subscription_expires_at) {

      esPlus = true;

    } else {

      esPlus =
        new Date(
          profile.subscription_expires_at
        ).getTime() >
        Date.now();

    }

  }


  // =========================================================
  // LÍMITES
  // =========================================================

  const limiteDiario =
    esPlus
      ? 50
      : 10;


  const planUsuario =
    esPlus
      ? 'plus'
      : 'free';


  const fechaHoy =
    obtenerFechaUruguay();


  // =========================================================
  // GENERACIONES UTILIZADAS HOY
  // =========================================================

  const {
    data: generaciones,
    error
  } = await supabase
    .from('card_generations')
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

    throw new Error(
      error.message ||
      'No pudimos consultar tu cupo.'
    );

  }


  const usadas =
    generaciones?.length || 0;


  const generacionesRestantes =
    Math.max(
      0,
      limiteDiario - usadas
    );


  // =========================================================
  // RESPUESTA
  // =========================================================

  return {
    planUsuario,
    limiteDiario,
    generacionesRestantes,
    esIlimitado: false
  };

};