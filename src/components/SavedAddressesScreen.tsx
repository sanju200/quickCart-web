import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getUserData, updateProfile, Address, UserData } from '../services/authentication.service';

const SavedAddressesScreen = () => {
  const { navigate, showToast, categoryData } = useAppNavigation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);


  // New Address Form State
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const data = await getUserData();
    setUser(data);
    setLoading(false);
  };

  const handleSetDefault = async (index: number) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedAddresses = user.addresses?.map((addr, i) => ({
        ...addr,
        isSelected: i === index,
      })) || [];

      const updatedUser = { ...user, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
      showToast('Default address updated', 'success');
    } catch (error) {
      showToast('Failed to update address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedAddresses = user.addresses?.filter((_, i) => i !== index) || [];
      
      // If we deleted the selected one, select the first remaining one
      if (user.addresses?.[index].isSelected && updatedAddresses.length > 0) {
        updatedAddresses[0].isSelected = true;
      }

      const updatedUser = { ...user, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
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
        isSelected: editingIndex !== null ? user!.addresses![editingIndex].isSelected : (user?.addresses?.length || 0) === 0,
      };

      let updatedAddresses: Address[] = [];
      if (editingIndex !== null) {
        updatedAddresses = [...(user?.addresses || [])];
        updatedAddresses[editingIndex] = newAddress;
      } else {
        updatedAddresses = [...(user?.addresses || []), newAddress];
      }

      const updatedUser = { ...user!, addresses: updatedAddresses };
      
      await updateProfile(updatedUser);
      setUser(updatedUser);
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
    const addr = user!.addresses![index];
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

    if (!user) return;
    setSaving(true);
    try {
      const updatedUser = { ...user, addresses: sampleAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
      showToast('Sample addresses loaded', 'success');
    } catch (error) {
      showToast('Failed to load samples', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
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

      <div className="scroll-content" style={{ overflowY: 'auto', flex: 1, backgroundColor: '#F9FBF9' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((item, index) => (
                <div 
                  key={index} 
                  className={`address-card ${item.isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: item.isSelected ? '2px solid #2E7D32' : '1px solid #eee',
                    boxShadow: item.isSelected ? '0 8px 25px rgba(46,125,50,0.1)' : '0 2px 10px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleSetDefault(index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ 
                      backgroundColor: item.type === 'Home' ? '#E8F5E9' : item.type === 'Work' ? '#E3F2FD' : '#FFF3E0',
                      color: item.type === 'Home' ? '#2E7D32' : item.type === 'Work' ? '#1565C0' : '#E65100',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {item.type}
                    </span>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      border: `2px solid ${item.isSelected ? '#2E7D32' : '#ccc'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2E7D32' }} />}
                    </div>
                  </div>

                  <p style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 8, margin: 0 }}>{item.streetAddress}</p>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 4, margin: 0 }}>{item.city}, {item.state} {item.postalCode}</p>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>{item.country}</p>

                  <div style={{ display: 'flex', gap: '16px', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                    <button 
                      className="qty-btn" 
                      style={{ padding: '8px 20px', background: 'none', border: '1px solid #ddd', borderRadius: 8, color: '#666', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handleEdit(index); }}
                    >
                      Edit
                    </button>
                    <button 
                      className="qty-btn" 
                      style={{ padding: '8px 20px', background: 'none', border: '1px solid #ffebee', borderRadius: 8, color: '#d32f2f', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                <span style={{ fontSize: 64, display: 'block', marginBottom: 20 }}>📍</span>
                <h2 style={{ fontSize: 20, color: '#333', fontWeight: 800 }}>No saved addresses</h2>
                <p style={{ color: '#999', marginTop: 8 }}>Add an address to make checkout faster.</p>
              </div>
            )}
          </div>

          <button 
            className="track-btn" 
            style={{ width: '100%', padding: '18px', fontSize: 16, borderRadius: '16px', marginBottom: 20 }}
            onClick={() => setShowAddModal(true)}
          >
            <span className="track-btn-text">+ Add New Address</span>
          </button>

          <button 
            style={{ background: 'none', border: 'none', color: '#2E7D32', textDecoration: 'underline', width: '100%', padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            onClick={useSampleData}
          >
            Reset to Sample Addresses
          </button>
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: 20
        }}>
          <div className="user-card" style={{ 
            maxWidth: 500, width: '100%', padding: '32px', display: 'block', 
            maxHeight: '90vh', overflowY: 'auto' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{editingIndex !== null ? 'Edit Address' : 'New Address'}</h2>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                style={{ background: '#f5f5f5', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase' }}>Address Type</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10,
                      border: newType === t ? '2px solid #2E7D32' : '1px solid #ddd',
                      backgroundColor: newType === t ? '#E8F5E9' : '#fff',
                      color: newType === t ? '#2E7D32' : '#666',
                      fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>Street Address</span>
              <input 
                className="search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="Building, Street, Area"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>City</span>
                <input 
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="City"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>State</span>
                <input 
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="State"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>Zip Code</span>
                <input 
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Postal Code"
                  value={newPostal}
                  onChange={(e) => setNewPostal(e.target.value)}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>Country</span>
                <input 
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Country"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="track-btn" 
              style={{ width: '100%', padding: '16px' }}
              onClick={handleAddNew}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <span className="track-btn-text">Save Address</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  selectedCard: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  defaultLabel: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#2E7D32',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  streetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  countryText: {
    fontSize: 14,
    color: '#888',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  actionBtnText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  selectBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  selectBtnText: {
    color: '#2E7D32',
  },
  deleteBtn: {
    borderColor: '#ffebee',
  },
  deleteBtnText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  addNewBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addNewBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sampleBottomBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  sampleBottomBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeModal: {
    fontSize: 20,
    color: '#999',
  },
  modalForm: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  typeOptionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 5,
  },
  saveModalBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveModalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SavedAddressesScreen;
