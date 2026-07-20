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
  const [isAdmin, setIsAdmin] = useState(false);
  const albumCategorias = ['perros', 'gatos', 'plantas', 'aves', 'paisajes'];

  useEffect(() => {
    const fetchUserAndRole = async (sessionUser) => {
      setUser(sessionUser ?? null);
      if (sessionUser) {
        // Consultamos el rol en la tabla profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };

    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session?.user);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    navigate('/login');
  };

  const closeNavbar = () => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarCollapse?.classList.contains('show')) navbarToggler.click();
  };

  const userAlias = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario';

  return (
    <nav className="navbar navbar-expand-lg spooter-navbar">
      <div className="container-fluid px-3 px-md-4">
        
        {/* LOGO */}
        <NavLink className="navbar-brand m-0" to="/">
          <img src="/logo.png" alt="Spotter" height="40" />
        </NavLink>

        <div className="ms-auto me-2 d-flex align-items-center">
          {user ? (
            <span className="badge bg-success rounded-pill px-3 py-2 fw-semibold text-white">
              👋 Hola: <span className="text-capitalize">{userAlias}</span>
            </span>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">
              🔑 Login
            </NavLink>
          )}
        </div>

        {/* HAMBURGUESA */}
        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENÚ DESPLEGABLE */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
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

            {/* ENLACE AL PANEL ADMIN (Solo si es admin) */}
            {isAdmin && (
              <li className="nav-item">
                <NavLink 
                  className="nav-link text-warning fw-bold" 
                  to="/admin" 
                  onClick={closeNavbar}
                >
                  ⚙️ Admin
                </NavLink>
              </li>
            )}
            
            {/* BOTÓN LOGOUT */}
            {user && (
              <li className="nav-item mt-3 mt-lg-0">
                <button 
                  className="btn btn-outline-light w-100" 
                  onClick={() => { handleLogout(); closeNavbar(); }}
                >
                  <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;