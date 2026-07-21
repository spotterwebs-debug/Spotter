import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import './CardCreator.css';
import template from '../data/Template.json';

function CardCreator({
  fileFromAlbum,
  categoriaInicial = '',
  cardToEdit = null
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const fileFromCamera = location.state?.fileFromCamera;
  const challengeId = location.state?.challengeId;

  // 1. Si no hay archivo ni edición, pero sí categoría inicial o desafío, arrancamos pidiendo la foto
  const [paso, setPaso] = useState(
    cardToEdit 
      ? 'formulario' 
      : (categoriaInicial || location.state?.categoriaInicial ? 'seleccionar_foto' : 'cargando')
  );

  const [previewUrl, setPreviewUrl] = useState(null);

  const [categoria, setCategoria] = useState(
    cardToEdit?.categoria || categoriaInicial || location.state?.categoriaInicial || ''
  );

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(cardToEdit?.imagen_url || null);

  const [formValues, setFormValues] = useState({
    nombre: '',
    raza: '',
    personalidad: '',
    dato: '',
    caracteristica: '',
    lugar: ''
  });

  const handleVolver = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (fileFromAlbum && (fileFromAlbum.size || fileFromAlbum.name)) {
      procesarArchivo(fileFromAlbum);
      return;
    }

    if (fileFromCamera && (fileFromCamera.size || fileFromCamera.name)) {
      procesarArchivo(fileFromCamera);
      return;
    }

    if (cardToEdit) {
      setPaso('formulario');
    } else if (categoriaInicial || location.state?.categoriaInicial) {
      setPaso('seleccionar_foto');
    }
  }, [fileFromAlbum, fileFromCamera]);

  const procesarArchivo = async (file) => {
    try {
      Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await new Promise(r => setTimeout(r, 200));

      let fileToProcess = file;

      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.match(/\.(heic|heif)$/i)) {
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });

        const blob = Array.isArray(converted) ? converted[0] : converted;

        fileToProcess = new File(
          [blob],
          file.name.replace(/\.(heic|heif)$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      } else {
        fileToProcess = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.7
        });
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        setRotation(0);

        // Si ya viene con categoría del desafío, saltamos directo al recorte ('crop')
        if (categoriaInicial || location.state?.categoriaInicial) {
          setPaso('crop');
        } else {
          setPaso('categoria');
        }

        Swal.close();
      };

      reader.readAsDataURL(fileToProcess);
    } catch (error) {
      Swal.fire('Error', error.message || 'Error procesando imagen', 'error');
    }
  };

  const handleInputChange = (e) =>
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const handleRandom = () => {
    const lista = template[categoria];

    if (!lista || lista.length === 0) return;

    const random = lista[Math.floor(Math.random() * lista.length)];

    setFormValues(random);
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRotatedImage = async (imageSrc, rot = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const rotRad = (rot * Math.PI) / 180;

    const bBoxWidth =
      Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bBoxHeight =
      Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const generarImagenRecortada = async () => {
    try {
      Swal.fire({ title: 'Recortando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const rotatedImageSrc = await getRotatedImage(previewUrl, rotation);
      const image = await createImage(rotatedImageSrc);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      setCroppedImage(canvas.toDataURL('image/jpeg', 0.8));
      Swal.close();
      setPaso('formulario');
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar el recorte', 'error');
    }
  };

  const handleGuardarEnAlbum = async () => {
    try {
      Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const { data: { session } } = await supabase.auth.getSession();

      const payload = {
        user_id: session.user.id,
        nombre: formValues.nombre,
        categoria,
        ...formValues,
        imagen_url: croppedImage,
        is_public: true
      };

      const { error } = cardToEdit
        ? await supabase.from('cards').update(payload).eq('id', cardToEdit.id)
        : await supabase.from('cards').insert([payload]);

      if (error) throw error;

      Swal.close();
      handleVolver();

    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleGuardarParaDesafio = async () => {
    try {
      Swal.fire({ title: 'Guardando para el desafío...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session.user.id;

      const payload = {
        user_id: userId,
        nombre: formValues.nombre,
        categoria,
        ...formValues,
        imagen_url: croppedImage,
        is_public: true
      };

      const { data: nuevaCard, error: cardError } = await supabase
        .from('cards')
        .insert([payload])
        .select()
        .single();

      if (cardError) throw cardError;

      const { error: challengeError } = await supabase
        .from('user_challenges')
        .insert([{
          user_id: userId,
          challenge_id: challengeId,
          card_id: nuevaCard.id,
          completed_at: new Date().toISOString()
        }]);

      if (challengeError) throw challengeError;

      Swal.fire({
        icon: 'success',
        title: '¡Desafío completado!',
        text: 'Tu tarjeta se guardó en tu álbum y ganaste el listón.',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/premios');

    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo registrar el desafío', 'error');
    }
  };

  return (
    <div className="card-creator-container container my-4 text-white">

      {/* 2. Nuevo paso para seleccionar foto al venir desde el desafío */}
      {paso === 'seleccionar_foto' && (
        <div className="category-card text-center p-5">
          <div className="category-header">
            <div className="category-icon">📸</div>
            <h2>Sube tu foto para el Desafío</h2>
            <p>Selecciona una imagen de tu dispositivo para crear tu tarjeta participante.</p>
          </div>

          <div className="my-4">
            <input 
              type="file" 
              accept="image/*" 
              id="file-upload-challenge" 
              className="d-none" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  procesarArchivo(e.target.files[0]);
                }
              }} 
            />
            <label htmlFor="file-upload-challenge" className="btn btn-warning btn-lg fw-bold px-4 py-3" style={{ cursor: 'pointer' }}>
              📁 Elegir foto de la galería
            </label>
          </div>

          <button className="btn btn-outline-danger mt-3" onClick={handleVolver}>
            ← Cancelar
          </button>
        </div>
      )}

      {paso === 'categoria' && (
        <div className="category-card">

          <div className="category-header">
            <div className="category-icon">📸</div>
            <h2>Seleccioná una categoría</h2>
            <p>Elegí qué querés capturar y coleccionar para crear una nueva tarjeta Spotter.</p>
          </div>

          <div className="category-grid">

            <button
              className={`category-option ${categoria === 'perros' ? 'active' : ''}`}
              onClick={() => setCategoria('perros')}
            >
              🐶 <span>Perros</span>
            </button>

            <button
              className={`category-option ${categoria === 'gatos' ? 'active' : ''}`}
              onClick={() => setCategoria('gatos')}
            >
              🐱 <span>Gatos</span>
            </button>

            <button
              className={`category-option ${categoria === 'plantas' ? 'active' : ''}`}
              onClick={() => setCategoria('plantas')}
            >
              🌿 <span>Plantas</span>
            </button>

            <button
              className={`category-option ${categoria === 'aves' ? 'active' : ''}`}
              onClick={() => setCategoria('aves')}
            >
              🐦 <span>Aves</span>
            </button>

            <button
              className={`category-option ${categoria === 'paisajes' ? 'active' : ''}`}
              onClick={() => setCategoria('paisajes')}
            >
              🏞️ <span>Paisajes</span>
            </button>

          </div>

          <button
            className="continue-btn"
            disabled={!categoria}
            onClick={() => setPaso('crop')}
          >
            Continuar →
          </button>

        </div>
      )}

      {paso === 'crop' && (
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
            <button className="btn btn-secondary" onClick={() => setRotation((prev) => (prev - 90) % 360)}>
              ↺ Girar Izquierda
            </button>
            <button className="btn btn-secondary" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
              ↻ Girar Derecha
            </button>
            <button className="btn btn-warning" onClick={generarImagenRecortada}>
              Cortar y Continuar
            </button>
          </div>
        </div>
      )}

      {paso === 'formulario' && (
        <div className="row g-4 justify-content-center">

          <div className="col-md-5">
            <img src={croppedImage} className="img-fluid rounded" alt="Vista previa" />
          </div>

          <div className="col-md-7 bg-dark-card p-4 rounded-4">

            <h4 className="mb-3">📋 Información de la tarjeta</h4>

            <button className="random-btn" onClick={handleRandom}>
              🎲 Completar al azar
            </button>

            {['perros', 'gatos', 'aves'].includes(categoria) && (
              <>
                <label className="field-title">📝 Nombre</label>
                <input name="nombre" className="form-control mb-3"
                  value={formValues.nombre} onChange={handleInputChange} />

                <label className="field-title">🐾 Raza / Especie</label>
                <input name="raza" className="form-control mb-3"
                  value={formValues.raza} onChange={handleInputChange} />

                <label className="field-title">😊 Personalidad</label>
                <input name="personalidad" className="form-control mb-3"
                  value={formValues.personalidad} onChange={handleInputChange} />

                <label className="field-title">✨ Fun Fact</label>
                <textarea name="dato" rows="3"
                  className="form-control mb-3"
                  value={formValues.dato}
                  onChange={handleInputChange} />
              </>
            )}

            {categoria === 'plantas' && (
              <>
                <label className="field-title">📝 Nombre</label>
                <input name="nombre" className="form-control mb-3"
                  value={formValues.nombre} onChange={handleInputChange} />

                <label className="field-title">🌿 Especie</label>
                <input name="raza" className="form-control mb-3"
                  value={formValues.raza} onChange={handleInputChange} />

                <label className="field-title">🍃 Rasgo destacado</label>
                <input name="caracteristica" className="form-control mb-3"
                  value={formValues.caracteristica} onChange={handleInputChange} />

                <label className="field-title">✨ Fun Fact</label>
                <textarea name="dato" rows="3"
                  className="form-control mb-3"
                  value={formValues.dato}
                  onChange={handleInputChange} />
              </>
            )}

            {categoria === 'paisajes' && (
              <>
                <label className="field-title">📝 Nombre</label>
                <input name="nombre" className="form-control mb-3"
                  value={formValues.nombre} onChange={handleInputChange} />

                <label className="field-title">📍 Lugar</label>
                <input name="lugar" className="form-control mb-3"
                  value={formValues.lugar} onChange={handleInputChange} />

                <label className="field-title">✨ Fun Fact</label>
                <textarea name="dato" rows="3"
                  className="form-control mb-3"
                  value={formValues.dato}
                  onChange={handleInputChange} />
              </>
            )}

            {challengeId ? (
              <button className="btn btn-warning w-100 mt-4 fw-bold py-2" onClick={handleGuardarParaDesafio}>
                🏆 Subir al Challenge y Ganar Listón
              </button>
            ) : (
              <button className="btn btn-success w-100 mt-4" onClick={handleGuardarEnAlbum}>
                💾 Guardar tarjeta
              </button>
            )}

            <button className="btn btn-outline-danger w-100 mt-2" onClick={handleVolver}>
              ← Cancelar
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default CardCreator;