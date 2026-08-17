function PlantForm({
  formValues,
  handleInputChange,
  generandoSpot
}) {
  return (
    <>
      <label className="field-title">
        📝 Nombre
      </label>

      <input
        name="nombre"
        maxLength={24}
        className="form-control mb-3"
        value={formValues.nombre}
        onChange={handleInputChange}
        disabled={generandoSpot}
      />

      <label className="field-title">
        🌿 Especie
      </label>

      <input
        name="raza"
        className="form-control mb-3"
        value={formValues.raza}
        onChange={handleInputChange}
        disabled={generandoSpot}
      />

      <label className="field-title">
        🍃 Rasgo destacado
      </label>

      <input
        name="caracteristica"
        className="form-control mb-3"
        value={formValues.caracteristica}
        onChange={handleInputChange}
        disabled={generandoSpot}
      />

      <label className="field-title">
        ✨ Fun Fact
      </label>

      <textarea
        name="dato"
        rows="3"
        className="form-control mb-3"
        value={formValues.dato}
        onChange={handleInputChange}
        disabled={generandoSpot}
      />
    </>
  );
}

export default PlantForm;