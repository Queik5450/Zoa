import React, { useState } from 'react';
import Header from '../components/Header';
import AnimalCard from '../components/AnimalCard';
import BottomNav from '../components/BottomNav';

const MOCK_CARD = [
  {
    id: 1,
    name: 'Desconocido',
    species: 'Especie',
    authorName: '@nombreUsuario',
    avatarLabel: 'NU',
    description: 'No hay datos disponibles.',
    location: 'Parque Nacional Canaima',
    likes: '1k',
    comments: '100',
    image: 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png'
  },
];

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cards, setCards] = useState(MOCK_CARD);

  const activeCard = cards[activeIndex];

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Crear preview local instantáneo
    const localImageUrl = URL.createObjectURL(file);

    setIsScanning(true);
    setIsFlipped(false); // Volver al frente al escanear

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Llamar a nuestro backend Gemini (FastAPI)
      const response = await fetch('https://zoa-5p6r.onrender.com/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al analizar la imagen');
      }

      const data = await response.json();
      
      // Agregar el nuevo resultado como una carta y moverse a ella
      const newCard = {
        id: data.id || Date.now(),
        name: data.common_name || 'Desconocido',
        species: data.common_name || 'Especie',
        authorName: '@nombreUsuario',
        avatarLabel: 'NU',
        description: data.description || 'Desconocido',
        location: data.scientific_name ? `Parque Nacional Canaima` : 'Parque Nacional Canaima',
        likes: '1k',
        comments: '100',
        image: localImageUrl
      };

      setCards((prevCards) => [newCard, ...prevCards]);
      setActiveIndex(0); // Enfocar la nueva imagen recién escaneada

    } catch (error) {
      console.error(error);
      alert('Hubo un error contactando la IA: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-[#f9f9f9] overflow-hidden flex flex-col font-sans">
      <Header />
      <AnimalCard
        activeCard={activeCard}
        cards={cards}
        activeIndex={activeIndex}
        isFlipped={isFlipped}
        isScanning={isScanning}
        onCardClick={handleCardClick}
      />
      <BottomNav isScanning={isScanning} onFileChange={handleFileChange} />
    </div>
  );
}

export default Home;