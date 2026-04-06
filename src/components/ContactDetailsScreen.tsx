import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getUserData, UserData } from '../services/authentication.service';

const ContactDetailsScreen = () => {
  const { navigate, categoryData } = useAppNavigation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      setUser(data);
      setLoading(false);
    };
    loadUserData();
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 800, padding: '0' }}>
          <button 
            onClick={() => navigate(categoryData?.from || 'PROFILE')} 
            className="back-button"
            aria-label="Go back"
          >
            <span className="back-icon">←</span>
          </button>
          <h1 className="header-title">Contact Details</h1>
        </div>
      </div>

      <div className="scroll-content" style={{ overflowY: 'visible', height: 'auto', flex: 1, backgroundColor: '#F9FBF9' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: '24px' }}>
          <div className="user-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex !important', flexDirection: 'column !important' as any }}>
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Full Name</span>
              <span style={{ fontSize: 18, color: '#333', fontWeight: 700 }}>{user?.name || 'Not set'}</span>
            </div>
            
            <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '16px 0', width: '100%' }} /> 
            
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Email Address</span>
              <span style={{ fontSize: 18, color: '#333', fontWeight: 700 }}>{user?.email || 'Not set'}</span>
            </div>
            
            <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '16px 0', width: '100%' }} />
            
            <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Phone Number</span>
              <span style={{ fontSize: 18, color: '#333', fontWeight: 700 }}>{user?.phone || 'Not set'}</span>
            </div>
          </div>

          <button 
            className="track-btn" 
            style={{ width: '100%', padding: '18px', fontSize: 16, borderRadius: '16px' }}
            onClick={() => navigate('EDIT_PROFILE', { from: categoryData?.from || 'PROFILE' })}
          >
            <span className="track-btn-text">Edit Details</span>
          </button>

          <p style={{ marginTop: 24, fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 1.6, maxWidth: 400, margin: '24px auto 0' }}>
            Your contact details are used to send order updates and for delivery personnel to reach you safely.
          </p>
        </div>
      </div>
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
    padding: 20,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 25,
  },
  detailRow: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f1f1',
    marginVertical: 5,
  },
  editBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 20,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ContactDetailsScreen;
