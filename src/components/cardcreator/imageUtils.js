export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener(
      'load',
      () => resolve(image)
    );

    image.addEventListener(
      'error',
      reject
    );

    image.setAttribute(
      'crossOrigin',
      'anonymous'
    );

    image.src = url;
  });


export const getRotatedImage = async (
  imageSrc,
  rot = 0
) => {
  const image = await createImage(imageSrc);

  const canvas =
    document.createElement('canvas');

  const ctx =
    canvas.getContext('2d');

  const rotRad =
    (rot * Math.PI) / 180;

  const bBoxWidth =
    Math.abs(
      Math.cos(rotRad) *
      image.width
    ) +
    Math.abs(
      Math.sin(rotRad) *
      image.height
    );

  const bBoxHeight =
    Math.abs(
      Math.sin(rotRad) *
      image.width
    ) +
    Math.abs(
      Math.cos(rotRad) *
      image.height
    );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(
    bBoxWidth / 2,
    bBoxHeight / 2
  );

  ctx.rotate(rotRad);

  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2
  );

  return canvas.toDataURL(
    'image/jpeg',
    0.9
  );
};