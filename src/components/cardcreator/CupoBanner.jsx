function CupoBanner({
  cargandoCupo,
  planUsuario,
  limiteDiario,
  generacionesRestantes
}) {
  if (cargandoCupo) {
    return (
      <div className="alert alert-dark text-center mt-3 mb-3">
        <strong>✨ Spotter</strong>

        <div className="small mt-1">
          Consultando tus Spots disponibles...
        </div>
      </div>
    );
  }

  const esPlus = planUsuario === 'plus';

  return (
    <div
      className={`alert ${
        esPlus
          ? 'alert-warning'
          : 'alert-info'
      } text-center mt-3 mb-3 shadow-sm`}
    >
      <div className="fw-bold">
        {esPlus
          ? '⭐ Spotter Plus'
          : '✨ Plan Free'}
      </div>

      <div className="mt-1">
        <strong>{limiteDiario}</strong>{' '}
        Spots diarios
      </div>

      <div className="small mt-1">
        Te quedan{' '}
        <strong>{generacionesRestantes}</strong>{' '}
        Spots hoy
      </div>
    </div>
  );
}

export default CupoBanner;