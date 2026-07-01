import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import LatestCaptures from '../components/LatestCaptures';
import './Home.css';

function Home({ setCapturedPhoto }) {
  return (
    <div className="home-page">
      <div className="container py-4">
        <div className="main-action-area mb-5">
          
          <Hero setSharedPhoto={setCapturedPhoto} />

        </div>
        <div className="welcome-box">
  <h3>¡Bienvenido a Spotter! 📸</h3>
  <p>
    Aquí podrás capturar y coleccionar aquello que más te apasiona.
    Elegí una de las categorías disponibles, tomá una fotografía,
    creá un hermoso álbum y compartí tus mejores capturas con toda
    la comunidad Spotter.
  </p>
</div>
        <Categories />
      </div>
      <LatestCaptures />
    </div>
  );
}

export default Home;