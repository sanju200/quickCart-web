import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getOrders, Order } from '../services/order.service';
import { getAllCategories } from '../services/category.service';
import '../styles/common.css';
import '../styles/components.css';

const OrdersScreen = () => {
  const { navigate, categoryData, showToast } = useAppNavigation();
  const { addToCartOptimistic } = useCartCount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [orderData, categories] = await Promise.all([
        getOrders(),
        getAllCategories()
      ]);
      
      const enrichedOrders = orderData.map((order: Order) => ({
        ...order,
        items: order.items?.map(item => {
          const catId = item.categoryId || item.product?.categoryId;
          const categoryMatch = categories.find((c: any) => c.id === catId || c.category === catId || c.name === catId || c.title === catId);
          return {
            ...item,
            categoryName: categoryMatch 
              ? String(categoryMatch.title || categoryMatch.name || categoryMatch.category || 'General') 
              : String(item.product?.category || 'Ordered')
          };
        })
      }));

      setOrders(enrichedOrders);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    order.items?.forEach(item => {
      addToCartOptimistic({
        id: item.productId || item.product?.id || item.id,
        name: item.productTitle || item.product?.name || 'Product',
        price: item.priceAtPurchase || item.price || item.product?.price || 0,
        image: item.productImage || item.product?.image || '',
        weight: item.product?.weight || 'Unit',
        category: item.categoryName || 'General'
      });
    });
    showToast(`${order.items?.length} items added to cart!`, 'success');
  };

  return (
    <div className="container" style={{ backgroundColor: '#F9FBF9' }}>
      <div className="header" style={{ borderBottom: '1px solid #eee' }}>
        <button
          onClick={() => navigate(categoryData?.from === 'PROFILE' ? 'PROFILE' : 'HOME')}
          className="back-button"
        >
          <span className="back-icon">←</span>
        </button>
        <div className="header-info" style={{ marginLeft: 5 }}>
          <h1 className="header-title" style={{ fontSize: 22 }}>Order History</h1>
        </div>
      </div>

      <div className="product-content" style={{ overflowY: 'auto', height: 'auto', flex: 1 }}>
        <div className="content-wrapper" style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
          {loading ? (
            <div className="center-container" style={{ height: 400 }}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <p style={{ marginTop: 15, color: '#666', fontWeight: 600 }}>Fetching your order history...</p>
            </div>
          ) : error ? (
            <div className="center-container">
              <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 20 }}>{error}</p>
              <button className="reorder-btn" style={{ padding: '12px 24px' }} onClick={fetchOrders}>
                <span className="reorder-btn-text">Retry Loading</span>
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="center-container" style={{ height: 500 }}>
              <span style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>📦</span>
              <h2 style={{ fontSize: 20, color: '#333', fontWeight: 700 }}>No orders found yet</h2>
              <button className="reorder-btn" style={{ marginTop: 24, padding: '16px 32px' }} onClick={() => navigate('HOME')}>
                <span className="reorder-btn-text">Start Shopping</span>
              </button>
            </div>
          ) : (
            <div className="list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {orders.map((order) => {
                const date = new Date(order.createdAt || order.created_at || '').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={order.id} className="order-card" style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: 24, 
                    padding: 24, 
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
                  }}>
                    {/* Card Top */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{date}</span>
                        <p style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 900, marginTop: 2 }}>ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div style={{ 
                        backgroundColor: order.status === 'DELIVERED' ? '#E8F5E9' : '#E3F2FD', 
                        padding: '6px 14px', 
                        borderRadius: 50 
                      }}>
                        <span style={{ 
                          fontSize: 11, 
                          color: order.status === 'DELIVERED' ? '#2E7D32' : '#1976D2', 
                          fontWeight: 800, 
                          textTransform: 'uppercase' 
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="items-preview" style={{ marginBottom: 24, display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
                      {order.items?.map((item: any, idx) => (
                        <div key={item.id || idx} style={{ width: 80, flexShrink: 0 }}>
                          <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 16, border: '1px solid #f0f0f0', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={item.productImage || item.product?.image || 'https://via.placeholder.com/80'} 
                              style={{ width: 60, height: 60, objectFit: 'contain' }} 
                              alt="product"
                            />
                            <span style={{ position: 'absolute', top: -5, right: -5, width: 22, height: 22, backgroundColor: '#2E7D32', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, border: '2px solid #fff' }}>
                              {item.quantity}
                            </span>
                          </div>
                          <p style={{ fontSize: 9, color: '#888', fontWeight: 700, marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.categoryName}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: 20 }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Total Paid</span>
                        <p style={{ fontSize: 20, color: '#1a1a1a', fontWeight: 900 }}>₹{order.totalAmount}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                          onClick={() => navigate('TRACK_ORDER', { orderId: order.id })}
                          style={{ padding: '12px 20px', borderRadius: 14, backgroundColor: '#f5f5f5', border: 'none', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: 14, color: '#333', fontWeight: 700 }}>Details</span>
                        </button>
                        <button 
                          onClick={() => handleReorder(order)}
                          className="reorder-btn"
                          style={{ padding: '12px 24px', borderRadius: 14, border: 'none', cursor: 'pointer' }}
                        >
                          <span className="reorder-btn-text" style={{ fontSize: 14, fontWeight: 800 }}>Order Again</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default OrdersScreen;
