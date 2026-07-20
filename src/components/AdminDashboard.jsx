import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta a tu cliente de Supabase

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Cargar la lista de perfiles/usuarios
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, updated_at, role');

    if (error) {
      setErrorMsg('Error al cargar usuarios: ' + error.message);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Función para borrar usuario
  const handleDeleteUser = async (userId, username) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${username || userId}"? Esto borrará todas sus cartas y datos.`);
    
    if (!confirmDelete) return;

    // Llamamos a la función segura de Postgres (RPC)
    const { error } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: userId
    });

    if (error) {
      alert('Hubo un error al borrar el usuario: ' + error.message);
    } else {
      alert('Usuario eliminado correctamente.');
      // Actualizamos la lista en pantalla
      fetchUsers();
    }
  };

  if (loading) return <div className="p-6 text-dark fw-bold">Cargando panel de administración...</div>;

  return (
    <div className="container mt-4 mb-5 text-dark" style={{ minHeight: '80vh' }}>
      <h1 className="mb-4 fw-bold">Panel de Administración - Spottler</h1>
      
      {errorMsg && <div className="alert alert-danger p-3 rounded mb-4">{errorMsg}</div>}

      <div className="table-responsive shadow-sm rounded bg-white p-3 border">
        <table className="table table-hover table-bordered align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">ID</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 fw-semibold text-dark">{user.username || 'Sin nombre'}</td>
                <td className="p-3">
                  <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="p-3 text-muted font-monospace small text-truncate" style={{ maxWidth: '200px' }}>
                  {user.id}
                </td>
                <td className="p-3 text-center">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="btn btn-danger btn-sm px-3"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-muted">No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}