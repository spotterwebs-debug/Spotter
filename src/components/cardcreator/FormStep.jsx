import AnimalForm from './AnimalForm';
import PlantForm from './PlantForm';
import LandscapeForm from './LandscapeForm';
import CupoBanner from './CupoBanner';

function FormStep({
  croppedImage,
  categoria,
  formValues,
  handleInputChange,
  handleRandom,
  generandoSpot,
  estadoGeneracion,
  progresoGeneracion,
  cargandoCupo,
  planUsuario,
  limiteDiario,
  generacionesRestantes,
  onCrearSpot,
  onCancelar
}) {
  const esAnimal = [
    'perros',
    'gatos',
    'aves'
  ].includes(categoria);

  return (
    <div className="row g-4 justify-content-center">

      <div className="col-md-5">

        <img
          src={croppedImage}
          className="img-fluid rounded"
          alt="Vista previa"
        />

        <div className="text-center mt-3">

          <span className="badge bg-warning text-dark px-3 py-2 text-capitalize">
            {categoria}
          </span>

        </div>

        <CupoBanner
          cargandoCupo={cargandoCupo}
          planUsuario={planUsuario}
          limiteDiario={limiteDiario}
          generacionesRestantes={generacionesRestantes}
        />

      </div>


      <div className="col-md-7 bg-dark-card p-4 rounded-4">

        <h4 className="mb-3">
          📋 Información del Spot
        </h4>


        <button
          type="button"
          className="random-btn"
          onClick={handleRandom}
          disabled={generandoSpot}
        >
          🎲 Completar al azar
        </button>


        {esAnimal && (
          <AnimalForm
            formValues={formValues}
            handleInputChange={handleInputChange}
            generandoSpot={generandoSpot}
          />
        )}


        {categoria === 'plantas' && (
          <PlantForm
            formValues={formValues}
            handleInputChange={handleInputChange}
            generandoSpot={generandoSpot}
          />
        )}


        {categoria === 'paisajes' && (
          <LandscapeForm
            formValues={formValues}
            handleInputChange={handleInputChange}
            generandoSpot={generandoSpot}
          />
        )}


        {generandoSpot && (

          <div className="text-center mt-4 p-3">

            <div
              className="spinner-border text-warning mb-3"
              role="status"
            />


            <h5>
              {estadoGeneracion ||
                '✨ Creando tu Spot...'}
            </h5>


            <div className="progress mt-3">

              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{
                  width: `${progresoGeneracion}%`
                }}
              >
                {progresoGeneracion}%
              </div>

            </div>


            <small className="d-block mt-3">
              No cierres, ni salgas de esta pantalla.
              La IA está preparando tu card.
            </small>

          </div>

        )}


        {!generandoSpot && (

          <button
            type="button"
            className="btn btn-warning w-100 mt-4 fw-bold py-3"
            onClick={onCrearSpot}
          >
            ✨ Crear Spot
          </button>

        )}


        <button
          type="button"
          className="btn btn-outline-danger w-100 mt-2"
          onClick={onCancelar}
          disabled={generandoSpot}
        >
          ← Cancelar
        </button>

      </div>

    </div>
  );
}

export default FormStep;