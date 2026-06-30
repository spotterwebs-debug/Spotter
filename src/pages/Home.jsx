// src/pages/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import CardCreator from '../components/CardCreator'; // <-- No te olvides de importar el creador

// Desestructuramos las props que le manda App.jsx: capturedPhoto y setCapturedPhoto
function Home({ capturedPhoto, setCapturedPhoto }) {
  return (
    <div className="home-page bg-dark" style={{ minHeight: '90vh' }}>
      <div className="container py-4">
        
        
        {!capturedPhoto ? (
          <Hero onPhotoCaptured={(photoUrl) => setCapturedPhoto(photoUrl)} />
        ) : (
          <CardCreator 
            previewUrl={capturedPhoto} 
            onCancel={() => setCapturedPhoto(null)} // Si cancela, limpia la foto y vuelve el Hero
          />
        )}
        
      </div>
    </div>
  );
}

export default Home;