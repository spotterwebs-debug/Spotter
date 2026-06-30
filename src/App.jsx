// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar'; 
import Home from './pages/Home';
import Album from './components/Album';
import Login from './pages/Login';
import EditCards from './components/EditCards'; // 👈 Importado desde components como pediste

function App() {
  // Este es el puente de la foto entre pantallas
  const [sharedPhoto, setSharedPhoto] = useState(null);

  return (
    <Router>
      <Navbar />
      
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />
        
        <Route 
          path="/" 
          element={<Home capturedPhoto={sharedPhoto} setCapturedPhoto={setSharedPhoto} />} 
        />
        
        <Route 
          path="/album/:categoria" 
          element={<Album onPhotoCaptured={(photoUrl) => setSharedPhoto(photoUrl)} />} 
        />

        {/* Ruta de edición apuntando a tu componente en components */}
        <Route 
          path="/edit/:id" 
          element={<EditCards />} 
        />
      </Routes>
    </Router>
  );
}

export default App;