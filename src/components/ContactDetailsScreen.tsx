import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
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

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

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

      <div className="scroll-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: 1200, width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
          
          {/* Main Horizontal Card */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 40,
            boxShadow: '0 40px 100px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            minHeight: 450
          }}>
            
            {/* Left Column: Identity */}
            <div style={{ 
              width: '35%', 
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              padding: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: 140, 
                height: 140, 
                borderRadius: 70, 
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '4px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                <span style={{ fontSize: 60, color: '#fff', fontWeight: 900 }}>
                  {user?.name ? getInitial(user.name) : 'QC'}
                </span>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', margin: '0 0 10px 0' }}>{user?.name || 'Member'}</h2>
            </div>

            {/* Right Column: Details Grid */}
            <div style={{ flex: 1, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: 14, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 30 }}>Credential Overview</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30 }}>
                   <HorizontalInfo icon="👤" label="Full Name" value={user?.name} />
                   <HorizontalInfo icon="✉️" label="Email Address" value={user?.email} />
                   <HorizontalInfo icon="📞" label="Phone Number" value={user?.phone} />
                   <HorizontalInfo icon="📅" label="Last Updated" value={new Date().toLocaleDateString()} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 20 }}>
                <button 
                  className="track-btn" 
                  style={{ 
                    padding: '18px 40px', 
                    borderRadius: 20,
                    background: '#1e293b',
                    border: 'none',
                    boxShadow: '0 15px 30px rgba(30,41,59,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('EDIT_PROFILE', { from: categoryData?.from || 'PROFILE' })}
                >
                  <span style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>Update Identity</span>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 14 }}>✎</span>
                  </div>
                </button>
              </div>
            </div>

          </div>

          <p style={{ marginTop: 40, fontSize: 14, color: '#94a3b8', textAlign: 'center', maxWidth: 600, margin: '40px auto 0' }}>
            Privacy Note: Your personal data is protected by industry-standard encryption protocols. Only authorized support personnel can access this information.
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const HorizontalInfo = ({ icon, label, value }: { icon: string, label: string, value?: string }) => (
  <div style={{ 
    padding: '24px', 
    backgroundColor: '#f8fafc', 
    borderRadius: 24, 
    border: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  }}>
    <div style={{ fontSize: 24 }}>{icon}</div>
    <div>
      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <p style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '2px 0 0 0' }}>{value || 'Not Provided'}</p>
    </div>
  </div>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ContactDetailsScreen;
