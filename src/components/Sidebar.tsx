import React, { useEffect, useRef } from 'react';
import { useAppNavigation, useCartCount, Screen } from '../context/AppContext';

const SIDEBAR_WIDTH = 250;

const Sidebar = () => {
  const { navigate, currentScreen, userRole, isSidebarOpen, toggleSidebar } = useAppNavigation();
  const { cartCount } = useCartCount();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const menuItems = [
    { id: 'HOME', label: userRole?.toUpperCase() === 'USER' ? 'Home' : 'Dashboard', icon: '🏠' },
    { id: 'CATEGORY_PRODUCTS', label: 'Categories', icon: '📦', role: 'USER' },
    { id: 'ORDERS', label: 'My Orders', icon: '📋', role: 'USER' },
    { id: 'CART', label: 'My Cart', icon: '🛒', badge: cartCount, role: 'USER' },
    { id: 'PROFILE', label: 'Profile Settings', icon: '👤' },
    { id: 'HELP_AND_SUPPORT', label: 'Help & Support', icon: '💬', role: 'USER' },
    { id: 'EXECUTIVE_DASHBOARD', label: 'Insights', icon: '📊', role: 'ADMIN' },
    { id: 'INVENTORY_MANAGER', label: 'Inventory', icon: '📦', role: 'ADMIN' },
    { id: 'USER_MANAGER', label: 'Users', icon: '👥', role: 'ADMIN' },
    { id: 'SALES_MANAGER', label: 'Sales', icon: '💰', role: 'ADMIN' },
  ];

  const filteredItems = menuItems.filter(item =>
    !item.role || item.role === userRole?.toUpperCase()
  );

  if (!isSidebarOpen) return null;

  return (
    <div style={styles.overlayContainer}>
      <div 
        style={styles.overlay} 
        onClick={toggleSidebar}
      />
      <nav 
        ref={sidebarRef}
        style={styles.sidebar}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>🥬</span>
            <span style={styles.logoText}>QuickCart</span>
          </div>
          <button onClick={toggleSidebar} style={styles.closeButton} aria-label="Close sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div style={styles.menuContainer}>
          {filteredItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.activeMenuItem : {}),
                }}
                onClick={() => {
                  navigate(item.id as Screen);
                  toggleSidebar();
                }}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <span style={{
                  ...styles.menuLabel,
                  ...(isActive ? styles.activeMenuLabel : {}),
                }}>
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={styles.badge}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerDivider} />
          <span style={styles.footerText}>v1.0.2 • QuickCart Web</span>
        </div>
      </nav>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlayContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    animation: 'fadeIn 0.2s ease',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '8px 0 30px rgba(0,0,0,0.12)',
    zIndex: 10001,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInLeft 0.25s ease',
    position: 'relative',
  },
  header: {
    padding: '20px 20px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f0f0f0',
  },
  logoRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 900,
    color: '#2E7D32',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    background: '#f5f5f5',
    borderRadius: 10,
    cursor: 'pointer',
  },
  menuContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    gap: 14,
  },
  activeMenuItem: {
    backgroundColor: '#E8F5E9',
  },
  menuIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: 600,
    flex: 1,
  },
  activeMenuLabel: {
    color: '#2E7D32',
  },
  badge: {
    background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
    borderRadius: 10,
    padding: '2px 9px',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  footer: {
    padding: '16px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
};

export default Sidebar;
