import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppNavigation } from '../context/AppContext';
import '../styles/Carousel.css';

interface CarouselItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
}

const DATA: CarouselItem[] = [
  {
    id: '1',
    badge: '🌿 HEALTHY CHOICE',
    title: 'Green Harvest',
    subtitle: 'Flat 30% OFF',
    description: 'Fresh organic vegetables from local farms',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    gradient: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.15))',
  },
  {
    id: '2',
    badge: '🌟 FRESH ARRIVALS',
    title: 'Daily Greens',
    subtitle: 'Up to 20% OFF',
    description: 'Fresh leafy greens delivered daily',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    gradient: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.1))',
  },
  {
    id: '3',
    badge: '🍎 ORGANIC DEALS',
    title: 'Fruit Basket',
    subtitle: 'Save ₹100 on ₹499',
    description: 'Succulent organic fruits at your door',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80',
    gradient: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
  },
  {
    id: '4',
    badge: '🌿 PREMIUM STOCK',
    title: 'Exotic Herbs',
    subtitle: 'Buy 2 Get 1 Free',
    description: 'Enhance your cooking with fresh herbs',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    gradient: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.15))',
  },
];

const Carousel = () => {
  const { navigate } = useAppNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex < DATA.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex > 0 ? currentIndex - 1 : DATA.length - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    intervalRef.current = setInterval(handleNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [handleNext]);

  const handleDotClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goToSlide(index);
  };

  return (
    <div className="carousel-container">
      {/* Slides */}
      <div className="carousel-slides-wrapper">
        {DATA.map((item, index) => (
          <div
            key={item.id}
            className="carousel-slide"
            style={{
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0,
            }}
          >
            <img src={item.image} alt={item.title} className="carousel-image" />
            <div className="carousel-overlay" style={{ background: item.gradient }} />
            <div className="carousel-content">
              <span className="carousel-badge">{item.badge}</span>
              <h2 className="carousel-title">{item.title}</h2>
              <p className="carousel-subtitle">{item.subtitle}</p>
              <p className="carousel-description">{item.description}</p>
              <button 
                className="carousel-button"
                onClick={() => navigate('CATEGORY_PRODUCTS', { from: 'HOME' })}
              >
                Order Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button onClick={handlePrev} className="carousel-nav-btn" style={{ left: 20 }} aria-label="Previous">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button onClick={handleNext} className="carousel-nav-btn" style={{ right: 20 }} aria-label="Next">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="carousel-pagination">
        {DATA.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`carousel-dot ${index === currentIndex ? 'active' : 'inactive'}`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
