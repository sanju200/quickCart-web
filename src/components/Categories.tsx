import React, { useState, useEffect } from 'react';
import {
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getAllProducts, Product, getCategoryName } from '../services/product.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import { getOrders, Order, OrderItem } from '../services/order.service';
import { getAllCategories } from '../services/category.service';
import ProductCard from './ProductCard';

const CATEGORY_TABS = [
  { id: '1', title: 'All Products', icon: '🏠', category: 'all' },
  { id: '2', title: 'Best Sellers', icon: '🔥', tag: 'best_seller' },
  { id: '3', title: 'Fresh Arrivals', icon: '🌟', tag: 'fresh' },
  { id: '4', title: 'Under ₹99', icon: '💰', tag: 'under_99' },
  { id: '5', title: 'Healthy', icon: '🥗', tag: 'healthy' },
  { id: '6', title: 'Organic', icon: '🌿', tag: 'organic' },
  { id: '7', title: 'Premium', icon: '👑', tag: 'premium' },
  { id: '8', title: 'Combos', icon: '🎁', tag: 'combo' },
];

const BG_COLORS = ['#E8F5E9', '#E3F2FD', '#FFF3E0', '#FCE4EC', '#F3E5F5', '#EFEBE9', '#FFF8E1', '#E0F7FA'];

const Categories = () => {
  const [activeTab, setActiveTab] = useState('1');
  const { navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [recentlyOrdered, setRecentlyOrdered] = useState<Product[]>([]);
  const [gridCategories, setGridCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyOrdered();
    const fetchCats = async () => {
      try {
        const data = await getAllCategories();
        setGridCategories(data.filter(c => c.id !== 'all'));
      } catch (err) {
        console.error('Error fetching grid categories:', err);
      }
    };
    fetchCats();
  }, []);

  const getProductQuantity = (productId: string) => {
    const item = cartItems.find((i: CartItem) => (i.productId || i.product?.id) === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      console.error('Error updating cart:', err);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const fetchRecentlyOrdered = async () => {
    try {
      setLoading(true);
      const orders = await getOrders();
      const productMap = new Map<string, Product>();
      orders.forEach((order: Order) => {
        order.items?.forEach((orderItem: OrderItem) => {
          const productId = orderItem.productId || orderItem.product?.id;
          const productKey = productId || orderItem.productTitle || orderItem.id;
          if (productKey && !productMap.has(productKey)) {
            const product: Product = {
              id: productId || orderItem.id,
              name: orderItem.productTitle || orderItem.product?.name || 'Product',
              price: (orderItem.priceAtPurchase || orderItem.price || orderItem.product?.price || 0).toString(),
              image: orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/150',
              weight: orderItem.product?.weight || 'Unit',
              category: orderItem.product?.category || 'General'
            };
            productMap.set(productKey, product);
          }
        });
      });
      setRecentlyOrdered(Array.from(productMap.values()));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching recently ordered:', err);
      setRecentlyOrdered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      refreshCartCount();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add item to cart');
    }
  };

  return (
    <div style={styles.container}>
      {/* Section Header */}
      <div style={styles.sectionHeader}>
        <div style={styles.headerTitleRow}>
          <span style={styles.headerIcon}>🛍️</span>
          <h2 style={styles.headerTitle}>Shop by Category</h2>
        </div>
        <button
          onClick={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })}
          style={styles.seeAllBtn}
        >
          Explore All Categories
        </button>
      </div>

      {/* Category Grid - 2x4 for mobile/tablet, flexible for desktop */}
      <div style={styles.gridContainer}>
        {gridCategories.slice(0, 8).map((item, index) => {
          const bgColor = BG_COLORS[index % BG_COLORS.length];
          const catValue = item.tag || item.id || item.name;
          return (
            <div
              key={item.id}
              style={styles.gridItem}
              onClick={() => navigate('CATEGORY_PRODUCTS', { category: catValue })}
            >
              <div style={{ ...styles.iconBox, backgroundColor: bgColor }}>
                <span style={styles.gridIcon}>{item.icon || '📦'}</span>
              </div>
              <span style={styles.gridTitle}>{item.name || item.title}</span>
              <span style={styles.gridSubtext}>Fresh {item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Specialty Tags Section */}
      <div style={styles.tagsContainer}>
        <div style={styles.recentHeader}>
          <div style={styles.headerTitleRow}>
            <span style={styles.headerIcon}>✨</span>
            <h2 style={styles.recentTitle}>Quick Filters</h2>
          </div>
        </div>
        <div style={styles.tabScroll}>
          {CATEGORY_TABS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                style={{
                  ...styles.tab,
                  ...(isActive ? styles.tabActive : styles.tabInactive),
                }}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate('FILTERED_PRODUCTS', {
                    category: (item as any).category || 'all',
                    tag: (item as any).tag || '',
                    title: item.title,
                  });
                }}
              >
                <span style={styles.tabIcon}>{item.icon}</span>
                <span style={styles.tabText}>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Ordered Section */}
      <div style={styles.recentSection}>
        <div style={styles.recentHeader}>
          <div style={styles.headerTitleRow}>
            <span style={styles.headerIcon}>🕒</span>
            <h2 style={styles.recentTitle}>Your Regular Purchases</h2>
          </div>
          <button
            onClick={() => navigate('PREVIOUSLY_ORDERED')}
            style={styles.seeAllBtn}
          >
            Reorder History →
          </button>
        </div>

        {loading ? (
          <div style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </div>
        ) : error ? (
          <div style={styles.loaderContainer}>
            <span style={styles.errorText}>{error}</span>
            <button onClick={fetchRecentlyOrdered} style={styles.retryBtn}>
              Tap to Retry
            </button>
          </div>
        ) : recentlyOrdered.length > 0 ? (
          <div style={styles.productScroll} className="product-scroll-container">
            {recentlyOrdered.slice(0, 10).map((item) => (
              <div key={item.id} style={{ flexShrink: 0 }} className="scroll-card-wrapper">
                <ProductCard
                  item={item}
                  quantity={getProductQuantity(item.id)}
                  onAdd={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  numColumns={4}
                />
              </div>
            ))}
            {recentlyOrdered.length >= 10 && (
              <button
                style={styles.viewAllCard}
                onClick={() => navigate('PREVIOUSLY_ORDERED')}
              >
                <div style={styles.viewAllIconContainer}>
                  <span style={styles.viewAllIcon}>→</span>
                </div>
                <span style={styles.viewAllText}>View All Items</span>
              </button>
            )}
          </div>
        ) : (
          <div style={styles.emptyRecentContainer}>
            <div style={styles.emptyRecentIconBox}>
              <span style={styles.emptyRecentIcon}>🛍️</span>
            </div>
            <span style={styles.emptyRecentText}>No recent orders yet</span>
            <span style={styles.emptyRecentSubText}>Your ordered items will appear here for easy reordering</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 0',
    backgroundColor: '#fff',
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    marginBottom: 24,
  },
  headerTitleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 26,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 900,
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 800,
    border: '2px solid #E8F5E9',
    background: '#fff',
    cursor: 'pointer',
    padding: '10px 20px',
    borderRadius: 12,
    transition: 'all 0.2s ease',
  },

  /* Category Grid */
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 20,
    padding: '0 24px',
    marginBottom: 48,
    width: '100%',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 16px',
    borderRadius: 24,
    backgroundColor: '#fff',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    position: 'relative',
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transition: 'transform 0.3s ease',
  },
  gridIcon: {
    fontSize: 48,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  gridSubtext: {
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
  },

  /* Tags Section */
  tagsContainer: {
    marginBottom: 48,
  },
  tabScroll: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
    padding: '0 24px',
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 16px',
    borderRadius: 16,
    border: '1.5px solid transparent',
    cursor: 'pointer',
    gap: 10,
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
    color: '#fff',
    boxShadow: '0 6px 15px rgba(46,125,50,0.25)',
  },
  tabInactive: {
    backgroundColor: '#F8F9FA',
    border: '1.5px solid #eee',
    color: '#555',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 0.3,
  },

  /* Recently Ordered */
  recentSection: {
    backgroundColor: '#F1F8E9',
    padding: '40px 0',
    width: '100%',
  },
  recentHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    marginBottom: 24,
  },
  recentTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: -0.5,
  },
  productScroll: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    padding: '0 24px',
    overflowX: 'auto' as any,
    overflowY: 'hidden' as any,
    paddingBottom: 24,
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  loaderContainer: {
    height: 240,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 15,
    marginBottom: 10,
  },
  retryBtn: {
    color: '#2E7D32',
    fontWeight: 800,
    padding: '8px 16px',
    border: '1.5px solid #2E7D32',
    borderRadius: 8,
    background: 'none',
    cursor: 'pointer',
  },
  emptyRecentContainer: {
    height: 240,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.6)',
    margin: '0 24px',
    borderRadius: 32,
    border: '2px dashed #A5D6A7',
    gap: 12,
    padding: 32,
    textAlign: 'center',
  },
  emptyRecentIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: 10,
  },
  emptyRecentIcon: {
    fontSize: 32,
  },
  emptyRecentText: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: 800,
  },
  emptyRecentSubText: {
    color: '#666',
    fontSize: 15,
    maxWidth: 300,
    lineHeight: 1.5,
  },
  viewAllCard: {
    minWidth: 160,
    backgroundColor: '#fff',
    borderRadius: 24,
    border: '2px solid #E8F5E9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    cursor: 'pointer',
    flexShrink: 0,
    gap: 16,
    transition: 'all 0.2s ease',
  },
  viewAllIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: 'linear-gradient(135deg, #2E7D32, #43A047)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 16px rgba(46,125,50,0.2)',
  },
  viewAllIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
  },
  viewAllText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.3,
  },
};

export default Categories;
