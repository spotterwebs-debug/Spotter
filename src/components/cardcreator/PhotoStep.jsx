import CupoBanner from './CupoBanner';

function PhotoStep({
  cargandoCupo,
  planUsuario,
  limiteDiario,
  generacionesRestantes,
  onSeleccionarArchivo,
  onCancelar
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      onSeleccionarArchivo(file);
    }
  };

  return (
    <div className="category-card text-center p-5">
      <div className="category-header">
        <div className="category-icon">
          📸
        </div>

        <h2>
          Subí tu foto
        </h2>

        <p>
          Elegí una imagen para crear tu nuevo Spot.
        </p>
      </div>

      <CupoBanner
        cargandoCupo={cargandoCupo}
        planUsuario={planUsuario}
        limiteDiario={limiteDiario}
        generacionesRestantes={generacionesRestantes}
      />

      <div className="my-4">
        <input
          type="file"
          accept="image/*"
          id="file-upload-challenge"
          className="d-none"
          onChange={handleFileChange}
        />

        <label
          htmlFor="file-upload-challenge"
          className="btn btn-warning btn-lg fw-bold px-4 py-3"
          style={{
            cursor: 'pointer'
          }}
        >
          📁 Elegir foto
        </label>
      </div>

      <button
        type="button"
        className="btn btn-outline-danger mt-3"
        onClick={onCancelar}
      >
        ← Cancelar
      </button>
    </div>
  );
}

export default PhotoStep;