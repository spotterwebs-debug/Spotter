import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import Swal from "sweetalert2";

import "swiper/css";
import "swiper/css/navigation";

import "./CategoryCarousel.css";
import TradingCard from "./TradingCard";
import { supabase } from "../supabaseClient";

function CategoryCarousel({
  id,
  title,
  cards,
  likes,
  user,
  onToggleLike,
  onImageClick
}) {
  const [cardSeleccionada, setCardSeleccionada] = useState(null);

  if (!cards.length) return null;

  // =========================================================
  // LIKES
  // =========================================================

  const getLikesCount = (cardId) => {
    return likes.filter(
      (like) =>
        String(like.card_id) === String(cardId)
    ).length;
  };

  const getIsLiked = (cardId) => {
    return likes.some(
      (like) =>
        String(like.card_id) === String(cardId) &&
        String(like.user_id) === String(user?.id)
    );
  };

  // =========================================================
  // MODAL
  // =========================================================

  const abrirCard = (post) => {
    setCardSeleccionada(post);
  };

  const cerrarCard = () => {
    setCardSeleccionada(null);
  };

  const abrirImagenGrande = () => {
    if (
      onImageClick &&
      cardSeleccionada?.imagen_url
    ) {
      onImageClick(
        cardSeleccionada.imagen_url
      );
    }
  };

  // =========================================================
  // INFORMACIÓN SEGÚN CATEGORÍA
  // =========================================================

  const renderInformacion = (card) => {
    if (!card) return null;

    // ---------------------------------------------------------
    // PERROS / GATOS / AVES
    // ---------------------------------------------------------

    if (
      ["perros", "gatos", "aves"].includes(
        card.categoria
      )
    ) {
      return (
        <>
          <div className="community-info-row">
            <span className="community-info-icon">
              🐾
            </span>

            <div>
              <span className="community-info-label">
                Raza / Especie
              </span>

              <strong>
                {card.raza || "-"}
              </strong>
            </div>
          </div>

          <div className="community-info-row">
            <span className="community-info-icon">
              😊
            </span>

            <div>
              <span className="community-info-label">
                Personalidad
              </span>

              <strong>
                {card.personalidad || "-"}
              </strong>
            </div>
          </div>

          <div className="community-info-row">
            <span className="community-info-icon">
              💡
            </span>

            <div>
              <span className="community-info-label">
                Fun Fact
              </span>

              <strong>
                {card.dato || "-"}
              </strong>
            </div>
          </div>
        </>
      );
    }

    // ---------------------------------------------------------
    // PLANTAS
    // ---------------------------------------------------------

    if (card.categoria === "plantas") {
      return (
        <>
          <div className="community-info-row">
            <span className="community-info-icon">
              🌿
            </span>

            <div>
              <span className="community-info-label">
                Especie
              </span>

              <strong>
                {card.raza || "-"}
              </strong>
            </div>
          </div>

          <div className="community-info-row">
            <span className="community-info-icon">
              🍃
            </span>

            <div>
              <span className="community-info-label">
                Rasgo destacado
              </span>

              <strong>
                {card.caracteristica || "-"}
              </strong>
            </div>
          </div>

          <div className="community-info-row">
            <span className="community-info-icon">
              💡
            </span>

            <div>
              <span className="community-info-label">
                Fun Fact
              </span>

              <strong>
                {card.dato || "-"}
              </strong>
            </div>
          </div>
        </>
      );
    }

    // ---------------------------------------------------------
    // PAISAJES
    // ---------------------------------------------------------

    if (card.categoria === "paisajes") {
      return (
        <>
          <div className="community-info-row">
            <span className="community-info-icon">
              📍
            </span>

            <div>
              <span className="community-info-label">
                Lugar
              </span>

              <strong>
                {card.lugar || "-"}
              </strong>
            </div>
          </div>

          <div className="community-info-row">
            <span className="community-info-icon">
              💡
            </span>

            <div>
              <span className="community-info-label">
                Fun Fact
              </span>

              <strong>
                {card.dato || "-"}
              </strong>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  // =========================================================
  // REPORTAR
  // =========================================================

  const handleReportar = async (cardId) => {
    if (!user) {
      await Swal.fire({
        icon: "info",
        title: "Iniciá sesión",
        text:
          "Necesitás iniciar sesión para reportar una publicación.",
        confirmButtonText: "Entendido"
      });

      return;
    }

    const { value: reason } = await Swal.fire({
      title: "🚩 Reportar publicación",

      text:
        "Seleccioná el motivo del reporte.",

      input: "select",

      inputOptions: {
        categoria_incorrecta:
          "📂 Categoría incorrecta",

        contenido_inapropiado:
          "⚠️ Contenido inapropiado",

        spam:
          "🚫 Spam",

        otro:
          "💬 Otro motivo"
      },

      inputPlaceholder:
        "Seleccioná un motivo",

      showCancelButton: true,

      confirmButtonText:
        "Enviar reporte",

      cancelButtonText:
        "Cancelar",

      inputValidator: (value) => {
        if (!value) {
          return "Elegí un motivo";
        }
      }
    });

    if (!reason) return;

    try {
      const { error } = await supabase
        .from("reports")
        .insert({
          card_id: cardId,
          reporter_user_id: user.id,
          reason
        });

      if (error) {
        if (error.code === "23505") {
          await Swal.fire({
            icon: "info",

            title:
              "Ya reportaste esta publicación",

            text:
              "Tu reporte ya fue registrado anteriormente.",

            confirmButtonText:
              "Entendido"
          });

          return;
        }

        throw error;
      }

      await Swal.fire({
        icon: "success",

        title:
          "Reporte enviado",

        text:
          "Gracias. Revisaremos esta publicación.",

        timer: 1800,

        showConfirmButton: false
      });
    } catch (error) {
      console.error(
        "Error reportando publicación:",
        error
      );

      await Swal.fire({
        icon: "error",

        title:
          "No se pudo enviar el reporte",

        text:
          error.message ||
          "Ocurrió un error al enviar el reporte."
      });
    }
  };

  // =========================================================
  // VISTA
  // =========================================================

  return (
    <div
      className="category-section"
      id={id}
    >
      {/* =====================================================
          TÍTULO
      ===================================================== */}

      <h3 className="category-title">
        {title}

        <span className="category-count">
          {cards.length}
        </span>
      </h3>

      {/* =====================================================
          CARRUSEL
      ===================================================== */}

      <Swiper
        modules={[
          Navigation,
          FreeMode
        ]}
        navigation
        freeMode
        spaceBetween={15}
        breakpoints={{
          0: {
            slidesPerView: 2
          },

          576: {
            slidesPerView: 3
          },

          768: {
            slidesPerView: 4
          },

          1200: {
            slidesPerView: 5
          }
        }}
      >
        {cards.map((post) => {
          const likesCount =
            getLikesCount(post.id);

          const isLiked =
            getIsLiked(post.id);

          return (
            <SwiperSlide key={post.id}>

              <div
                className="community-grid-card"
                onClick={() =>
                  abrirCard(post)
                }
              >
                <TradingCard
                  datos={post}
                  likes={likesCount}
                  liked={isLiked}
                  onToggleLike={(e) => {
                    e?.stopPropagation();

                    onToggleLike(
                      post.id
                    );
                  }}
                  showLikes={false}
                />
              </div>

            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* =====================================================
          MODAL INFORMACIÓN
      ===================================================== */}

      {cardSeleccionada && (
        <div
          className="community-card-modal-overlay"
          onClick={cerrarCard}
        >
          <div
            className="community-card-modal community-spot-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CERRAR */}

            <button
              type="button"
              className="community-card-modal-close"
              onClick={cerrarCard}
            >
              ✕
            </button>

            {/* =================================================
                CARD IA
            ================================================= */}

            <div
              className="community-spot-image-wrapper"
              onClick={
                abrirImagenGrande
              }
            >
              <img
                src={
                  cardSeleccionada.imagen_url
                }
                alt={
                  cardSeleccionada.nombre ||
                  "Spot"
                }
                className="community-spot-image"
              />

              <div className="community-image-hint">
                🔍 Tocar para ampliar
              </div>
            </div>

            {/* =================================================
                CABECERA DATOS
            ================================================= */}

            <div className="community-spot-info">

              <div className="community-info-header">

                <div>
                  <span className="community-info-category">
                    {
                      cardSeleccionada.categoria
                    }
                  </span>

                  <h2>
                    {
                      cardSeleccionada.nombre ||
                      "Sin nombre"
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  className={`community-modal-like ${
                    getIsLiked(
                      cardSeleccionada.id
                    )
                      ? "liked"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();

                    onToggleLike(
                      cardSeleccionada.id
                    );
                  }}
                >
                  {getIsLiked(
                    cardSeleccionada.id
                  )
                    ? "❤️"
                    : "🤍"}

                  <span>
                    {getLikesCount(
                      cardSeleccionada.id
                    )}
                  </span>
                </button>

              </div>

              {/* =============================================
                  INFORMACIÓN
              ============================================= */}

              <div className="community-info-content">
                {renderInformacion(
                  cardSeleccionada
                )}
              </div>

            </div>

            {/* =================================================
                REPORTAR
            ================================================= */}

            <button
              type="button"
              className="community-report-btn"
              onClick={() =>
                handleReportar(
                  cardSeleccionada.id
                )
              }
            >
              🚩 Reportar publicación
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default CategoryCarousel;