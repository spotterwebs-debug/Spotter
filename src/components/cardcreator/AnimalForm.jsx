function AnimalForm({
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
        🐾 Raza / Especie
      </label>

      <input
        name="raza"
        className="form-control mb-3"
        value={formValues.raza}
        onChange={handleInputChange}
        disabled={generandoSpot}
      />

      <label className="field-title">
        😊 Personalidad
      </label>

      <input
        name="personalidad"
        className="form-control mb-3"
        value={formValues.personalidad}
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

export default AnimalForm;