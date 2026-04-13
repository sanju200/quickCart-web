import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  ScrollView,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native';
import './styles/layout.css';
import './styles/common.css';

// Import Custom Components
import Header from './components/Header';
import Carousel from './components/Carousel';
import Features from './components/Features';
import Categories from './components/Categories';
import CategoryProducts from './components/CategoryProducts';
import FilteredProductsScreen from './components/FilteredProductsScreen';
import ProfileScreen from './components/ProfileScreen';
import OrdersScreen from './components/OrdersScreen';
import CartScreen from './components/CartScreen';
import PaymentsScreen from './components/PaymentsScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import EditProfileScreen from './components/EditProfileScreen';
import SavedAddressesScreen from './components/SavedAddressesScreen';
import ContactDetailsScreen from './components/ContactDetailsScreen';
import PreviouslyOrderedProducts from './components/PreviouslyOrderedProducts';
import Sidebar from './components/Sidebar';

import HelpAndSupportScreen from './components/HelpAndSupportScreen';
import TrackOrderScreen from './components/TrackOrderScreen';
import InventoryManagerScreen from './components/InventoryManagerScreen';
import AddProductScreen from './components/AddProductScreen';
import CategoryManagerScreen from './components/CategoryManagerScreen';
import OfferManagerScreen from './components/OfferManagerScreen';
import LowStockDashboard from './components/LowStockDashboard';
import LiveDeliveryMap from './components/LiveDeliveryMap';
import PartnerOnboardingScreen from './components/PartnerOnboardingScreen';
import CommissionManagerScreen from './components/CommissionManagerScreen';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import FeedbackCenterScreen from './components/FeedbackCenterScreen';
import DeliveryAnalyticsScreen from './components/DeliveryAnalyticsScreen';
import OperationalControlScreen from './components/OperationalControlScreen';
import AdminDashboardScreen from './components/AdminDashboardScreen';
import LogisticsManagerScreen from './components/LogisticsManagerScreen';
import DeliveryPartnerScreen from './components/DeliveryPartnerScreen';
import UserManagerScreen from './components/UserManagerScreen';
import SalesManagerScreen from './components/SalesManagerScreen';
import NotFoundScreen from './components/NotFoundScreen';
import ToastNotification from './components/ToastNotification';
import { getAuthToken, getUserData } from './services/authentication.service';

import { Screen, NavigationContext, CartContext } from './context/AppContext';
import { getCart } from './services/cart.service';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [categoryData, setCategoryData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const refreshCartCount = async () => {
    try {
      const items = await getCart();
      setCartItems(items);
      const uniqueItems = new Set(items.map(item => item.productId || item.product?.id || item.id));
      setCartCount(uniqueItems.size);
    } catch (error) {
      console.error('Failed to refresh cart count:', error);
    }
  };

  const resetCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setCurrentScreen('LOGIN');
        } else {
          const userData = await getUserData();
          setUserRole(userData?.role || 'USER');
          setCurrentScreen('HOME');
          refreshCartCount();
        }
      } catch (error) {
        setCurrentScreen('LOGIN');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  const navigate = (screen: Screen, data?: any) => {
    // Update URL manually if not already there
    const path = screen === 'HOME' ? '/' : `/${screen.toLowerCase().replace(/_/g, '-')}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ screen, data }, '', path);
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      if (data) setCategoryData(data);
      
      if (screen === 'HOME') {
        getUserData().then(data => setUserRole(data?.role || 'USER'));
        refreshCartCount();
      } else if (screen === 'CART') {
        refreshCartCount();
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setCurrentScreen(event.state.screen);
        if (event.state.data) setCategoryData(event.state.data);
      } else {
        // Fallback for root or manually typed URLs
        const path = window.location.pathname.slice(1).toUpperCase().replace(/-/g, '_');
        if (!path || path === '') setCurrentScreen('HOME');
        else setCurrentScreen(path as Screen);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial sync from URL on refresh
    const initialPath = window.location.pathname.slice(1).toUpperCase().replace(/-/g, '_');
    if (initialPath && initialPath !== '') {
      setCurrentScreen(initialPath as Screen);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
  };

  if (isLoadingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <ActivityIndicator size="large" color="#2E7D32" />
          <span className="loading-text">Loading QuickCart...</span>
        </div>
      </div>
    );
  }

  return (
    <NavigationContext.Provider value={{ currentScreen, categoryData, userRole, navigate, showToast, isSidebarOpen, toggleSidebar, isLoading, setIsLoading }}>
      <CartContext.Provider value={{ cartItems, cartCount, refreshCartCount, resetCart }}>
        <Sidebar />
        <div className="app-wrapper">
          <AppContent fadeAnim={fadeAnim} />
        </div>
        
        {isLoading && (
          <div className="global-loader-overlay">
            <div className="premium-spinner"></div>
          </div>
        )}
        
        <ToastNotification
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      </CartContext.Provider>
    </NavigationContext.Provider>
  );
}

function AppContent({ fadeAnim }: { fadeAnim: Animated.Value }) {
  const { currentScreen } = useContext(NavigationContext)!;

  const showHeader = !['LOGIN', 'SIGNUP', 'NOT_FOUND'].includes(currentScreen);

  return (
    <div className="page-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      height: currentScreen === 'CATEGORY_PRODUCTS' ? '100vh' : 'auto', 
      overflow: currentScreen === 'CATEGORY_PRODUCTS' ? 'hidden' : 'visible' 
    }}>
      {showHeader && <Header />}
      <Animated.View style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, opacity: fadeAnim }}>
        <AppScreen currentScreen={currentScreen} />
      </Animated.View>
    </div>
  );
}



function AppScreen({ currentScreen }: { currentScreen: Screen }) {
  const { userRole, categoryData } = useContext(NavigationContext)!;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        if (userRole?.toUpperCase() === 'ADMIN') return <AdminDashboardScreen />;
        if (userRole?.toUpperCase() === 'DELIVERY_PARTNER') return <DeliveryPartnerScreen />;
        if (userRole?.toUpperCase() === 'INVENTORY_MANAGER') return <InventoryManagerScreen />;
        if (userRole?.toUpperCase() === 'LOGISTICS_PARTNER') return <LogisticsManagerScreen />;
        
        return (
          <div className="scroll-container">
            <Carousel />
            <Features />
            <Categories />
            <div style={{ height: 80 }} />
          </div>
        );
      case 'CATEGORY_PRODUCTS':
        return <CategoryProducts />;
      case 'FILTERED_PRODUCTS':
        return <FilteredProductsScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'EDIT_PROFILE':
        return <EditProfileScreen />;
      case 'SAVED_ADDRESSES':
        return <SavedAddressesScreen />;
      case 'CONTACT_DETAILS':
        return <ContactDetailsScreen />;
      case 'ORDERS':
        return <OrdersScreen />;
      case 'CART':
        return <CartScreen />;
      case 'PAYMENTS':
        return <PaymentsScreen />;
      case 'LOGIN':
        return <LoginScreen />;
      case 'SIGNUP':
        return <SignupScreen />;
      case 'NOT_FOUND':
        return <NotFoundScreen />;
      case 'PREVIOUSLY_ORDERED':
        return <PreviouslyOrderedProducts />;
      case 'HELP_AND_SUPPORT':
        return <HelpAndSupportScreen />;
      case 'TRACK_ORDER':
        return <TrackOrderScreen orderId={categoryData?.orderId} />;
      case 'INVENTORY_MANAGER':
        return <InventoryManagerScreen />;
      case 'ADD_PRODUCT':
        return <AddProductScreen />;
      case 'CATEGORY_MANAGER':
        return <CategoryManagerScreen />;
      case 'OFFER_MANAGER':
        return <OfferManagerScreen />;
      case 'LOW_STOCK_DASHBOARD':
        return <LowStockDashboard />;
      case 'LIVE_DELIVERY_MAP':
        return <LiveDeliveryMap />;
      case 'PARTNER_ONBOARDING':
        return <PartnerOnboardingScreen />;
      case 'COMMISSION_MANAGER':
        return <CommissionManagerScreen />;
      case 'EXECUTIVE_DASHBOARD':
        return <ExecutiveDashboard />;
      case 'FEEDBACK_CENTER':
        return <FeedbackCenterScreen />;
      case 'DELIVERY_ANALYTICS':
        return <DeliveryAnalyticsScreen />;
      case 'OPERATIONAL_CONTROL':
        return <OperationalControlScreen />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardScreen />;
      case 'LOGISTICS_PARTNER':
        return <LogisticsManagerScreen />;
      case 'DELIVERY_PARTNER':
        return <DeliveryPartnerScreen />;
      case 'USER_MANAGER':
        return <UserManagerScreen />;
      case 'SALES_MANAGER':
        return <SalesManagerScreen />;
      default:
        return <NotFoundScreen />;
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      width: '100%', 
      height: currentScreen === 'CATEGORY_PRODUCTS' ? '100%' : 'auto', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: currentScreen === 'CATEGORY_PRODUCTS' ? 'hidden' : 'visible' 
    }}>
      {renderScreen()}
    </div>
  );
}

export default App;
