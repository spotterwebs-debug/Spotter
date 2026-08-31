// src/components/NavBar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const albumCategorias = [
    'perros',
    'gatos',
    'plantas',
    'aves',
    'paisajes'
  ];

  // ==========================================
  // USUARIO Y ROL
  // ==========================================

  useEffect(() => {
    const fetchUserAndRole = async (sessionUser) => {
      setUser(sessionUser ?? null);

      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single();

        setIsAdmin(
          profile?.role === 'admin'
        );
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth
      .getSession()
      .then(
        ({ data: { session } }) => {
          fetchUserAndRole(
            session?.user
          );
        }
      );

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserAndRole(
          session?.user
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // ==========================================
  // CERRAR MENÚ SI TOCAMOS FUERA
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo nos interesa en versión mobile/tablet
      if (window.innerWidth >= 992) {
        return;
      }

      const navbarCollapse =
        document.querySelector('#navbarNav');

      const navbarToggler =
        document.querySelector(
          '.spooter-navbar .navbar-toggler'
        );

      if (!navbarCollapse || !navbarToggler) {
        return;
      }

      const menuEstaAbierto =
        navbarCollapse.classList.contains('show');

      if (!menuEstaAbierto) {
        return;
      }

      // Si tocamos dentro del menú,
      // no hacemos nada.
      const clickDentroDelMenu =
        navbarCollapse.contains(event.target);

      // Si tocamos la hamburguesa,
      // dejamos que Bootstrap haga su trabajo.
      const clickEnHamburguesa =
        navbarToggler.contains(event.target);

      if (
        !clickDentroDelMenu &&
        !clickEnHamburguesa
      ) {
        navbarToggler.click();
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    document.addEventListener(
      'touchstart',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

      document.removeEventListener(
        'touchstart',
        handleClickOutside
      );
    };
  }, []);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setIsAdmin(false);

    navigate('/login');
  };


  // ==========================================
  // CERRAR MENÚ MOBILE
  // ==========================================

  const closeNavbar = () => {
    const navbarCollapse =
      document.querySelector(
        '#navbarNav'
      );

    const navbarToggler =
      document.querySelector(
        '.spooter-navbar .navbar-toggler'
      );

    if (
      navbarCollapse?.classList.contains(
        'show'
      )
    ) {
      navbarToggler?.click();
    }
  };


  // ==========================================
  // NOMBRE USUARIO
  // ==========================================

  const userAlias =
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Usuario';


  return (
    <nav className="navbar navbar-expand-lg spooter-navbar">

      <div className="container-fluid px-3 px-md-4 navbar-main-container">

        {/* ====================================
            CABECERA MOBILE + LOGO
        ==================================== */}

        <div className="navbar-top">

          {/* LOGO */}
          <NavLink
            className="navbar-brand m-0"
            to="/"
            onClick={closeNavbar}
          >
            <img
              src="/logo.png"
              alt="Spotter"
            />
          </NavLink>


          {/* CONTROLES SUPERIORES */}
          <div className="navbar-top-controls">

            {/* MODO CLARO / OSCURO */}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Activar modo claro'
                  : 'Activar modo oscuro'
              }
              title={
                theme === 'dark'
                  ? 'Modo claro'
                  : 'Modo oscuro'
              }
            >
              {theme === 'dark'
                ? '☀️'
                : '🌙'}
            </button>


            {/* HAMBURGUESA */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Abrir menú"
            >
              <span className="navbar-toggler-icon" />
            </button>

          </div>

        </div>


        {/* ====================================
            USUARIO / LOGIN
        ==================================== */}

        <div className="navbar-user-area">

          {user ? (

            <span className="navbar-user-badge">

              👋 Hola:{' '}

              <span className="text-capitalize">
                {userAlias}
              </span>

            </span>

          ) : (

            <NavLink
              to="/login"
              className="navbar-login-btn"
              onClick={closeNavbar}
            >
              🔑 Login
            </NavLink>

          )}

        </div>


        {/* ====================================
            NAVEGACIÓN
        ==================================== */}

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav ms-auto">

            {/* HOME */}
            <li className="nav-item">

              <NavLink
                className="nav-link"
                to="/"
                end
                onClick={closeNavbar}
              >
                Home
              </NavLink>

            </li>


            {/* COMUNIDAD */}
            <li className="nav-item">

              <NavLink
                className="nav-link"
                to="/comunidad"
                onClick={closeNavbar}
              >
                Comunidad
              </NavLink>

            </li>


            {/* ÁLBUMES */}
            {albumCategorias.map(
              (cat) => (

                <li
                  className="nav-item"
                  key={cat}
                >

                  <NavLink
                    className="nav-link text-capitalize"
                    to={`/album/${cat}`}
                    onClick={closeNavbar}
                  >
                    {cat}
                  </NavLink>

                </li>

              )
            )}


            {/* ADMIN */}
            {isAdmin && (

              <li className="nav-item">

                <NavLink
                  className="nav-link admin-link"
                  to="/admin"
                  onClick={closeNavbar}
                >
                  ⚙️ Admin
                </NavLink>

              </li>

            )}


            {/* CERRAR SESIÓN */}
            {user && (

              <li className="nav-item navbar-logout-item">

                <button
                  type="button"
                  className="navbar-logout-btn"
                  onClick={async () => {
                    closeNavbar();
                    await handleLogout();
                  }}
                >
                  <i className="bi bi-box-arrow-right" />

                  {' '}

                  Cerrar sesión
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