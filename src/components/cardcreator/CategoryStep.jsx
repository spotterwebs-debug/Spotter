import CupoBanner from './CupoBanner';

function CategoryStep({
  previewUrl,
  categoria,
  seleccionarCategoria,
  cargandoCupo,
  planUsuario,
  limiteDiario,
  generacionesRestantes,
  onContinuar
}) {
  const categorias = [
    ['perros', '🐶', 'Perros'],
    ['gatos', '🐱', 'Gatos'],
    ['aves', '🐦', 'Aves'],
    ['plantas', '🌿', 'Plantas'],
    ['paisajes', '🏞️', 'Paisajes']
  ];

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-icon">
          🎴
        </div>

        <h2>
          ¿Qué estás spoteando?
        </h2>

        <p>
          Elegí la categoría correcta.
          La IA usará esta selección para diseñar tu card.
        </p>
      </div>

      <CupoBanner
        cargandoCupo={cargandoCupo}
        planUsuario={planUsuario}
        limiteDiario={limiteDiario}
        generacionesRestantes={generacionesRestantes}
      />

      {previewUrl && (
        <div className="text-center mb-4">
          <img
            src={previewUrl}
            alt="Foto seleccionada"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '18px',
              boxShadow: '0 6px 18px rgba(0,0,0,.25)'
            }}
          />
        </div>
      )}

      <div className="category-grid">
        {categorias.map(
          ([value, icon, label]) => (
            <button
              type="button"
              key={value}
              className={`category-option ${
                categoria === value
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                seleccionarCategoria(value)
              }
            >
              {icon}{' '}
              <span>
                {label}
              </span>
            </button>
          )
        )}
      </div>

      {categoria && (
        <div className="alert alert-success text-center mt-4">
          La IA creará una card de{' '}
          <strong>
            {categoria}
          </strong>
          .
        </div>
      )}

      <button
        type="button"
        className="continue-btn"
        disabled={!categoria}
        onClick={onContinuar}
      >
        Continuar →
      </button>
    </div>
  );
}

export default CategoryStep;