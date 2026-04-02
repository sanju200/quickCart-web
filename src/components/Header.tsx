import React, { useState, useEffect } from 'react';
import '../styles/header.css';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getUserData, UserData } from '../services/authentication.service';

const Header = () => {
  const { navigate, currentScreen, userRole, toggleSidebar } = useAppNavigation();
  const { cartCount } = useCartCount();
  const [user, setUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      setUser(data);
    };
    loadUser();
  }, [currentScreen]);

  const handleSearch = () => {
    if (userRole === 'USER' && searchQuery.trim()) {
      navigate('FILTERED_PRODUCTS', { category: 'all', search: searchQuery });
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <header className="header-outer-container">
      <div className="header-container">
        <div className="header-top-bar">
          
          {/* Left section: Menu & Logo */}
          <div className="header-left-section">
            <button onClick={toggleSidebar} className="menu-button" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="logo-wrapper">
              <button onClick={() => navigate('HOME')} className="logo-mini-container">
                <span className="logo-icon-text">🥬</span>
                <span className="logo-text-small">QuickCart</span>
              </button>
            </div>
          </div>

          {/* Center section: Search Bar */}
          <div className="header-center-section">
            <div className={`main-search-bar ${searchFocused ? 'main-search-bar-focused' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 10, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder={userRole === 'USER' ? "Search for organics, veggies, fruits..." : "Search orders, items, reports..."}
                className="main-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <button onClick={() => setSearchQuery('')} className="clear-btn" aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right section: Location, Profile, Cart */}
          <div className="header-right-actions">
            {userRole === 'USER' && (
              <div className="location-container">
                <span className="location-pin">📍</span>
                <span className="address-text">
                  {user?.addresses?.find((a: any) => a.isSelected)?.streetAddress || 'Set Location'} ⌄
                </span>
              </div>
            )}
            
            <button onClick={() => navigate('PROFILE')} className="profile-button" aria-label="Profile">
              <div className="profile-avatar-fallback">
                <span className="profile-avatar-text">
                  {user?.name ? getInitial(user.name) : '?'}
                </span>
              </div>
            </button>

            {userRole?.toUpperCase() === 'USER' && (
              <button onClick={() => navigate('CART')} className="cart-button" aria-label="Cart">
                <div className="cart-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </div>
              </button>
            )}

            {(userRole?.toUpperCase() === 'ADMIN' || userRole?.toUpperCase() === 'INVENTORY_MANAGER') && (
              <button
                onClick={() => navigate('ADD_PRODUCT')}
                className="add-product-btn"
                aria-label="Add product"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;

