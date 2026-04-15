import React from 'react';
import '../styles/Features.css';

const FEATURES = [
  {
    id: '1',
    icon: '🚀',
    title: '8 Minute Delivery',
    subtitle: 'Fastest in the city',
    bgColor: '#E8F5E9',
  },
  {
    id: '2',
    icon: '💸',
    title: 'Best Prices',
    subtitle: 'Save up to 40%',
    bgColor: '#F1F8E9',
  },
  {
    id: '3',
    icon: '📦',
    title: 'Free Delivery',
    subtitle: 'On orders over ₹199',
    bgColor: '#E8F5E9',
  },
  {
    id: '4',
    icon: '🛡️',
    title: 'Safe & Secure',
    subtitle: '100% authentic products',
    bgColor: '#FFF8E1',
  },
];

const Features = () => {
  return (
    <div className="features-container">
      <div className="features-scroll-wrapper">
        <div className="features-grid">
          {[...FEATURES, ...FEATURES].map((item, index) => (
            <div key={`${item.id}-${index}`} className="feature-card">
              <div className="feature-icon-container" style={{ backgroundColor: item.bgColor }}>
                <span className="feature-icon">{item.icon}</span>
              </div>
              <div className="feature-text-container">
                <span className="feature-title">{item.title}</span>
                <span className="feature-subtitle">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
