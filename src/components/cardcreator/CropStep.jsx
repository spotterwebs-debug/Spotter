import Cropper from 'react-easy-crop';

function CropStep({
  previewUrl,
  crop,
  zoom,
  rotation,
  setCrop,
  setZoom,
  setRotation,
  onCropComplete,
  onGenerarRecorte
}) {
  return (
    <div className="cropper-container-box">
      <Cropper
        image={previewUrl}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={3 / 4}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onCropComplete={onCropComplete}
      />

      <div className="cropper-floating-buttons d-flex gap-2 flex-wrap justify-content-center">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setRotation(
              (prev) => (prev - 90) % 360
            )
          }
        >
          ↺ Girar Izquierda
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setRotation(
              (prev) => (prev + 90) % 360
            )
          }
        >
          ↻ Girar Derecha
        </button>

        <button
          type="button"
          className="btn btn-warning"
          onClick={onGenerarRecorte}
        >
          Cortar y continuar
        </button>
      </div>
    </div>
  );
}

export default CropStep;