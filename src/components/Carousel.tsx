import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppNavigation } from '../context/AppContext';

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
    <div style={styles.container}>
      {/* Slides */}
      <div style={styles.slidesWrapper}>
        {DATA.map((item, index) => (
          <div
            key={item.id}
            style={{
              ...styles.slide,
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0,
            }}
          >
            <img src={item.image} alt={item.title} style={styles.image} />
            <div style={{ ...styles.overlay, background: item.gradient }} />
            <div style={styles.contentContainer}>
              <span style={styles.badge}>{item.badge}</span>
              <h2 style={styles.title}>{item.title}</h2>
              <p style={styles.subtitle}>{item.subtitle}</p>
              <p style={styles.description}>{item.description}</p>
                <button 
                  style={styles.button}
                  onClick={() => navigate('CATEGORY_PRODUCTS', { from: 'HOME' })}
                >
                  Order Now →
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button onClick={handlePrev} style={{ ...styles.navBtn, left: 20 }} aria-label="Previous">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button onClick={handleNext} style={{ ...styles.navBtn, right: 20 }} aria-label="Next">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots */}
      <div style={styles.pagination}>
        {DATA.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            style={{
              ...styles.dot,
              ...(index === currentIndex ? styles.dotActive : styles.dotInactive),
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: '#F1F8E9',
    overflow: 'hidden',
  },
  slidesWrapper: {
    position: 'relative',
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'opacity 0.5s ease-in-out',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    padding: '32px 36px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: 550,
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
    letterSpacing: 0.8,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 900,
    margin: 0,
    letterSpacing: -0.5,
    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  subtitle: {
    color: '#E8F5E9',
    fontSize: 22,
    fontWeight: 700,
    margin: '4px 0',
  },
  description: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    margin: '6px 0 18px',
    lineHeight: '1.4',
  },
  button: {
    background: 'linear-gradient(135deg, #2E7D32, #43A047)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    padding: '12px 28px',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 16px rgba(46,125,50,0.35)',
    letterSpacing: 0.3,
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(6px)',
    border: 'none',
    width: 44,
    height: 44,
    borderRadius: 22,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  pagination: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  dotActive: {
    width: 28,
    backgroundColor: '#2E7D32',
  },
  dotInactive: {
    width: 10,
    backgroundColor: '#C8E6C9',
  },
};

export default Carousel;
