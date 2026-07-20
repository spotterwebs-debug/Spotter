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
import Comunidad from './components/Comunidad';
import Challenges from './components/Challenges';
import Premios from './components/Premios';
import AdminDashboard from './components/AdminDashboard'; // 1. Importamos con el nombre correcto

function App() {
  const [sharedPhoto, setSharedPhoto] = useState(null);

  return (
    <Router>
      
      <Navbar />
      
      <main className="content-container">

        <Routes>

          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <Home 
                capturedPhoto={sharedPhoto} 
                setCapturedPhoto={setSharedPhoto} 
              />
            } 
          />
          
          <Route 
            path="/album/:categoria" 
            element={
              <Album 
                setSharedPhoto={setSharedPhoto} 
              />
            } 
          />

          <Route
            path="/challenges/:categoria"
            element={<Challenges />}
          />

          <Route
            path="/premios"
            element={<Premios />}
          />

          {/* 2. Usamos AdminDashboard en la ruta */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route 
            path="/create" 
            element={
              <Create 
                capturedPhoto={sharedPhoto} 
                setCapturedPhoto={setSharedPhoto} 
              />
            } 
          />

          <Route 
            path="/edit/:id" 
            element={<EditCards />} 
          />
          
          <Route 
            path="/comunidad" 
            element={<Comunidad />} 
          /> 

        </Routes>

      </main>
      
      <Footer /> 

    </Router>
  );
}

export default App;