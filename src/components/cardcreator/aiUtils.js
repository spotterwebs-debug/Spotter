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

  if (prompt.length > 400) {
    throw new Error(
      `El prompt supera el límite (${prompt.length}/400).`
    );
  }

  return prompt;
};