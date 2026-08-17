const estilos = {
  perros:
    'vintage parchment, green brown gold, paw ornaments',

  gatos:
    'vintage parchment, burgundy purple gold, feline ornaments',

  aves:
    'vintage parchment, teal gold, feather ornaments',

  plantas:
    'vintage botanical parchment, olive green gold, leaf ornaments',

  paisajes:
    'vintage explorer parchment, deep blue gold, mountain ornaments'
};


export const construirPromptSpot = (
  categoria,
  nombre
) => {
  if (!estilos[categoria]) {
    throw new Error(
      'Categoría inválida.'
    );
  }

  const nombreLimpio =
    nombre.trim();


  // =========================================================
  // PLANTAS
  // =========================================================

  if (categoria === 'plantas') {
    const prompt =
      `Vertical 2:3 premium trading card, ${estilos[categoria]}. ` +
      `Keep the complete original reference photo unchanged. ` +
      `Preserve the plant, background, surroundings and original composition. ` +
      `Do not isolate the plant, remove the background, crop the scene or replace any element. ` +
      `Only add the decorative card frame around the photo. ` +
      `Single ribbon with exactly "${nombreLimpio}". ` +
      `The name "${nombreLimpio}" must be the only visible text. ` +
      `No other text, numbers, labels or words.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  // =========================================================
  // PAISAJES
  // =========================================================

  if (categoria === 'paisajes') {
    const prompt =
      `Vertical 2:3 premium trading card, ${estilos[categoria]}. ` +
      `Keep the complete original reference photo unchanged. ` +
      `Preserve the entire landscape, background, foreground, sky and original composition. ` +
      `Do not isolate any tree, mountain, building or object. ` +
      `Do not remove, replace or recreate the background. ` +
      `Only add the decorative card frame around the photo. ` +
      `Single ribbon with exactly "${nombreLimpio}". ` +
      `The name "${nombreLimpio}" must be the only visible text. ` +
      `No other text, numbers, labels or words.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  // =========================================================
  // PERROS / GATOS / AVES
  // =========================================================

  const prompt =
    `Vertical 2:3 premium trading card, ${estilos[categoria]}. ` +
    `Use reference photo, preserve subject. ` +
    `Large ornate portrait. ` +
    `Single ribbon with exactly "${nombreLimpio}". ` +
    `The name "${nombreLimpio}" must be the only visible text. ` +
    `Decorative icons and stars only. ` +
    `No category text, no other text, numbers, labels or words.`;

  console.log(
    'Prompt Spot:',
    prompt.length,
    prompt
  );

  return prompt;
};