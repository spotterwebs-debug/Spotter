import React from "react";
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
    if (!cards.length) return null;

    return (
        <div className="category-section" id={id}>

            <h3 className="category-title">
                {title}
                <span className="category-count">
                    {cards.length}
                </span>
            </h3>

            <Swiper
                modules={[Navigation, FreeMode]}
                navigation
                freeMode
                spaceBetween={20}
                breakpoints={{
                    0:{
                        slidesPerView: 1.1
                    },
                    576:{
                        slidesPerView: 2
                    },
                    768:{
                        slidesPerView: 3
                    },
                    1200:{
                        slidesPerView: 4
                    }
                }}
            >

            {cards.map((post)=>(

                <SwiperSlide key={post.id}>

                    <div
                        onClick={() => {
                            if (onImageClick && post?.imagen_url) {
                                onImageClick(post.imagen_url);
                            }
                        }}
                        style={{
                            cursor: "pointer"
                        }}
                    >

                        <TradingCard
                            datos={post}
                            likes={
                                likes.filter(
                                    like =>
                                    like.card_id === post.id
                                ).length
                            }
                            liked={
                                likes.some(
                                    like =>
                                    like.card_id == post.id &&
                                    like.user_id == user?.id
                                )
                            }
                            onToggleLike={(e)=>{
                                e?.stopPropagation();
                                onToggleLike(post.id);
                            }}
                            showLikes={false}
                        />

                    </div>

                </SwiperSlide>

            ))}

            </Swiper>

        </div>
    );
}

export default CategoryCarousel;