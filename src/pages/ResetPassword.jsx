// src/pages/ResetPassword.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificamos que tenga al menos 6 caracteres
    if (password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        confirmButtonColor: '#2b6cb0',
      });

      return;
    }

    // Verificamos que ambas contraseñas coincidan
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Volvé a escribirlas e intentá nuevamente.',
        confirmButtonColor: '#2b6cb0',
      });

      return;
    }

    setLoading(true);

    // Actualizamos la contraseña en Supabase
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar la contraseña',
        text: error.message,
        confirmButtonColor: '#2b6cb0',
      });

      return;
    }

    // Todo salió bien
    await Swal.fire({
      icon: 'success',
      title: '¡Contraseña actualizada!',
      text: 'Tu nueva contraseña fue guardada correctamente.',
      confirmButtonColor: '#2b6cb0',
    });

    navigate('/');
  };

  // ==========================================
  // VISTA
  // ==========================================

  return (
    <div
      className="container d-flex justify-content-center align-items-center my-5"
      style={{ minHeight: '60vh' }}
    >
      <div
        className="card shadow-lg p-4 rounded-4 border-0"
        style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: '#ffffff',
        }}
      >
        {/* ICONO Y TÍTULO */}

        <div className="text-center mb-4">
          <i
            className="bi bi-shield-lock"
            style={{
              fontSize: '3rem',
              color: '#2b6cb0',
            }}
          ></i>

          <h2
            className="fw-bold mt-2"
            style={{ color: '#1a365d' }}
          >
            Nueva contraseña
          </h2>

          <p className="text-secondary">
            Elegí una nueva contraseña para tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NUEVA CONTRASEÑA */}

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary">
              Nueva contraseña
            </label>

            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-lock"></i>
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={
                    showPassword
                      ? 'bi bi-eye-slash'
                      : 'bi bi-eye'
                  }
                ></i>
              </button>
            </div>
          </div>

          {/* CONFIRMAR CONTRASEÑA */}

          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary">
              Repetir contraseña
            </label>

            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-lock-fill"></i>
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* BOTÓN */}

          <button
            type="submit"
            className="btn w-100 py-2 rounded-pill fw-bold text-white"
            style={{
              background: '#2b6cb0',
              border: 'none',
            }}
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar nueva contraseña'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ResetPassword;