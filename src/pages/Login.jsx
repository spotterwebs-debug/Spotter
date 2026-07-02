// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 👈 Corregido: apunta a la raíz de src
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/');
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username: username.trim() }
        }
      });

      if (error) {
        setLoading(false);
        Swal.fire('Error al crear cuenta', error.message, 'error');
      } else {
        setLoading(false);
        Swal.fire({
          title: '¡Bienvenido a Spotter!',
          text: 'Cuenta creada con éxito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => navigate('/'));
      }
    } else {
      // INICIAR SESIÓN (Guarda la sesión local de manera persistente en el dispositivo)
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setLoading(false);
        Swal.fire('Error al ingresar', 'Usuario o contraseña incorrectos.', 'error');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg p-4 rounded-4 border-0" style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: '#1a365d' }}>
            {isRegistering ? 'Crear Cuenta' : 'Ingresar a Spotter'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campo Nombre de Usuario (Solo visible en modo registro) */}
          {isRegistering && (
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Nombre de usuario</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary"><i className="bi bi-person"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Elige tu alias" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          {/* Campo Correo */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary">Correo</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary"><i className="bi bi-envelope"></i></span>
              <input 
                type="email" 
                className="form-control" 
                placeholder="tu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary"><i className="bi bi-lock"></i></span>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn w-100 py-2 rounded-pill fw-bold text-white mb-3"
            style={{ background: '#2b6cb0', border: 'none' }} 
            disabled={loading}
          >
            {loading ? 'Procesando...' : isRegistering ? 'Registrarme' : 'Iniciar Sesión'}
          </button>
        </form>

        <button 
          className="btn btn-link w-100 text-decoration-none small text-primary" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Registrate gratis'}
        </button>
      </div>
    </div>
  );
}

export default Login;