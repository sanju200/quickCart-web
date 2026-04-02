import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getFilteredProducts, Product, getCategoryName } from '../services/product.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import ProductCard from './ProductCard';
import '../styles/common.css';
import '../styles/forms.css';

const FilteredProductsScreen = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch ] = useState(categoryData?.search || '');
  
  const screenTitle = categoryData?.title || 'Products';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(categoryData?.category || 'all', localSearch, categoryData?.tag);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, categoryData?.tag]);

  const fetchProducts = async (category?: string, search?: string, tag?: string) => {
    try {
      setLoading(true);
      const data = await getFilteredProducts(category, search, tag);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = cartItems.find((i: CartItem) => (i.productId || i.product?.id) === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      refreshCartCount();
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      console.error('Error updating cart:', err);
      alert('Failed to update quantity');
    }
  };

  const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      item={item}
      quantity={getProductQuantity(item.id)}
      onAdd={handleAddToCart}
      onUpdateQuantity={handleUpdateQuantity}
      numColumns={numColumns}
    />
  );

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 15px' }}>
          <button onClick={() => navigate('HOME')} className="back-button" aria-label="Go back">
            <span className="back-icon">←</span>
          </button>
          <div className="header-info">
            <h1 className="header-title">{screenTitle}</h1>
            <span className="version-text" style={{ marginTop: 0 }}>
              {products.length} items found
              {categoryData?.tag === 'under_99' && ' • Great deals under ₹99'}
            </span>
          </div>
        </div>
      </div>

      <div className="product-content" style={{ overflowY: 'visible', height: 'auto', flex: 1, backgroundColor: '#FAFAFA' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          {loading ? (
            <div className="center-container" style={{ padding: '80px 20px' }}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <p style={{ marginTop: 20, color: '#666', fontWeight: 500 }}>Finding the best products for you...</p>
            </div>
          ) : error ? (
            <div className="center-container" style={{ padding: '80px 20px' }}>
              <span style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>⚠️</span>
              <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 24, fontSize: 16 }}>{error}</p>
              <button 
                className="reorder-btn" 
                onClick={() => fetchProducts(categoryData?.category, localSearch)}
              >
                <span className="reorder-btn-text">Retry Loading</span>
              </button>
            </div>
          ) : (
            <div className="list-content" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
              padding: '24px',
              paddingBottom: '120px',
              width: '100%',
            }}>
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  quantity={getProductQuantity(item.id)}
                  onAdd={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  numColumns={numColumns}
                />
              ))}
              
              {products.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', width: '100%' }}>
                  <span style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>🔍</span>
                  <h2 style={{ fontSize: 24, color: '#333', fontWeight: 700, marginBottom: 8 }}>No products found</h2>
                  <p style={{ color: '#666', fontSize: 16 }}>Try adjusting your filters or search terms</p>
                  <button 
                    className="reorder-btn" 
                    style={{ marginTop: 32, padding: '14px 28px', minWidth: 200 }} 
                    onClick={() => navigate('HOME')}
                  >
                    <span className="reorder-btn-text">Browse All Products</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default FilteredProductsScreen;
