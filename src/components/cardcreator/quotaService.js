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

  if (!user) {
    return {
      planUsuario: 'free',
      limiteDiario: 10,
      generacionesRestantes: 0
    };
  }

  const {
    data: profile,
    error: profileError
  } = await supabase
    .from('profiles')
    .select(
      'plan, subscription_status, subscription_expires_at'
    )
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      'Error consultando perfil:',
      profileError
    );
  }


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


  const limiteDiario =
    esPlus ? 50 : 10;

  const planUsuario =
    esPlus ? 'plus' : 'free';

  const fechaHoy =
    obtenerFechaUruguay();


  const {
    data: generaciones,
    error
  } = await supabase
    .from('card_generations')
    .select('generation_number')
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


  return {
    planUsuario,
    limiteDiario,
    generacionesRestantes
  };
};