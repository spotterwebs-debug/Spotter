import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import "./CategoryCarousel.css";
import TradingCard from "./TradingCard";

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

  // ==========================================
  // LIKES
  // ==========================================

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

  // ==========================================
  // ABRIR CARD
  // ==========================================

  const abrirCard = (post) => {
    setCardSeleccionada(post);
  };

  // ==========================================
  // CERRAR CARD
  // ==========================================

  const cerrarCard = () => {
    setCardSeleccionada(null);
  };

  return (
    <div
      className="category-section"
      id={id}
    >

      {/* =====================================
          TÍTULO
      ===================================== */}

      <h3 className="category-title">

        {title}

        <span className="category-count">
          {cards.length}
        </span>

      </h3>

      {/* =====================================
          CARRUSEL
      ===================================== */}

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

            <SwiperSlide
              key={post.id}
            >

              {/* MINI CARD */}

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

      {/* =====================================
          MODAL CARD COMPLETA
      ===================================== */}

      {cardSeleccionada && (

        <div
          className="community-card-modal-overlay"

          onClick={
            cerrarCard
          }
        >

          <div
            className="community-card-modal"

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CERRAR */}

            <button
              type="button"
              className="community-card-modal-close"

              onClick={
                cerrarCard
              }
            >
              ✕
            </button>

            {/* CARD COMPLETA */}

            <div className="community-full-card">

              <TradingCard
                datos={
                  cardSeleccionada
                }

                likes={
                  getLikesCount(
                    cardSeleccionada.id
                  )
                }

                liked={
                  getIsLiked(
                    cardSeleccionada.id
                  )
                }

                showLikes={true}

                onToggleLike={(e) => {
                  e?.stopPropagation();

                  onToggleLike(
                    cardSeleccionada.id
                  );
                }}

                enableImageZoom={true}

                onImageClick={() => {

                  if (
                    onImageClick &&
                    cardSeleccionada?.imagen_url
                  ) {

                    onImageClick(
                      cardSeleccionada.imagen_url
                    );

                  }

                }}
              />

            </div>

            <p className="community-card-photo-help">
              Tocá la foto para verla en grande
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default CategoryCarousel;