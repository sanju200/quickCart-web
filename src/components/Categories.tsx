import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { Product } from '../services/product.service';
import { CartItem } from '../services/cart.service';
import { getOrders, Order } from '../services/order.service';
import { getAllCategories, Category } from '../services/category.service';
import ProductCard from './ProductCard';
import '../styles/Categories.css';

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
  const { cartItems, addToCartOptimistic, updateQtyOptimistic } = useCartCount();
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
    updateQtyOptimistic(productId, delta);
  };

  const fetchRecentlyOrdered = async () => {
    try {
      setLoading(true);
      const [orders, categories] = await Promise.all([
        getOrders(),
        getAllCategories()
      ]);
      const productMap = new Map<string, Product>();
      orders.forEach((order: Order) => {
        order.items?.forEach((orderItem: any) => {
          const productId = orderItem.productId || orderItem.product?.id;
          const productKey = productId || orderItem.productTitle || orderItem.id;
          if (productKey && !productMap.has(productKey)) {
            const catId = orderItem.categoryId || orderItem.product?.categoryId;
            const match = categories.find((c: Category) => c.id === catId || c.category === catId || c.name === catId || c.title === catId);
            const categoryName = match ? (match.title || match.name || match.category) : (orderItem.product?.category || 'Ordered');

            const product: Product = {
              id: productId || orderItem.id,
              name: orderItem.productTitle || orderItem.product?.name || 'Product',
              price: (orderItem.priceAtPurchase || orderItem.price || orderItem.product?.price || 0).toString(),
              image: orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/150',
              weight: orderItem.weight || orderItem.product?.weight || 'Unit',
              category: categoryName
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
    addToCartOptimistic(product);
  };

  return (
    <div className="categories-container">
      {/* Section Header */}
      <div className="section-header">
        <div className="header-title-row">
          <span className="header-icon">🛍️</span>
          <h2 className="header-title">Shop by Category</h2>
        </div>
        <button
          onClick={() => navigate('CATEGORY_PRODUCTS', { category: 'all', allCategories: gridCategories })}
          className="see-all-btn"
        >
          <span className="desktop-btn-text">Explore All Categories</span>
          <span className="mobile-btn-icon">→</span>
        </button>
      </div>

      {/* Category Grid - 2x4 for mobile/tablet, flexible for desktop */}
      <div className="grid-container">
        {gridCategories.slice(0, 8).map((item, index) => {
          const bgColor = BG_COLORS[index % BG_COLORS.length];
          const catValue = item.tag || item.id || item.name;
          return (
            <div
              key={item.id}
              className="grid-item"
              onClick={() => navigate('CATEGORY_PRODUCTS', { category: catValue, allCategories: gridCategories })}
            >
              <div className="icon-box" style={{ backgroundColor: bgColor }}>
                <span className="grid-icon">{item.icon || '📦'}</span>
              </div>
              <span className="grid-title">{item.name || item.title}</span>
              <span className="grid-subtext">Fresh {item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Specialty Tags Section */}
      <div className="tags-container">
        <div className="recent-header">
          <div className="header-title-row">
            <span className="header-icon">✨</span>
            <h2 className="recent-title">Quick Filters</h2>
          </div>
        </div>
        <div className="tab-scroll">
          {CATEGORY_TABS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`tab ${isActive ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate('FILTERED_PRODUCTS', {
                    category: (item as any).category || 'all',
                    tag: (item as any).tag || '',
                    title: item.title,
                  });
                }}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-text">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Ordered Section */}
      <div className="recent-section">
        <div className="recent-content-wrapper">
          <div className="recent-header">
            <div className="header-title-row">
              <span className="header-icon">🕒</span>
              <h2 className="recent-title">Your Regular Purchases</h2>
            </div>
            <button
              onClick={() => navigate('PREVIOUSLY_ORDERED')}
              className="see-all-btn"
            >
              <span className="desktop-btn-text">Reorder History →</span>
              <span className="mobile-btn-icon">→</span>
            </button>
          </div>

          {loading ? (
            <div className="loader-container">
              <ActivityIndicator size="large" color="#2E7D32" />
            </div>
          ) : error ? (
            <div className="loader-container">
              <span className="error-text">{error}</span>
              <button onClick={fetchRecentlyOrdered} className="retry-btn">
                Tap to Retry
              </button>
            </div>
          ) : recentlyOrdered.length > 0 ? (
            <div className="product-scroll">
              {recentlyOrdered.slice(0, 10).map((item) => (
                <div key={item.id} className="scroll-card-wrapper">
                  <ProductCard
                    item={item}
                    quantity={getProductQuantity(item.id)}
                    onAdd={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    numColumns={4}
                  />
                </div>
              ))}
              {/* View More card — always visible */}
              <div className="scroll-card-wrapper">
                <button
                  className="view-all-card"
                  onClick={() => navigate('PREVIOUSLY_ORDERED')}
                >
                  <div className="view-all-icon-container">
                    <span className="view-all-icon">→</span>
                  </div>
                  <span className="view-all-text">View More</span>
                  <span className="view-all-sub-text">See all ordered items</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-recent-container">
              <div className="empty-recent-icon-box">
                <span className="empty-recent-icon">🛍️</span>
              </div>
              <span className="empty-recent-text">No recent orders yet</span>
              <span className="empty-recent-sub-text">Your ordered items will appear here for easy reordering</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
