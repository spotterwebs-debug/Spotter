// src/components/CardCreator.jsx
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import templates from '../data/Template.json';
import { supabase } from '../supabaseClient'; 
import Swal from 'sweetalert2';
import './CardCreator.css'; 

function CardCreator({ previewUrl, onCancel, cardToEdit = null }) {
  const [paso, setPaso] = useState(cardToEdit ? 'formulario' : 'categoria'); 
  const [categoria, setCategoria] = useState(cardToEdit?.categoria || '');
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(cardToEdit?.imagen_url || null); 

  const [formValues, setFormValues] = useState({
    nombre: cardToEdit?.nombre || '',
    raza: cardToEdit?.raza || '',
    personalidad: cardToEdit?.personalidad || '',
    dato: cardToEdit?.dato || '',
    caracteristica: cardToEdit?.caracteristica || '',
    lugar: cardToEdit?.lugar || ''
  });

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generarImagenRecortada = async () => {
    try {
      const image = new Image();
      image.src = previewUrl;
      await new Promise((resolve) => (image.onload = resolve));
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      setCroppedImage(canvas.toDataURL('image/jpeg'));
      setPaso('formulario'); 
    } catch (e) { console.error("Error al recortar", e); }
  };

  const handleRandomize = () => {
    let pool = [];
    if (['perros', 'gatos', 'aves'].includes(categoria)) pool = templates.fauna;
    else if (categoria === 'plantas') pool = templates.plantas;
    else if (categoria === 'paisajes') pool = templates.paisajes;
    if (pool?.length > 0) {
      const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
      setFormValues(prev => ({ ...prev, nombre: prev.nombre || "Espécimen Extraño", ...randomTemplate }));
    }
  };

  const handleGuardarEnAlbum = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const payload = {
        user_id: session.user.id,
        nombre: formValues.nombre, categoria, raza: formValues.raza,
        personalidad: formValues.personalidad, caracteristica: formValues.caracteristica,
        lugar: formValues.lugar, dato: formValues.dato, imagen_url: croppedImage 
      };
      const { error } = cardToEdit 
        ? await supabase.from('cards').update(payload).eq('id', cardToEdit.id)
        : await supabase.from('cards').insert([payload]);
      if (error) throw error;
      Swal.fire('¡Éxito!', 'Cambios guardados', 'success').then(onCancel);
    } catch (error) { Swal.fire('Error', error.message, 'error'); }
  };

  return (
    <div className="card-creator-container container my-4 text-white">
      {!cardToEdit && paso === 'categoria' && (
        <div className="text-center p-4 bg-dark-card rounded-4 shadow max-w-md mx-auto">
          <h4>📋 Categoría</h4>
          <select className="form-select mb-3" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Selecciona...</option>
            <option value="perros">Perros</option><option value="gatos">Gatos</option>
            <option value="aves">Aves</option><option value="plantas">Plantas</option><option value="paisajes">Paisajes</option>
          </select>
          <button className="btn btn-success" disabled={!categoria} onClick={() => setPaso('crop')}>Siguiente</button>
        </div>
      )}

      {paso === 'crop' && (
        <div className="bg-dark-card p-4 rounded-4 text-center max-w-md mx-auto">
          <Cropper image={previewUrl} crop={crop} zoom={zoom} aspect={3/4} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
          <button className="btn btn-warning mt-3" onClick={generarImagenRecortada}>Cortar</button>
        </div>
      )}

      {paso === 'formulario' && (
        <div className="row g-4 justify-content-center">
          <div className="col-md-5 text-center">
            <img src={croppedImage} className="img-fluid rounded" alt="Preview" />
          </div>
          <div className="col-md-7 bg-dark-card p-4 rounded-4">
            <div className="d-flex justify-content-between mb-3">
              <h4>{cardToEdit ? '✏️ Editar' : '✍️ Crear'}</h4>
              <button className="btn btn-warning btn-sm" onClick={handleRandomize}>🎲 Random</button>
            </div>
            <input name="nombre" className="form-control mb-2" value={formValues.nombre} onChange={handleInputChange} placeholder="Nombre" />
            
            {['perros', 'gatos', 'aves'].includes(categoria) && (
              <>
                <input name="raza" className="form-control mb-2" value={formValues.raza} onChange={handleInputChange} placeholder="Raza" />
                <input name="personalidad" className="form-control mb-2" value={formValues.personalidad} onChange={handleInputChange} placeholder="Personalidad" />
              </>
            )}
            {(categoria === 'plantas' || categoria === 'paisajes') && (
              <input name="lugar" className="form-control mb-2" value={formValues.lugar} onChange={handleInputChange} placeholder="Lugar" />
            )}
            <textarea name="dato" className="form-control mb-2" value={formValues.dato} onChange={handleInputChange} placeholder="Dato curioso" />
            
            <button className="btn btn-success w-100" onClick={handleGuardarEnAlbum}>Guardar Cambios</button>
            <button className="btn btn-outline-danger w-100 mt-2" onClick={onCancel}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardCreator;