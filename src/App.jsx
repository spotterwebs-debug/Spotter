// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar'; 
import Footer from './components/Footer'; 
import Home from './pages/Home';
import Album from './components/Album';
import Create from './components/Create';
import Login from './pages/Login';
import EditCards from './components/EditCards';

function App() {
  const [sharedPhoto, setSharedPhoto] = useState(null);

  return (
    <Router>
      {/* Navbar visible en TODAS las rutas */}
      <Navbar />
      
      <main className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Aquí le pasas las props al Home para que pueda renderizar Hero o Creator */}
          <Route 
            path="/" 
            element={<Home capturedPhoto={sharedPhoto} setCapturedPhoto={setSharedPhoto} />} 
          />
          
          <Route 
            path="/album/:categoria" 
            element={<Album setSharedPhoto={setSharedPhoto} />} 
          />
          <Route 
            path="/create" 
            element={<Create capturedPhoto={sharedPhoto} setCapturedPhoto={setSharedPhoto} />} 
          />
          <Route path="/edit/:id" element={<EditCards />} />
        </Routes>
      </main>

      {/* Footer visible en TODAS las rutas */}
      <Footer /> 
    </Router>
  );
}

export default App;