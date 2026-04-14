import React, { useState, useEffect } from 'react';
import '../styles/header.css';
import { useAppNavigation, useCartCount, useUser } from '../context/AppContext';
import { UserData } from '../services/authentication.service';

const Header = () => {
  const { navigate, currentScreen, userRole, toggleSidebar } = useAppNavigation();
  const { cartCount } = useCartCount();
  const { userData: user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = () => {
    if (userRole === 'USER' && searchQuery.trim()) {
      navigate('FILTERED_PRODUCTS', { category: 'all', search: searchQuery });
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Set Location';
    const full = `${address.streetAddress}, ${address.city}`;
    const words = full.split(' ');
    if (words.length > 6) {
      return words.slice(0, 6).join(' ') + '...';
    }
    return full;
  };

  const getInitial = (user: any) => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

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
              <button 
                className="location-container" 
                onClick={() => navigate('SAVED_ADDRESSES')}
                aria-label="Change location"
              >
                <span className="location-pin">📍</span>
                <div className="location-info">
                  <span className="location-label">Delivery to</span>
                  <div className="address-wrapper">
                    <span className="address-text" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                      {formatAddress(user?.addresses?.find((a: any) => a.isSelected))}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </button>
            )}
            
            <button onClick={() => navigate('PROFILE')} className="profile-button" aria-label="Profile">
              <div className="profile-avatar-fallback">
                <span className="profile-avatar-text">
                  {getInitial(user)}
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

