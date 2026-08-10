import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {

  // ==========================================
  // ESTADOS
  // ==========================================

  const [users, setUsers] = useState([]);

  // Todos los reportes sirven para estadísticas
  const [allReports, setAllReports] = useState([]);

  // Solo pendientes para moderación
  const [reports, setReports] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');


  // ==========================================
  // NORMALIZAR CARD DE UN REPORTE
  // ==========================================

  const getReportCard = (report) => {

    if (!report?.cards) {
      return null;
    }

    // Por si Supabase devuelve relación como array
    if (Array.isArray(report.cards)) {
      return report.cards[0] || null;
    }

    return report.cards;
  };


  // ==========================================
  // CARGAR USUARIOS
  // ==========================================

  const fetchUsers = async () => {

    setLoadingUsers(true);

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, updated_at, role'
      );

    if (error) {

      console.error(
        'Error cargando usuarios:',
        error
      );

      setErrorMsg(
        'Error al cargar usuarios: ' +
        error.message
      );

    } else {

      setUsers(
        data || []
      );

    }

    setLoadingUsers(false);
  };


  // ==========================================
  // CARGAR REPORTES
  // ==========================================

  const fetchReports = async () => {

    setLoadingReports(true);

    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        card_id,
        reporter_user_id,
        reason,
        status,
        created_at,
        resolved_at,
        resolution,
        cards (
          id,
          nombre,
          categoria,
          imagen_url,
          user_id,
          publica,
          is_public
        )
      `)
      .order(
        'created_at',
        {
          ascending: false
        }
      );

    if (error) {

      console.error(
        'Error cargando reportes:',
        error
      );

      setErrorMsg(
        'Error al cargar reportes: ' +
        error.message
      );

      setAllReports([]);
      setReports([]);

    } else {

      const reportes =
        data || [];

      // Guardamos TODOS
      setAllReports(
        reportes
      );

      // Panel de moderación:
      // solamente pendientes
      setReports(
        reportes.filter(
          (report) =>
            report.status === 'pending'
        )
      );

    }

    setLoadingReports(false);
  };


  // ==========================================
  // CARGAR TODO
  // ==========================================

  useEffect(() => {

    fetchUsers();

    fetchReports();

  }, []);


  // ==========================================
  // ESTADÍSTICAS DE REPORTES POR USUARIO
  // ==========================================

  const userReportStats = useMemo(() => {

    const stats = {};

    allReports.forEach((report) => {

      const card =
        getReportCard(report);

      const ownerId =
        card?.user_id;

      if (!ownerId) {
        return;
      }

      if (!stats[ownerId]) {

        stats[ownerId] = {
          reports: 0,
          incidents: 0
        };

      }

      // ======================================
      // TOTAL DE REPORTES RECIBIDOS
      // ======================================

      stats[ownerId].reports += 1;


      // ======================================
      // INCIDENCIA VÁLIDA
      // ======================================

      const resolucionesValidas = [
        'hidden_from_community',
        'deleted_by_admin'
      ];

      const fueMovida =
        typeof report.resolution === 'string' &&
        report.resolution.startsWith(
          'moved_to_'
        );

      const esIncidencia =
        report.status === 'resolved' &&
        (
          resolucionesValidas.includes(
            report.resolution
          ) ||
          fueMovida
        );

      if (esIncidencia) {

        stats[ownerId].incidents += 1;

      }

    });

    return stats;

  }, [allReports]);


  // ==========================================
  // OBTENER ESTADÍSTICAS DE USUARIO
  // ==========================================

  const getUserStats = (userId) => {

    return (
      userReportStats[userId] || {
        reports: 0,
        incidents: 0
      }
    );

  };


  // ==========================================
  // ESTADO DEL USUARIO
  // ==========================================

  const getUserStatus = (
    incidents
  ) => {

    if (incidents >= 10) {

      return {
        label:
          'Reincidente',

        icon:
          '🔴',

        className:
          'bg-danger'
      };

    }

    if (incidents >= 6) {

      return {
        label:
          'Revisar',

        icon:
          '🟠',

        className:
          'bg-warning text-dark'
      };

    }

    if (incidents >= 3) {

      return {
        label:
          'Atención',

        icon:
          '🟡',

        className:
          'bg-warning text-dark'
      };

    }

    return {
      label:
        'Normal',

      icon:
        '🟢',

      className:
        'bg-success'
    };

  };


  // ==========================================
  // BORRAR USUARIO
  // ==========================================

  const handleDeleteUser = async (
    userId,
    username
  ) => {

    const stats =
      getUserStats(userId);

    const result =
      await Swal.fire({

        icon:
          'warning',

        title:
          '¿Eliminar usuario?',

        html: `
          Vas a eliminar al usuario
          <strong>${username || userId}</strong>.
          
          <br><br>

          Reportes recibidos:
          <strong>${stats.reports}</strong>

          <br>

          Incidencias confirmadas:
          <strong>${stats.incidents}</strong>

          <br><br>

          Esta acción borrará todas sus
          cartas y datos.
        `,

        showCancelButton:
          true,

        confirmButtonText:
          'Sí, eliminar',

        cancelButtonText:
          'Cancelar',

        confirmButtonColor:
          '#dc3545'

      });

    if (!result.isConfirmed) {
      return;
    }


    const { error } =
      await supabase.rpc(
        'delete_user_by_admin',
        {
          target_user_id:
            userId
        }
      );


    if (error) {

      await Swal.fire({

        icon:
          'error',

        title:
          'Error',

        text:
          'Hubo un error al borrar el usuario: ' +
          error.message

      });

      return;

    }


    await Swal.fire({

      icon:
        'success',

      title:
        'Usuario eliminado',

      timer:
        1500,

      showConfirmButton:
        false

    });


    await fetchUsers();

    await fetchReports();
  };


  // ==========================================
  // RESOLVER REPORTE
  // ==========================================

  const resolverReporte = async (
    reportId,
    resolution
  ) => {

    const { error } =
      await supabase
        .from('reports')
        .update({

          status:
            'resolved',

          resolved_at:
            new Date().toISOString(),

          resolution

        })
        .eq(
          'id',
          reportId
        );


    if (error) {

      throw new Error(
        'No se pudo cerrar el reporte: ' +
        error.message
      );

    }

  };


  // ==========================================
  // MOVER CATEGORÍA
  // ==========================================

  const handleMoverCategoria = async (
    report
  ) => {

    const card =
      getReportCard(report);

    if (!card) {
      return;
    }


    const {
      value: nuevaCategoria
    } =
      await Swal.fire({

        title:
          'Mover publicación',

        text:
          `Categoría actual: ${card.categoria}`,

        input:
          'select',

        inputOptions: {

          perros:
            '🐶 Perros',

          gatos:
            '🐱 Gatos',

          plantas:
            '🌿 Plantas',

          aves:
            '🐦 Aves',

          paisajes:
            '⛰️ Paisajes'

        },

        inputPlaceholder:
          'Elegí una nueva categoría',

        showCancelButton:
          true,

        confirmButtonText:
          'Mover',

        cancelButtonText:
          'Cancelar',

        inputValidator:
          (value) => {

            if (!value) {
              return 'Elegí una categoría';
            }

          }

      });


    if (!nuevaCategoria) {
      return;
    }


    try {

      // ======================================
      // RPC SEGURA DE ADMIN
      // ======================================

      const { error } =
        await supabase.rpc(
          'moderate_card_by_admin',
          {

            target_card_id:
              card.id,

            action_type:
              'move',

            new_category:
              nuevaCategoria

          }
        );


      if (error) {
        throw error;
      }


      // ======================================
      // RESOLVER REPORTE
      // ======================================

      await resolverReporte(
        report.id,
        `moved_to_${nuevaCategoria}`
      );


      await Swal.fire({

        icon:
          'success',

        title:
          'Publicación movida',

        text:
          `La card ahora está en ${nuevaCategoria}.`,

        timer:
          1700,

        showConfirmButton:
          false

      });


      await fetchReports();


    } catch (error) {

      console.error(
        'Error moviendo publicación:',
        error
      );


      await Swal.fire({

        icon:
          'error',

        title:
          'No se pudo mover',

        text:
          error.message

      });

    }

  };


  // ==========================================
  // OCULTAR DE COMUNIDAD
  // ==========================================

  const handleOcultarCard = async (
    report
  ) => {

    const card =
      getReportCard(report);

    if (!card) {
      return;
    }


    const result =
      await Swal.fire({

        icon:
          'warning',

        title:
          '¿Ocultar de Comunidad?',

        text:
          'La card seguirá perteneciendo al usuario y continuará en su álbum, pero dejará de aparecer públicamente.',

        showCancelButton:
          true,

        confirmButtonText:
          'Sí, ocultar',

        cancelButtonText:
          'Cancelar'

      });


    if (!result.isConfirmed) {
      return;
    }


    try {

      const { error } =
        await supabase.rpc(
          'moderate_card_by_admin',
          {

            target_card_id:
              card.id,

            action_type:
              'hide',

            new_category:
              null

          }
        );


      if (error) {
        throw error;
      }


      await resolverReporte(
        report.id,
        'hidden_from_community'
      );


      await Swal.fire({

        icon:
          'success',

        title:
          'Publicación ocultada',

        text:
          'La card ya no aparecerá en Comunidad.',

        timer:
          1600,

        showConfirmButton:
          false

      });


      await fetchReports();


    } catch (error) {

      console.error(
        'Error ocultando publicación:',
        error
      );


      await Swal.fire({

        icon:
          'error',

        title:
          'No se pudo ocultar',

        text:
          error.message

      });

    }

  };


  // ==========================================
  // ELIMINAR PUBLICACIÓN
  // ==========================================

  const handleEliminarCard = async (
    report
  ) => {

    const card =
      getReportCard(report);

    if (!card) {
      return;
    }


    const result =
      await Swal.fire({

        icon:
          'warning',

        title:
          '¿Eliminar publicación?',

        html: `
          Vas a eliminar definitivamente
          <strong>${card.nombre || 'esta publicación'}</strong>.

          <br><br>

          Usá esta opción para contenido
          realmente inapropiado.
        `,

        showCancelButton:
          true,

        confirmButtonText:
          'Eliminar definitivamente',

        cancelButtonText:
          'Cancelar',

        confirmButtonColor:
          '#dc3545'

      });


    if (!result.isConfirmed) {
      return;
    }


    try {

      // ======================================
      // IMPORTANTE:
      // RESOLVEMOS ANTES DE BORRAR
      // ======================================

      await resolverReporte(
        report.id,
        'deleted_by_admin'
      );


      const { error } =
        await supabase.rpc(
          'moderate_card_by_admin',
          {

            target_card_id:
              card.id,

            action_type:
              'delete',

            new_category:
              null

          }
        );


      if (error) {
        throw error;
      }


      await Swal.fire({

        icon:
          'success',

        title:
          'Publicación eliminada',

        timer:
          1600,

        showConfirmButton:
          false

      });


      await fetchReports();


    } catch (error) {

      console.error(
        'Error eliminando publicación:',
        error
      );


      await Swal.fire({

        icon:
          'error',

        title:
          'No se pudo eliminar',

        text:
          error.message

      });

    }

  };


  // ==========================================
  // CERRAR REPORTE SIN CAMBIOS
  // ==========================================

  const handleCerrarReporte = async (
    report
  ) => {

    const result =
      await Swal.fire({

        icon:
          'question',

        title:
          '¿Cerrar reporte?',

        text:
          'La publicación quedará exactamente como está.',

        showCancelButton:
          true,

        confirmButtonText:
          'Cerrar reporte',

        cancelButtonText:
          'Cancelar'

      });


    if (!result.isConfirmed) {
      return;
    }


    try {

      await resolverReporte(
        report.id,
        'no_action'
      );


      await Swal.fire({

        icon:
          'success',

        title:
          'Reporte cerrado',

        timer:
          1300,

        showConfirmButton:
          false

      });


      await fetchReports();


    } catch (error) {

      await Swal.fire({

        icon:
          'error',

        title:
          'Error',

        text:
          error.message

      });

    }

  };


  // ==========================================
  // TRADUCIR MOTIVO
  // ==========================================

  const getReasonLabel = (
    reason
  ) => {

    const labels = {

      categoria_incorrecta:
        '📂 Categoría incorrecta',

      contenido_inapropiado:
        '⚠️ Contenido inapropiado',

      spam:
        '🚫 Spam',

      otro:
        '💬 Otro motivo'

    };


    return (
      labels[reason] ||
      reason
    );

  };


  // ==========================================
  // ORDENAR USUARIOS POR INCIDENCIAS
  // ==========================================

  const usuariosOrdenados =
    useMemo(() => {

      return [...users].sort(
        (a, b) => {

          const statsA =
            getUserStats(a.id);

          const statsB =
            getUserStats(b.id);


          return (
            statsB.incidents -
            statsA.incidents
          );

        }
      );

    }, [
      users,
      userReportStats
    ]);


  // ==========================================
  // CARGA GENERAL
  // ==========================================

  if (
    loadingUsers &&
    loadingReports
  ) {

    return (

      <div className="container mt-5 text-center">

        Cargando panel de administración...

      </div>

    );

  }


  // ==========================================
  // VISTA
  // ==========================================

  return (

    <div
      className="container mt-4 mb-5 text-dark"

      style={{
        minHeight:
          '80vh',

        paddingBottom:
          '150px'
      }}
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <h1 className="mb-4">

        🛡️ Panel de Administración - Spotter

      </h1>


      {errorMsg && (

        <div className="alert alert-danger p-3 rounded mb-4">

          {errorMsg}

        </div>

      )}


      {/* ======================================
          PUBLICACIONES REPORTADAS
      ====================================== */}

      <section className="mb-5">

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h2 className="h4 m-0">

            🚩 Publicaciones reportadas

          </h2>


          <span className="badge bg-danger">

            {reports.length} pendientes

          </span>

        </div>


        {loadingReports ? (

          <div className="text-center py-4">

            <div className="spinner-border text-danger" />

            <p className="mt-2 text-muted">

              Cargando reportes...

            </p>

          </div>

        ) : reports.length === 0 ? (

          <div className="alert alert-success">

            ✅ No hay publicaciones pendientes de revisión.

          </div>

        ) : (

          <div className="row g-3">

            {reports.map(
              (report) => {

                const card =
                  getReportCard(
                    report
                  );


                return (

                  <div
                    className="col-12 col-md-6 col-lg-4"

                    key={
                      report.id
                    }
                  >

                    <div className="card h-100 shadow-sm border-danger">


                      {/* =====================
                          FOTO
                      ===================== */}

                      {card?.imagen_url ? (

                        <img
                          src={
                            card.imagen_url
                          }

                          alt={
                            card.nombre ||
                            'Publicación reportada'
                          }

                          className="card-img-top"

                          style={{
                            height:
                              '230px',

                            objectFit:
                              'cover'
                          }}
                        />

                      ) : (

                        <div
                          className="d-flex align-items-center justify-content-center bg-light text-muted"

                          style={{
                            height:
                              '230px'
                          }}
                        >

                          Sin imagen

                        </div>

                      )}


                      <div className="card-body">


                        <h5 className="card-title">

                          {card?.nombre ||
                            'Sin nombre'}

                        </h5>


                        <p className="mb-1">

                          <strong>
                            Categoría:
                          </strong>{' '}

                          {card?.categoria ||
                            '-'}

                        </p>


                        <p className="mb-1">

                          <strong>
                            Motivo:
                          </strong>{' '}

                          {getReasonLabel(
                            report.reason
                          )}

                        </p>


                        <p className="mb-1 small text-muted">

                          <strong>
                            Dueño:
                          </strong>{' '}

                          {card?.user_id ||
                            '-'}

                        </p>


                        <p className="mb-3 small text-muted">

                          Reportado:{' '}

                          {new Date(
                            report.created_at
                          ).toLocaleString(
                            'es-UY'
                          )}

                        </p>


                        {/* =====================
                            ACCIONES
                        ===================== */}

                        <div className="d-grid gap-2">


                          <button
                            type="button"

                            className="btn btn-warning"

                            onClick={() =>
                              handleMoverCategoria(
                                report
                              )
                            }
                          >

                            📂 Mover categoría

                          </button>


                          <button
                            type="button"

                            className="btn btn-secondary"

                            onClick={() =>
                              handleOcultarCard(
                                report
                              )
                            }
                          >

                            🙈 Ocultar de Comunidad

                          </button>


                          <button
                            type="button"

                            className="btn btn-danger"

                            onClick={() =>
                              handleEliminarCard(
                                report
                              )
                            }
                          >

                            🗑️ Eliminar publicación

                          </button>


                          <button
                            type="button"

                            className="btn btn-outline-secondary"

                            onClick={() =>
                              handleCerrarReporte(
                                report
                              )
                            }
                          >

                            ✓ Cerrar sin cambios

                          </button>


                        </div>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ======================================
          USUARIOS
      ====================================== */}

      <section>

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h2 className="h4 m-0">

            👥 Usuarios

          </h2>

          <small className="text-muted">

            Ordenados por incidencias

          </small>

        </div>


        {loadingUsers ? (

          <div className="text-center py-4">

            Cargando usuarios...

          </div>

        ) : (

          <div className="table-responsive shadow-sm rounded bg-white p-3 border">

            <table className="table table-hover table-bordered align-middle mb-0">


              <thead className="table-dark">

                <tr>

                  <th className="p-3">
                    Usuario
                  </th>

                  <th className="p-3">
                    Rol
                  </th>

                  <th className="p-3 text-center">
                    Reportes
                  </th>

                  <th className="p-3 text-center">
                    Incidencias
                  </th>

                  <th className="p-3 text-center">
                    Estado
                  </th>

                  <th className="p-3">
                    ID
                  </th>

                  <th className="p-3 text-center">
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {usuariosOrdenados.map(
                  (user) => {

                    const stats =
                      getUserStats(
                        user.id
                      );

                    const status =
                      getUserStatus(
                        stats.incidents
                      );


                    return (

                      <tr key={user.id}>


                        {/* USUARIO */}

                        <td className="p-3 fw-semibold text-dark">

                          {user.username ||
                            'Sin nombre'}

                        </td>


                        {/* ROL */}

                        <td className="p-3">

                          <span
                            className={`badge ${
                              user.role === 'admin'
                                ? 'bg-primary'
                                : 'bg-secondary'
                            }`}
                          >

                            {user.role ||
                              'user'}

                          </span>

                        </td>


                        {/* REPORTES */}

                        <td className="p-3 text-center">

                          <span
                            className={`badge ${
                              stats.reports > 0
                                ? 'bg-danger'
                                : 'bg-secondary'
                            }`}
                          >

                            {stats.reports}

                          </span>

                        </td>


                        {/* INCIDENCIAS */}

                        <td className="p-3 text-center">

                          <strong>

                            {stats.incidents}

                          </strong>

                        </td>


                        {/* ESTADO */}

                        <td className="p-3 text-center">

                          <span
                            className={`badge ${status.className}`}
                          >

                            {status.icon}{' '}
                            {status.label}

                          </span>

                        </td>


                        {/* ID */}

                        <td
                          className="p-3 text-muted font-monospace small text-truncate"

                          style={{
                            maxWidth:
                              '180px'
                          }}
                        >

                          {user.id}

                        </td>


                        {/* ACCIONES */}

                        <td className="p-3 text-center">


                          {user.role !== 'admin' && (

                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  user.id,
                                  user.username
                                )
                              }

                              className="btn btn-danger btn-sm px-3"
                            >

                              Eliminar

                            </button>

                          )}


                        </td>

                      </tr>

                    );

                  }
                )}


                {users.length === 0 && (

                  <tr>

                    <td
                      colSpan="7"

                      className="p-4 text-center text-muted"
                    >

                      No se encontraron usuarios.

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>

  );
}