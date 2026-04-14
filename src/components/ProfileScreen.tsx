import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation, useUser } from '../context/AppContext';
import { logoutUser, UserData } from '../services/authentication.service';
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
  const { userData } = useUser();
  const loading = !userData;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const user = userData;

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
            <div className="user-card" style={{ justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#2E7D32" />
            </div>
          ) : (
            <div className="user-card">
              <div className="avatar-fallback">
                <span className="avatar-initial">
                  {user?.name ? getInitial(user.name) : '?'}
                </span>
              </div>
              <div className="user-info">
                <h2 className="user-name">{user?.name || 'User'}</h2>
                <span className="user-email">{user?.email || 'No email registered'}</span>
                {user?.phone && <span className="user-phone">{user.phone}</span>}
                {user?.addresses?.find(a => a.isSelected) && (
                  <span className="user-address" style={{ display: 'block', marginTop: 4, lineHeight: '1.4' }}>
                    📍 {(() => {
                      const a = user.addresses!.find(addr => addr.isSelected)!;
                      return `${a.streetAddress}, ${a.city}, ${a.state} ${a.postalCode}, ${a.country}`;
                    })()}
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
                  {user.role.replace('_', ' ')} Dashboard
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
