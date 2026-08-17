const estilos = {
  perros:
    'vintage parchment, green brown gold, elegant paw ornaments',

  gatos:
    'vintage parchment, burgundy purple gold, elegant feline ornaments',

  aves:
    'vintage parchment, teal gold, elegant feather ornaments',

  plantas:
    'vintage botanical parchment, olive green gold, elegant leaf ornaments',

  paisajes:
    'vintage explorer parchment, deep blue gold, elegant mountain ornaments'
};


// =========================================================
// CONSTRUIR PROMPT SPOT
// =========================================================

export const construirPromptSpot = (
  categoria,
  nombre
) => {
  if (!estilos[categoria]) {
    throw new Error('Categoría inválida.');
  }

  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    throw new Error('El nombre no puede estar vacío.');
  }


  // =========================================================
  // REGLA FUERTE PARA EL TÍTULO
  // =========================================================

  const reglaTitulo =
    `TEXT ACCURACY IS CRITICAL. ` +
    `The only visible text in the entire card must be exactly: "${nombreLimpio}". ` +
    `Copy "${nombreLimpio}" character by character exactly as written. ` +
    `Do not translate it, correct it, reinterpret it, shorten it, expand it, pluralize it or replace it. ` +
    `Do not invent alternative spelling. ` +
    `Do not add extra letters, words, symbols, numbers or punctuation. ` +
    `Do not duplicate the title. ` +
    `Render the title only once, clearly readable, centered on a single decorative ribbon. ` +
    `Before rendering the final card, verify that the title reads exactly "${nombreLimpio}". `;


  // =========================================================
  // PERROS
  // =========================================================

  if (categoria === 'perros') {
    const prompt =
      `Create a vertical 2:3 premium collectible trading card. ` +
      `${estilos.perros}. ` +

      `Use the supplied reference photograph as the visual source. ` +
      `Preserve the identity, anatomy, fur pattern, colors, markings and recognizable appearance of the dog. ` +
      `The dog must clearly remain the same dog shown in the reference image. ` +
      `Do not invent a different breed, coat pattern, face shape or body proportions. ` +

      `Create an elegant large portrait of the dog integrated naturally into the card design. ` +
      `The dog should be the clear main subject. ` +
      `Keep realistic photographic details and natural proportions. ` +
      `Do not create extra animals, duplicate body parts, extra legs, extra ears or distorted anatomy. ` +

      `Use a refined vintage parchment frame with green, brown and gold details. ` +
      `Include tasteful paw-themed ornaments, small decorative stars and subtle collectible-card details. ` +
      `The design should feel premium, magical and adventurous without becoming visually cluttered. ` +

      `Place one single decorative ribbon reserved exclusively for the title. ` +

      reglaTitulo +

      `No category name. ` +
      `No breed label. ` +
      `No descriptions. ` +
      `No statistics. ` +
      `No numbers. ` +
      `No logos. ` +
      `No watermark. ` +
      `No additional readable text anywhere on the card.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  // =========================================================
  // GATOS
  // =========================================================

  if (categoria === 'gatos') {
    const prompt =
      `Create a vertical 2:3 premium collectible trading card. ` +
      `${estilos.gatos}. ` +

      `Use the supplied reference photograph as the visual source. ` +
      `Preserve the identity, anatomy, fur pattern, colors, markings, eyes and recognizable appearance of the cat. ` +
      `The cat must clearly remain the same cat shown in the reference image. ` +
      `Do not invent a different breed, coat pattern, face shape or body proportions. ` +

      `Create an elegant large portrait of the cat integrated naturally into the card design. ` +
      `The cat should be the clear main subject. ` +
      `Keep realistic photographic details and natural feline proportions. ` +
      `Do not create extra animals, duplicate body parts, extra paws, extra ears, extra tails or distorted anatomy. ` +

      `Use a refined vintage parchment frame with burgundy, purple and gold details. ` +
      `Include tasteful feline ornaments, small decorative stars and subtle collectible-card details. ` +
      `The design should feel mysterious, elegant and premium without becoming visually cluttered. ` +

      `Place one single decorative ribbon reserved exclusively for the title. ` +

      reglaTitulo +

      `No category name. ` +
      `No breed label. ` +
      `No descriptions. ` +
      `No statistics. ` +
      `No numbers. ` +
      `No logos. ` +
      `No watermark. ` +
      `No additional readable text anywhere on the card.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  // =========================================================
  // AVES
  // =========================================================

  if (categoria === 'aves') {
    const prompt =
      `Create a vertical 2:3 premium collectible trading card. ` +
      `${estilos.aves}. ` +

      `Use the supplied reference photograph as the visual source. ` +
      `Preserve the identity, species appearance, feather colors, markings, beak shape and recognizable characteristics of the bird. ` +
      `The bird must clearly remain the same bird shown in the reference image. ` +
      `Do not invent different plumage, species traits or anatomy. ` +

      `Create an elegant large portrait of the bird integrated naturally into the card design. ` +
      `The bird should be the clear main subject. ` +
      `Keep realistic feather detail and natural proportions. ` +
      `Do not create extra birds, duplicated wings, extra legs, extra heads or distorted anatomy. ` +

      `Use a refined vintage parchment frame with teal and gold details. ` +
      `Include tasteful feather ornaments, small decorative stars and subtle collectible-card details. ` +
      `The design should feel adventurous, delicate and premium without becoming visually cluttered. ` +

      `Place one single decorative ribbon reserved exclusively for the title. ` +

      reglaTitulo +

      `No category name. ` +
      `No species label. ` +
      `No descriptions. ` +
      `No statistics. ` +
      `No numbers. ` +
      `No logos. ` +
      `No watermark. ` +
      `No additional readable text anywhere on the card.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  // =========================================================
  // PLANTAS
  // =========================================================

  if (categoria === 'plantas') {
    const prompt =
      `Create a vertical 2:3 premium botanical collectible card. ` +
      `${estilos.plantas}. ` +

      `IMPORTANT IMAGE PRESERVATION RULE. ` +
      `The supplied reference image must remain a complete normal rectangular photograph inside the card. ` +
      `Use the entire original photograph as provided. ` +
      `The photograph itself is the main image of the card. ` +

      `Do not extract the plant from the photograph. ` +
      `Do not isolate the plant. ` +
      `Do not cut out the plant. ` +
      `Do not remove the background. ` +
      `Do not create transparency around the plant. ` +
      `Do not replace the background. ` +
      `Do not blur the background. ` +
      `Do not simplify the background. ` +
      `Do not regenerate the background. ` +
      `Do not reinterpret the background. ` +
      `Do not recreate the scene. ` +

      `Do not transform the plant into a botanical illustration, studio portrait, sticker, isolated specimen or floating object. ` +

      `Keep the complete environment shown in the original photograph. ` +
      `Preserve all pots, soil, furniture, walls, floors, vegetation, objects, shadows, lighting and surroundings that are visible in the source photo. ` +
      `Preserve the original photographic composition, perspective and natural context. ` +

      `The original photograph must have clearly visible rectangular boundaries inside the card design. ` +
      `It must look like a real photograph placed inside an ornate trading-card frame. ` +

      `Only add decorative design elements OUTSIDE the photograph. ` +
      `Do not place leaves, ornaments, textures, particles or decorative elements over the original photograph. ` +

      `Use an elegant vintage botanical parchment frame with olive green and gold details. ` +
      `Include tasteful leaf ornaments around the outer frame. ` +
      `Keep the design premium, natural and clean. ` +

      `Place one single decorative ribbon reserved exclusively for the title. ` +

      reglaTitulo +

      `No category name. ` +
      `No species label. ` +
      `No botanical descriptions. ` +
      `No numbers. ` +
      `No logos. ` +
      `No watermark. ` +
      `No additional readable text anywhere on the card.`;

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
      `Create a vertical 2:3 premium explorer collectible card. ` +
      `${estilos.paisajes}. ` +

      `IMPORTANT IMAGE PRESERVATION RULE. ` +
      `The supplied reference image must remain a complete normal rectangular photograph inside the card. ` +
      `Use the entire original photograph as provided. ` +
      `The photograph itself is the main image of the card. ` +

      `Do not extract any object from the photograph. ` +
      `Do not isolate trees, mountains, buildings, monuments, people, animals or any other element. ` +
      `Do not remove the background. ` +
      `Do not replace the background. ` +
      `Do not blur the background. ` +
      `Do not regenerate the sky. ` +
      `Do not regenerate the foreground. ` +
      `Do not extend the landscape. ` +
      `Do not recreate or reinterpret the location. ` +

      `Do not transform the scene into a painting, illustration, fantasy landscape or artificial environment. ` +

      `Keep the complete original foreground, middle ground and background. ` +
      `Preserve the sky, vegetation, buildings, roads, water, mountains, people, objects and every visible element from the original photograph. ` +
      `Preserve the original photographic composition, framing, perspective, lighting and sense of place. ` +

      `The original photograph must have clearly visible rectangular boundaries inside the card design. ` +
      `It must look like a real travel photograph placed inside an ornate collectible-card frame. ` +

      `Only add decorative design elements OUTSIDE the photograph. ` +
      `Do not place mountains, ornaments, particles or decorative textures over the original photograph. ` +

      `Use an elegant vintage explorer parchment frame with deep blue and gold details. ` +
      `Include tasteful mountain and exploration ornaments around the outer frame. ` +
      `Keep the design premium, adventurous and clean. ` +

      `Place one single decorative ribbon reserved exclusively for the title. ` +

      reglaTitulo +

      `No category name. ` +
      `No location label unless it is exactly the requested title. ` +
      `No descriptions. ` +
      `No coordinates. ` +
      `No numbers. ` +
      `No logos. ` +
      `No watermark. ` +
      `No additional readable text anywhere on the card.`;

    console.log(
      'Prompt Spot:',
      prompt.length,
      prompt
    );

    return prompt;
  }


  throw new Error('No se pudo construir el prompt.');
};