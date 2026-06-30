// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const albumCategorias = ['perros', 'gatos', 'plantas', 'aves', 'paisajes'];

  // Escuchamos la sesión de Supabase de manera global en el componente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const closeNavbar = () => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarCollapse?.classList.contains('show')) navbarToggler.click();
  };

  // Extraemos de forma segura el alias que el usuario cargó en las opciones de registro
  const userAlias = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario';

  return (
    <nav className="navbar navbar-expand-lg spooter-navbar">
      <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between">
        
        {/* LADO IZQUIERDO: LOGO */}
        <NavLink className="navbar-brand m-0" to="/">
          <img 
            src="/logo.png" 
            alt="Spotter" 
            height="40" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        </NavLink>

        {/* =================================================================
            ZONA CENTRAL/DERECHA (EXTERNA): CONTROL DE AUTENTICACIÓN
            Queda fija afuera de la hamburguesa, ideal para Mobile
            ================================================================= */}
        <div className="ms-auto me-2 d-flex align-items-center auth-nav-zone">
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success rounded-pill px-3 py-2 fw-semibold text-white">
                👋 Hola: <span className="text-capitalize">{userAlias}</span>
              </span>
              <button 
                className="btn btn-sm btn-outline-danger rounded-circle border-0 p-1" 
                onClick={handleLogout}
                title="Cerrar Sesión"
              >
                <i className="bi bi-box-arrow-right fs-5"></i>
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">
              🔑 Login
            </NavLink>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA (Controla SOLO el despliegue del menú de links) */}
        <button 
          className="navbar-toggler p-1 border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ width: '1.25rem', height: '1.25rem' }}></span>
        </button>

        {/* CONTENIDO DESPLEGABLE (MENÚ DE NAVEGACIÓN) */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center pt-2 pt-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={closeNavbar}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/comunidad" onClick={closeNavbar}>Comunidad</NavLink>
            </li>
            {albumCategorias.map((cat) => (
              <li className="nav-item" key={cat}>
                <NavLink className="nav-link text-capitalize" to={`/album/${cat}`} onClick={closeNavbar}>
                  {cat}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;