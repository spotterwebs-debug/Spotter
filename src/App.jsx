// src/App.jsx

import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Album from './components/Album';
import Create from './components/Create';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import EditCards from './components/EditCards';
import Comunidad from './components/Comunidad';
import Challenges from './components/Challenges';
import Premios from './components/Premios';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [sharedPhoto, setSharedPhoto] = useState(null);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('spotter-theme');

    if (savedTheme) {
      return savedTheme;
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem(
      'spotter-theme',
      theme
    );
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) =>
      prevTheme === 'light'
        ? 'dark'
        : 'light'
    );
  }

  return (
    <Router>

      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="content-container">

        <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

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

          <Route
            path="/badges/:categoria"
            element={<Premios />}
          />

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