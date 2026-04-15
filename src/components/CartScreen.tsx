import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import '../styles/CartScreen.css';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getUserData, UserData } from '../services/authentication.service';

const CartScreen = () => {
  const { navigate } = useAppNavigation();
  const { cartItems: items, refreshCartCount, updateQtyOptimistic } = useCartCount();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    refreshCartCount();
    getUserData().then(data => setUser(data));
  }, []);

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    updateQtyOptimistic(productId, delta);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
        const price = typeof item.product?.price === 'string' 
            ? parseFloat(item.product.price.replace(/[^\d.]/g, '')) 
            : typeof item.product?.price === 'number' ? item.product.price : 0;
        return sum + (price * item.quantity);
    }, 0);
  };

  const deliveryFee = 25;
  const handlingFee = 5;
  const subtotal = calculateSubtotal();
  const total = items.length > 0 ? subtotal + deliveryFee + handlingFee : 0;

  const handleProceed = () => {
    navigate('PAYMENTS', { items, total });
  };

  return (
    <div className="cart-container">
      {/* Header */}
      <header className="cart-header">
        <button className="cart-back-btn" onClick={() => navigate('HOME')}>←</button>
        <span className="cart-header-title">Review Cart</span>
      </header>

      {/* Main Content */}
      <main className="cart-scroll-view">
        <div className="cart-content-wrapper">
          {loading ? (
            <div className="center-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </div>
          ) : error ? (
            <div className="center-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
              <p className="error-text">{error}</p>
              <button className="retry-btn" onClick={() => refreshCartCount()}>Retry</button>
            </div>
          ) : items.length > 0 ? (
            <>
              {/* Delivery Banner */}
              <div className="delivery-banner">
                <span className="delivery-icon">⚡</span>
                <span className="delivery-text">Delivery in 8 mins to Home</span>
              </div>

              {/* Items Card */}
              <div className="items-card">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.product?.image || 'https://via.placeholder.com/60'} 
                      alt={item.product?.name} 
                      className="item-image" 
                    />
                    <div className="item-details">
                      <h3 className="item-name">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="item-weight">{item.product?.weight || '1 unit'}</p>
                      <div className="item-price-row">
                        ₹{item.product?.price}
                        {item.quantity > 1 && (
                          <span className="item-total-price">
                            x {item.quantity} = ₹{(typeof item.product?.price === 'string' 
                              ? parseFloat(item.product.price.replace(/[^\d.]/g, '')) 
                              : typeof item.product?.price === 'number' ? item.product.price : 0) * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="qty-control">
                      <button 
                        className="qty-btn"
                        onClick={() => handleUpdateQuantity(item.productId || item.product?.id || '', item.quantity, -1)}
                      >−</button>
                      <span className="qty-number">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleUpdateQuantity(item.productId || item.product?.id || '', item.quantity, 1)}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details Card */}
              <div className="bill-card">
                <h2 className="bill-title">Bill Details</h2>
                <div className="bill-line">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bill-line">
                  <span>Delivery Fee</span>
                  <span>₹25</span>
                </div>
                <div className="bill-line">
                  <span>Handling Fee</span>
                  <span>₹5</span>
                </div>
                <div className="bill-line total">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>

                {/* Primary Action Button (Desktop Optimized) */}
                <button 
                  className="desktop-pay-btn"
                  onClick={handleProceed}
                >
                  {user?.addresses?.some(addr => addr.isSelected) ? 'Proceed to Pay →' : 'Select Delivery Address'}
                </button>
              </div>

              {/* Policy Section */}
              <div className="policy-section" style={{ padding: '10px 10px' }}>
                <h4 style={{ color: '#666', marginBottom: '8px', fontSize: '15px' }}>Cancellation Policy</h4>
                <p style={{ color: '#999', fontSize: '12px', lineHeight: '1.6' }}>
                  Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided. Friendly tip: Check your address before paying!
                </p>
              </div>
            </>
          ) : (
            <div className="empty-cart-view" style={{ textAlign: 'center', paddingTop: '100px', width: '100%' }}>
              <span style={{ fontSize: '100px', opacity: 0.1 }}>🛒</span>
              <h2 style={{ marginTop: '24px', color: '#555', fontSize: '24px' }}>Your cart is empty!</h2>
              <button 
                className="desktop-pay-btn" 
                style={{ marginTop: '32px', maxWidth: '240px', marginLeft: 'auto', marginRight: 'auto' }}
                onClick={() => navigate('HOME')}
              >Start Shopping</button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Checkout Bar (Mobile & small tablets) */}
      {items.length > 0 && (
        <div className="checkout-fixed-bar">
          <div className="checkout-bar-glass">
            <div className="pay-info-group">
              <span className="pay-total-amt">₹{total}</span>
              <div className="pay-method-tag">
                <span>Google Pay</span>
                <span style={{ fontSize: '10px' }}>⌄</span>
              </div>
            </div>
            <button 
              className="pay-button-action"
              style={{ 
                background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
              onClick={handleProceed}
            >
              {user?.addresses?.some(addr => addr.isSelected) ? 'Proceed to Pay →' : 'Set Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
