import React, { useEffect } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation, useUser } from '../context/AppContext';
import { logoutUser } from '../services/authentication.service';
import '../styles/common.css';
import '../styles/components.css';
import '../styles/forms.css';

const PROFILE_OPTIONS = [
  { id: '1', title: 'Order History', icon: '📦', subtitle: 'View your past orders' },
  { id: '2', title: 'Saved Addresses', icon: '📍', subtitle: 'Manage your delivery addresses' },
  { id: '3', title: 'Help & Support', icon: '🎧', subtitle: 'FAQs and live chat' },
  { id: '4', title: 'Contact Details', icon: '📞', subtitle: 'Update your email and phone' },
  { id: '5', title: 'Payment Methods', icon: '💳', subtitle: 'Saved cards and wallets' },
  { id: '6', title: 'Settings', icon: '⚙️', subtitle: 'App preferences and notifications' },
];

const ProfileScreen = () => {
  const { navigate } = useAppNavigation();
  const { userData, refreshUserData } = useUser();

  useEffect(() => {
    refreshUserData();
  }, []);

  const getInitial = (name?: string, email?: string) => {
    if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
    if (email && email.trim()) return email.trim().charAt(0).toUpperCase();
    return '?';
  };

  const user = userData;
  const loading = !user;

  const activeAddress = user?.addresses?.find((a: any) => a.isSelected) || user?.addresses?.[0];

  const formatAddress = (addr: any) => {
    if (!addr) return '';
    const parts = [addr.streetAddress, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('HOME')} className="back-button" aria-label="Go back">
          <span className="back-icon">←</span>
        </button>
        <h1 className="header-title">Account Details</h1>
      </div>

      <div className="scroll-content">
        <div className="content-wrapper">
          {loading ? (
            <div className="user-card" style={{ justifyContent: 'center', padding: '30px' }}>
              <ActivityIndicator size="small" color="#2E7D32" />
            </div>
          ) : (
            <div className="user-card">
              <div className="avatar-fallback">
                <span className="avatar-initial">
                  {getInitial(user?.name, user?.email)}
                </span>
              </div>
              <div className="user-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 className="user-name" style={{ margin: 0 }}>{user?.name || 'User'}</h2>
                  {user?.role && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: user.role === 'ADMIN' ? '#FFEBEE' : '#E8F5E9',
                      color: user.role === 'ADMIN' ? '#D32F2F' : '#2E7D32',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <span className="user-email">{user?.email || 'No email registered'}</span>
                
                {user?.phone ? (
                  <span className="user-phone">📞 {user.phone}</span>
                ) : (
                  <span 
                    className="user-phone" 
                    style={{ color: '#2E7D32', cursor: 'pointer', fontSize: '12px' }}
                    onClick={() => navigate('EDIT_PROFILE', { from: 'PROFILE' })}
                  >
                    + Add phone number
                  </span>
                )}

                {activeAddress ? (
                  <span className="user-address" style={{ display: 'block', marginTop: 4, lineHeight: '1.4' }}>
                    📍 {formatAddress(activeAddress)}
                  </span>
                ) : (
                  <span 
                    className="user-address" 
                    style={{ display: 'block', marginTop: 4, color: '#2E7D32', cursor: 'pointer', fontSize: '13px' }}
                    onClick={() => navigate('SAVED_ADDRESSES', { from: 'PROFILE' })}
                  >
                    + Add delivery address
                  </span>
                )}
              </div>
              <button className="edit-btn" onClick={() => navigate('EDIT_PROFILE', { from: 'PROFILE' })}>
                <span className="edit-btn-text">Edit</span>
              </button>
            </div>
          )}

          {!loading && user?.role && ['INVENTORY_MANAGER', 'LOGISTICS_PARTNER', 'DELIVERY_PARTNER'].includes(user.role) && (
            <button 
              className="dashboard-shortcut"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#E8F5E9',
                padding: '15px 20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid #C8E6C9',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (user.role === 'INVENTORY_MANAGER') navigate('INVENTORY_MANAGER');
                else if (user.role === 'LOGISTICS_PARTNER') navigate('LOGISTICS_PARTNER');
                else if (user.role === 'DELIVERY_PARTNER') navigate('DELIVERY_PARTNER');
              }}
            >
              <div style={{ width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <span style={{ fontSize: 22 }}>📊</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1B5E20' }}>
                  {user.role.replace(/_/g, ' ')} Dashboard
                </span>
                <span style={{ fontSize: 12, color: '#2E7D32', marginTop: 2, opacity: 0.8 }}>Manage orders and fulfillment tasks</span>
              </div>
              <span className="arrow-icon">›</span>
            </button>
          )}

          <div className="options-container">
            {[
              ...PROFILE_OPTIONS,
              ...(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'INVENTORY_MANAGER' 
                ? [
                    { id: 'admin-dash', title: 'Admin Terminal', icon: '🚀', subtitle: 'Launch global hub' },
                    { id: 'sec-pref', title: '--- DASHBOARDS ---', type: 'header' },
                  ] 
                : [])
            ].map((item: any) => (
              item.type === 'header' ? (
                <div key={item.id} className="section-header">
                  <span className="section-header-text">{item.title}</span>
                </div>
              ) : (
                <button 
                  key={item.id} 
                  className="option-item"
                  onClick={() => {
                    if (item.title === 'Order History') {
                      navigate('ORDERS', { from: 'PROFILE' });
                    } else if (item.title === 'Saved Addresses') {
                      navigate('SAVED_ADDRESSES', { from: 'PROFILE' });
                    } else if (item.title === 'Contact Details') {
                      navigate('CONTACT_DETAILS', { from: 'PROFILE' });
                    } else if (item.title === 'Help & Support') {
                      navigate('HELP_AND_SUPPORT', { from: 'PROFILE' });
                    } else if (item.title === 'Admin Terminal' || item.id === 'admin-dash') {
                      navigate('HOME');
                    }
                  }}
                >
                  <div className="option-icon-box">
                    <span className="option-icon">{item.icon}</span>
                  </div>
                  <div className="option-info">
                    <h3 className="option-title">{item.title}</h3>
                    <span className="option-subtitle">{item.subtitle}</span>
                  </div>
                  <span className="arrow-icon">›</span>
                </button>
              )
            ))}
          </div>

          <button className="logout-btn" onClick={async () => {
            await logoutUser();
            navigate('LOGIN');
          }}>
            <span className="logout-btn-text">Logout Account</span>
          </button>

          <span className="version-text">Version 1.2.0 • QuickCart Web</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
