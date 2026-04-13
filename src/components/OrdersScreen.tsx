import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
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
  const { cartItems, addToCartOptimistic, updateQtyOptimistic } = useCartCount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [data, categories] = await Promise.all([
        getOrders(),
        getAllCategories()
      ]);
      
      // Map categories to order items
      const enrichedOrders = data.map(order => ({
        ...order,
        items: order.items.map(item => {
          const catId = item.categoryId || item.product?.categoryId;
          const match = categories.find((c: any) => c.id === catId || c.category === catId || c.name === catId || c.title === catId);
          return {
            ...item,
            categoryName: match ? (match.title || match.name || match.category) : (item.product?.category || 'General')
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

  const renderOrderItem = ({ item }: { item: Order }) => {
    const date = new Date(item.createdAt || item.created_at || '').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View className="order-card">
        <View className="order-header">
          <View>
            <Text className="order-date">{date}</Text>
            <Text className="order-id">Order #{item.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View className={`status-badge status${item.status}`}>
            <Text className={`status-text statusText${item.status}`}>{item.status}</Text>
          </View>
        </View>

        <View className="items-preview">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.items?.map((orderItem, index) => (
              <View key={orderItem.id || index} className="mini-item">
                <Image 
                  source={{ uri: orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/50' }} 
                  className="mini-image" 
                />
                <Text className="mini-qty">x{orderItem.quantity}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="order-footer">
          <Text className="total-label">Total: <Text className="total-amount">₹{item.totalAmount}</Text></Text>
          <View className="action-buttons" style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              className="track-btn"
              onPress={() => navigate('TRACK_ORDER', { orderId: item.id })}
            >
              <Text className="track-btn-text">Track</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="reorder-btn"
              onPress={() => navigate('HOME')}
            >
              <Text className="reorder-btn-text">Order Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <button
          onClick={() => {
            if (categoryData?.from === 'PROFILE') {
              navigate('PROFILE');
            } else {
              navigate('HOME');
            }
          }}
          className="back-button"
          aria-label="Go back"
        >
          <span className="back-icon">←</span>
        </button>
        <h1 className="header-title">Order History</h1>
      </div>

      <div className="product-content" style={{ overflowY: 'visible', height: 'auto', flex: 1 }}>
        <div className="content-wrapper" style={{ maxWidth: '100%' }}>
          {loading ? (
            <div className="center-container">
              <ActivityIndicator size="large" color="#2E7D32" />
              <p style={{ marginTop: 15, color: '#666', fontWeight: 600 }}>Fetching your order history...</p>
            </div>
          ) : error ? (
            <div className="center-container">
              <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 20 }}>{error}</p>
              <button className="reorder-btn" onClick={fetchOrders}>
                <span className="reorder-btn-text">Retry Loading</span>
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="center-container" style={{ paddingTop: 80 }}>
              <span style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>📦</span>
              <h2 style={{ fontSize: 20, color: '#333', fontWeight: 700 }}>No orders found</h2>
              <button className="reorder-btn" style={{ marginTop: 24 }} onClick={() => navigate('HOME')}>
                <span className="reorder-btn-text">Start Shopping</span>
              </button>
            </div>
          ) : (
            <div className="list-wrapper">
              {orders.map((item) => {
                const date = new Date(item.createdAt || item.created_at || '').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={item.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-date">{date}</span>
                        <p className="order-id">Order ID: #{item.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className={`status-badge status${item.status}`}>
                        <span className="status-text">{item.status}</span>
                      </div>
                    </div>

                    <div className="items-preview">
                      {item.items?.map((orderItem: any, index) => (
                        <div key={orderItem.id || index} className="mini-item-container" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="mini-item">
                            <img 
                              src={orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/64'} 
                              className="mini-image" 
                              alt={orderItem.productTitle || 'product'}
                            />
                            <span className="mini-qty">x{orderItem.quantity}</span>
                          </div>
                          <span style={{ fontSize: 10, color: '#2E7D32', fontWeight: 600, textAlign: 'center', backgroundColor: '#E8F5E9', padding: '2px 4px', borderRadius: 4 }}>
                            {orderItem.categoryName}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="total-container">
                        <span className="total-label">Total Amount</span>
                        <p className="total-amount">₹{item.totalAmount}</p>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', gap: 12 }}>
                        <button 
                          className="track-btn"
                          onClick={() => navigate('TRACK_ORDER', { orderId: item.id })}
                        >
                          <span className="track-btn-text">Track Order</span>
                        </button>
                        <button 
                          className="reorder-btn"
                          onClick={() => {
                            item.items?.forEach(orderItem => {
                              addToCartOptimistic({
                                id: orderItem.productId || orderItem.product?.id || orderItem.id,
                                name: orderItem.productTitle,
                                price: orderItem.price,
                                image: orderItem.productImage,
                                weight: orderItem.product?.weight || 'Unit',
                                category: orderItem.categoryName
                              });
                            });
                            showToast('Items added to cart!', 'success');
                          }}
                        >
                          <span className="reorder-btn-text">Order Again</span>
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



export default OrdersScreen;
