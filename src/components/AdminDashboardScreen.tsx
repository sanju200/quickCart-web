import React, { useEffect, useState } from 'react';
import { useAppNavigation } from '../context/AppContext';
import { getAllCategories } from '../services/category.service';
import { getAdminStats, AdminStats } from '../services/admin.service';
import '../styles/dashboard.css';

const AdminDashboardScreen = () => {
  const { navigate } = useAppNavigation();
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    activeOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminStats = await getAdminStats();
        setStats(adminStats);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const sections = [
    {
      title: 'Control Center',
      items: [
        { id: 'users', title: 'User Directory', icon: '👥', color: '#E8F5E9', screen: 'USER_MANAGER' },
        { id: 'sales', title: 'Sales Ledger', icon: '🧾', color: '#E3F2FD', screen: 'SALES_MANAGER' },
        { id: 'exec', title: 'Analytics', icon: '📊', color: '#E8EAF6', screen: 'EXECUTIVE_DASHBOARD' },
        { id: 'ops', title: 'Operations', icon: '⚙️', color: '#ECEFF1', screen: 'OPERATIONAL_CONTROL' },
      ]
    },
    {
      title: 'Inventory & Growth',
      items: [
        { id: 'add', title: 'Add Product', icon: '➕', color: '#FFF3E0', screen: 'ADD_PRODUCT' },
        { id: 'cat', title: 'Categories', icon: '📂', color: '#F3E5F5', screen: 'CATEGORY_MANAGER' },
        { id: 'off', title: 'Offers', icon: '🎟️', color: '#E0F2F1', screen: 'OFFER_MANAGER' },
        { id: 'low', title: 'Low Stock', icon: '📉', color: '#FFEBEE', screen: 'LOW_STOCK_DASHBOARD' },
      ]
    },
    {
      title: 'Logistics & Fleet',
      items: [
        { id: 'map', title: 'Live Map', icon: '📍', color: '#F1F8E9', screen: 'LIVE_DELIVERY_MAP' },
        { id: 'onboard', title: 'Partners', icon: '🤝', color: '#E0F2F1', screen: 'PARTNER_ONBOARDING' },
        { id: 'comm', title: 'Commission', icon: '💰', color: '#F1F8E9', screen: 'COMMISSION_MANAGER' },
        { id: 'feed', title: 'Feedback', icon: '💬', color: '#FFFDE7', screen: 'FEEDBACK_CENTER' },
      ]
    }
  ];

  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.adminPortalBanner} className="dashboard-banner">
        <div style={dashboardStyles.bannerContent} className="banner-content">
          <div style={dashboardStyles.bannerText}>
            <span style={dashboardStyles.welcomeLabel}>ADMIN PORTAL</span>
            <h1 style={dashboardStyles.bannerTitle}>QuickCart Terminal</h1>
            <p style={dashboardStyles.bannerSubtitle}>Real-time system overview and infrastructure control</p>
          </div>
          <div style={dashboardStyles.bannerActions}>
            <div style={dashboardStyles.systemStatusPill}>
              <span style={dashboardStyles.statusDot} className="status-dot"></span>
              <span style={dashboardStyles.systemStatusText}>SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      <div style={dashboardStyles.scrollContainer} className="scroll-container">
        <div style={dashboardStyles.dashboardContentWrapper}>
          
          <div style={dashboardStyles.statsGrid}>
            <div 
              style={{...dashboardStyles.statCard, ...dashboardStyles.statCardRevenue}} 
              className="stat-card"
              onClick={() => navigate('SALES_MANAGER')}
            >
              <div style={dashboardStyles.statIconBg}>💰</div>
              <div style={dashboardStyles.statInfo}>
                <span style={dashboardStyles.statLabel}>Total Revenue</span>
                <span style={dashboardStyles.statValue}>₹{stats.totalRevenue.toLocaleString()}</span>
                <span style={{...dashboardStyles.statTrend, ...dashboardStyles.statTrendPositive}}>↑ 12.5% vs last week</span>
              </div>
            </div>
            <div 
              style={{...dashboardStyles.statCard, ...dashboardStyles.statCardOrders}} 
              className="stat-card"
              onClick={() => navigate('SALES_MANAGER')}
            >
              <div style={dashboardStyles.statIconBg}>📦</div>
              <div style={dashboardStyles.statInfo}>
                <span style={dashboardStyles.statLabel}>Active Orders</span>
                <span style={dashboardStyles.statValue}>{stats.activeOrders}</span>
                <span style={{...dashboardStyles.statTrend, ...dashboardStyles.statTrendNeutral}}>{stats.pendingOrders} pending</span>
              </div>
            </div>
          </div>

          <div style={dashboardStyles.statsGrid}>
            <div 
              style={{...dashboardStyles.statCard, ...dashboardStyles.statCardUsers}} 
              className="stat-card"
              onClick={() => navigate('USER_MANAGER')}
            >
              <div style={dashboardStyles.statIconBg}>👥</div>
              <div style={dashboardStyles.statInfo}>
                <span style={dashboardStyles.statLabel}>Total Users</span>
                <span style={dashboardStyles.statValue}>{stats.totalUsers}</span>
                <span style={{...dashboardStyles.statTrend, ...dashboardStyles.statTrendPositive}}>↑ 48 new today</span>
              </div>
            </div>
            <div 
              style={{...dashboardStyles.statCard, ...dashboardStyles.statCardStock}} 
              className="stat-card"
              onClick={() => navigate('LOW_STOCK_DASHBOARD')}
            >
              <div style={dashboardStyles.statIconBg}>⚠️</div>
              <div style={dashboardStyles.statInfo}>
                <span style={dashboardStyles.statLabel}>Low Stock</span>
                <span style={dashboardStyles.statValue}>{stats.lowStockItems}</span>
                <span style={{...dashboardStyles.statTrend, ...dashboardStyles.statTrendNegative}}>Urgent attention</span>
              </div>
            </div>
          </div>

          {sections.map((section, idx) => (
            <div key={idx} style={dashboardStyles.dashboardSection}>
              <h2 style={dashboardStyles.sectionTitle}>{section.title}</h2>
              <div style={dashboardStyles.moduleGrid}>
                {section.items.map(item => (
                  <div 
                    key={item.id} 
                    style={{ ...dashboardStyles.moduleCardWeb, borderBottom: `4px solid ${item.color}` }}
                    className="module-card-web"
                    onClick={() => navigate(item.screen as any)}
                  >
                    <div style={{ ...dashboardStyles.moduleIconContainer, backgroundColor: item.color }} className="module-icon-container">
                      <span style={dashboardStyles.moduleIconText}>{item.icon}</span>
                    </div>
                    <span style={dashboardStyles.moduleTitleText}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={dashboardStyles.systemAlertBox}>
             <div style={dashboardStyles.alertHeader}>
               <span style={dashboardStyles.alertIcon}>📢</span>
               <span style={dashboardStyles.alertTitle}>System Status Notifications</span>
             </div>
             <p style={dashboardStyles.alertMessage}>All delivery zones are operational. Scheduled maintenance for Region-4 node at 02:00 AM. Warehouse pickup delay is +/- 4 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const dashboardStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  adminPortalBanner: {
    padding: '30px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #E9ecef',
  },
  bannerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  bannerText: {
    flex: 1,
    minWidth: 300,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: '#2E7D32',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: '#1a1a1a',
    margin: '8px 0 4px 0',
  },
  bannerSubtitle: {
    fontSize: 15,
    color: '#6c757d',
    margin: 0,
  },
  bannerActions: {
    display: 'flex',
    alignItems: 'center',
  },
  systemStatusPill: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: '8px 16px',
    borderRadius: 50,
    border: '1px solid #C8E6C9',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    marginRight: 8,
    boxShadow: '0 0 8px rgba(76,175,80,0.5)',
  },
  systemStatusText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2E7D32',
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto' as any,
    padding: '24px',
  },
  dashboardContentWrapper: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  statCardRevenue: {
    borderLeft: '5px solid #2E7D32',
  },
  statCardOrders: {
    borderLeft: '5px solid #1976D2',
  },
  statCardUsers: {
    borderLeft: '5px solid #FF9800',
  },
  statCardStock: {
    borderLeft: '5px solid #F44336',
  },
  statIconBg: {
    fontSize: 32,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: 600,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1a1a1a',
    margin: '2px 0',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: 700,
  },
  statTrendPositive: {
    color: '#4CAF50',
  },
  statTrendNeutral: {
    color: '#1976D2',
  },
  statTrendNegative: {
    color: '#F44336',
  },
  dashboardSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#333',
    margin: 0,
    paddingLeft: 4,
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  moduleCardWeb: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  moduleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconText: {
    fontSize: 28,
  },
  moduleTitleText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#444',
  },
  systemAlertBox: {
    backgroundColor: '#FFF9C4',
    padding: 24,
    borderRadius: 20,
    border: '1px solid #FFF176',
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#827717',
  },
  alertMessage: {
    fontSize: 14,
    color: '#827717',
    margin: 0,
    lineHeight: 1.5,
  },
};

export default AdminDashboardScreen;
