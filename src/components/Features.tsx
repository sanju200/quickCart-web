import React from 'react';

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
    <div style={styles.container}>
      <div style={styles.grid}>
        {FEATURES.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={{ ...styles.iconContainer, backgroundColor: item.bgColor }}>
              <span style={styles.icon}>{item.icon}</span>
            </div>
            <div style={styles.textContainer}>
              <span style={styles.title}>{item.title}</span>
              <span style={styles.subtitle}>{item.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 20px 16px',
    backgroundColor: '#F1F8E9',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: 16,
    backgroundColor: '#fff',
    border: '1px solid #E0E0E0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    gap: 12,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: 'default',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    whiteSpace: 'nowrap' as const,
  },
  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
};

export default Features;
