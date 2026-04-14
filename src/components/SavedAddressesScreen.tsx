import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAppNavigation, useUser } from '../context/AppContext';
import { updateProfile, Address, UserData } from '../services/authentication.service';
import '../styles/saved-addresses.css';

const SavedAddressesScreen = () => {
  const { navigate, showToast, categoryData } = useAppNavigation();
  const { userData, refreshUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);


  // New Address Form State
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    // User data is now managed globally by App.tsx on navigation
  }, []);

  const handleSetDefault = async (index: number) => {
    if (!userData) return;
    
    setSaving(true);
    try {
      const updatedAddresses = userData.addresses?.map((addr, i) => ({
        ...addr,
        isSelected: i === index,
      })) || [];

      const updatedUser = { ...userData, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      await refreshUserData(updatedUser);
      showToast('Default address updated', 'success');
    } catch (error) {
      showToast('Failed to update address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!userData) return;
    
    setSaving(true);
    try {
      const updatedAddresses = userData.addresses?.filter((_, i) => i !== index) || [];
      
      // If we deleted the selected one, select the first remaining one
      if (userData.addresses?.[index].isSelected && updatedAddresses.length > 0) {
        updatedAddresses[0].isSelected = true;
      }

      const updatedUser = { ...userData, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      await refreshUserData(updatedUser);
      showToast('Address removed', 'success');
    } catch (error) {
      showToast('Failed to remove address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    if (!newStreet || !newCity) {
      showToast('Please enter street and city', 'error');
      return;
    }

    setSaving(true);
    try {
      const newAddress: Address = {
        type: newType,
        streetAddress: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostal,
        country: newCountry,
        isSelected: editingIndex !== null ? userData!.addresses![editingIndex].isSelected : (userData?.addresses?.length || 0) === 0,
      };

      let updatedAddresses: Address[] = [];
      if (editingIndex !== null) {
        updatedAddresses = [...(userData?.addresses || [])];
        updatedAddresses[editingIndex] = newAddress;
      } else {
        updatedAddresses = [...(userData?.addresses || []), newAddress];
      }

      const updatedUser = { ...userData!, addresses: updatedAddresses };
      
      await updateProfile(updatedUser);
      await refreshUserData(updatedUser);
      setShowAddModal(false);
      resetForm();
      showToast(editingIndex !== null ? 'Address updated' : 'New address added', 'success');
    } catch (error) {
      showToast('Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index: number) => {
    const addr = userData!.addresses![index];
    setNewType(addr.type);
    setNewStreet(addr.streetAddress);
    setNewCity(addr.city);
    setNewState(addr.state);
    setNewPostal(addr.postalCode);
    setNewCountry(addr.country);
    setEditingIndex(index);
    setShowAddModal(true);
  };


  const resetForm = () => {
    setNewType('Home');
    setNewStreet('');
    setNewCity('');
    setNewState('');
    setNewPostal('');
    setNewCountry('');
    setEditingIndex(null);
  };

  const useSampleData = async () => {
    const sampleAddresses: Address[] = [
      {
        type: 'Home',
        streetAddress: '123 Wonderland Ave',
        city: 'Anystate',
        state: 'State',
        postalCode: '12345',
        country: 'United States',
        isSelected: true
      },
      {
        type: 'Work',
        streetAddress: '456 Office St',
        city: 'Anothercity',
        state: 'State',
        postalCode: '67890',
        country: 'United States',
        isSelected: false
      }
    ];

    if (!userData) return;
    setSaving(true);
    try {
      const updatedUser = { ...userData, addresses: sampleAddresses };
      await updateProfile(updatedUser);
      await refreshUserData(updatedUser);
      showToast('Sample addresses loaded', 'success');
    } catch (error) {
      showToast('Failed to load samples', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-inner">
          <button 
            onClick={() => navigate(categoryData?.from || 'PROFILE')} 
            className="back-button"
            aria-label="Go back"
          >
            <span className="back-icon">←</span>
          </button>
          <h1 className="header-title">Saved Addresses</h1>
        </div>
      </div>

      <div className="scroll-content addresses-scroll-content">
        <div className="addresses-wrapper">
          <div className="addresses-grid">
            {userData?.addresses && userData.addresses.length > 0 ? (
              userData.addresses.map((item, index) => (
                <div 
                  key={index} 
                  className={`address-card ${item.isSelected ? 'selected' : ''}`}
                  onClick={() => handleSetDefault(index)}
                >
                  <div className="card-top">
                    <span className={`type-badge type-${item.type.toLowerCase()}`}>
                      {item.type}
                    </span>
                    <div className="selection-indicator">
                      {item.isSelected && <div className="selection-dot" style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2E7D32' }} />}
                    </div>
                  </div>

                  <p className="street-text">{item.streetAddress}</p>
                  <p className="city-state-text">{item.city}, {item.state} {item.postalCode}</p>
                  <p className="country-text">{item.country}</p>

                  <div className="card-actions">
                    <button 
                      className="action-button" 
                      onClick={(e) => { e.stopPropagation(); handleEdit(index); }}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-button remove-button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIndexToDelete(index);
                        setShowDeleteModal(true);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📍</span>
                <h2 className="empty-title">No saved addresses</h2>
                <p className="empty-subtitle">Add an address to make checkout faster.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="add-address-button"
          >
            <div className="plus-icon-box">
              <span className="plus-icon">+</span>
            </div>
            <span className="add-button-text">
              Add New Address
            </span>
          </button>

          <button 
            className="reset-link"
            onClick={useSampleData}
          >
            Reset to Sample Addresses
          </button>
        </div>
      </div>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setShowAddModal(false); resetForm(); }}
      >
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{editingIndex !== null ? 'Edit Address' : 'New Address'}</h2>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="close-button"
              >
                ✕
              </button>
            </div>

            <div className="form-section">
              <span className="form-label">Address Type</span>
              <div className="type-selector">
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`type-option ${newType === t ? 'active' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div>
                <span className="form-label">Street Address</span>
                <input 
                  className="form-input"
                  placeholder="Building, Street, Area"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div>
                  <span className="form-label">City</span>
                  <input 
                    className="form-input"
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div>
                  <span className="form-label">State</span>
                  <input 
                    className="form-input"
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <span className="form-label">Zip Code</span>
                  <input 
                    className="form-input"
                    placeholder="Postal Code"
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                  />
                </div>
                <div>
                  <span className="form-label">Country</span>
                  <input 
                    className="form-input"
                    placeholder="Country"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              className="save-button" 
              onClick={handleAddNew}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <span className="save-button-text">Save Address</span>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <div className="modal-overlay">
          <div className="delete-modal-container">
            <div className="warning-icon-box">
              <span style={{ fontSize: '30px' }}>⚠️</span>
            </div>
            
            <h2 className="confirm-title">Remove Address?</h2>
            <p className="confirm-text">
              Are you sure you want to remove this address? This action cannot be undone.
            </p>
            
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-button"
                onClick={() => {
                  if (indexToDelete !== null) {
                    handleDelete(indexToDelete);
                  }
                  setShowDeleteModal(false);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavedAddressesScreen;

