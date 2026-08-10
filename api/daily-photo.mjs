import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Falta la imagen",
      });
    }

    if (!prompt) {
      return res.status(400).json({
        error: "Falta el prompt",
      });
    }

    console.log("Iniciando generación de Foto del Día...");

    const output = await replicate.run(
      "bytedance/seedream-5.0-lite",
      {
        input: {
          prompt,
          image_input: [image],
          size: "2K",
          aspect_ratio: "2:3",
          sequential_image_generation: "disabled",
          max_images: 1,
          output_format: "png",
        },
      }
    );

    console.log("Generación completada");

    return res.status(200).json({
      success: true,
      output,
    });

  } catch (error) {
    console.error("Error Replicate:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Error generando imagen",
    });
  }
}