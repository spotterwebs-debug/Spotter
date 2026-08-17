import template from '../../data/Template.json';


export const validarFormulario = (
  categoria,
  formValues
) => {
  if (!categoria) {
    return 'Seleccioná una categoría.';
  }

  if (!formValues.nombre.trim()) {
    return 'Ingresá un nombre.';
  }

  if (
    formValues.nombre
      .trim()
      .length > 24
  ) {
    return 'El nombre puede tener hasta 24 caracteres.';
  }


  // PERROS / GATOS / AVES

  if (
    [
      'perros',
      'gatos',
      'aves'
    ].includes(categoria)
  ) {
    if (!formValues.raza.trim()) {
      return 'Ingresá la raza o especie.';
    }

    if (
      !formValues
        .personalidad
        .trim()
    ) {
      return 'Ingresá la personalidad.';
    }

    if (!formValues.dato.trim()) {
      return 'Ingresá el Fun Fact.';
    }
  }


  // PLANTAS

  if (categoria === 'plantas') {
    if (!formValues.raza.trim()) {
      return 'Ingresá la especie.';
    }

    if (
      !formValues
        .caracteristica
        .trim()
    ) {
      return 'Ingresá el rasgo destacado.';
    }

    if (!formValues.dato.trim()) {
      return 'Ingresá el Fun Fact.';
    }
  }


  // PAISAJES

  if (categoria === 'paisajes') {
    if (!formValues.lugar.trim()) {
      return 'Ingresá el lugar.';
    }

    if (!formValues.dato.trim()) {
      return 'Ingresá el Fun Fact.';
    }
  }


  return null;
};


export const obtenerDatosRandom = (
  categoria
) => {
  const lista =
    template[categoria];

  if (
    !lista ||
    lista.length === 0
  ) {
    return null;
  }

  return lista[
    Math.floor(
      Math.random() *
      lista.length
    )
  ];
};