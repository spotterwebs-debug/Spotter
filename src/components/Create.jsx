import React from 'react';
import CardCreator from '../components/cardcreator/CardCreator';

function Create({ capturedPhoto, setCapturedPhoto }) {
  return (
    <div className="container py-4">
      <CardCreator
        fileFromAlbum={capturedPhoto?.file}
        categoriaInicial={capturedPhoto?.categoria}
        onCancel={() => setCapturedPhoto(null)}
      />
    </div>
  );
}

export default Create;