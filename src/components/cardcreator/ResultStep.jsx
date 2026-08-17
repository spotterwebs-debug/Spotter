import CupoBanner from './CupoBanner';

function ResultStep({
  categoria,
  spotGenerado,
  challengeId,
  cargandoCupo,
  planUsuario,
  limiteDiario,
  generacionesRestantes,
  onGuardar,
  onEliminar
}) {
  return (
    <div className="row g-4 justify-content-center">
      <div className="col-md-6 text-center">

        <div className="mb-3">
          <span className="badge bg-warning text-dark px-3 py-2">
            ✨ TU NUEVO SPOT · {categoria.toUpperCase()}
          </span>
        </div>

        <img
          src={spotGenerado}
          alt="Trading Card Spot"
          className="img-fluid rounded-4 shadow-lg"
          style={{
            maxHeight: '760px'
          }}
        />

        <CupoBanner
          cargandoCupo={cargandoCupo}
          planUsuario={planUsuario}
          limiteDiario={limiteDiario}
          generacionesRestantes={generacionesRestantes}
        />

        <button
          type="button"
          className="btn btn-success w-100 mt-4 fw-bold py-3"
          onClick={onGuardar}
        >
          {challengeId
            ? '🏆 Guardar Spot y completar desafío'
            : `💾 Guardar en álbum de ${categoria}`}
        </button>

        <button
          type="button"
          className="btn btn-outline-danger w-100 mt-2"
          onClick={onEliminar}
        >
          🗑️ Eliminar
        </button>

      </div>
    </div>
  );
}

export default ResultStep;