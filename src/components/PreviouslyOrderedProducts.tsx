import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { Product } from '../services/product.service';
import { getOrders, Order, OrderItem } from '../services/order.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import ProductCard from './ProductCard';

const PreviouslyOrderedProducts = () => {
  const { navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreviouslyOrdered();
  }, []);

  const fetchPreviouslyOrdered = async () => {
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
              category: orderItem.product?.category || 'ordered'
            };
            productMap.set(productKey, product);
          }
        });
      });

      setProducts(Array.from(productMap.values()));
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
        <button onClick={() => navigate('HOME')} className="back-button" aria-label="Go back">
           <span className="back-icon">←</span>
        </button>
        <div className="header-info">
          <h1 className="header-title">Previously Ordered</h1>
          <span className="version-text" style={{ marginTop: 0, marginLeft: 8 }}>{products.length} items found</span>
        </div>
      </div>

      <div className="product-content" style={{ overflowY: 'visible', height: 'auto', flex: 1 }}>
        {loading ? (
          <div className="center-container">
            <ActivityIndicator size="large" color="#2E7D32" />
          </div>
        ) : error ? (
          <div className="center-container">
            <p className="errorText" style={{ color: '#d32f2f', marginBottom: 20 }}>{error}</p>
            <button className="reorder-btn" onClick={fetchPreviouslyOrdered}>
              <span className="reorder-btn-text">Retry Loading</span>
            </button>
          </div>
        ) : (
          <div className="list-content" style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
            gap: '20px',
            padding: '20px',
            paddingBottom: '120px'
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
              <div style={{ gridColumn: `1 / span ${numColumns}`, textAlign: 'center', paddingTop: 80 }}>
                <span style={{ fontSize: 64, marginBottom: 20, opacity: 0.3, display: 'block' }}>📦</span>
                <h2 style={{ fontSize: 20, color: '#333', fontWeight: 700 }}>No previous orders found</h2>
                <button className="reorder-btn" style={{ marginTop: 24 }} onClick={() => navigate('HOME')}>
                  <span className="reorder-btn-text">Browse Products</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    // maxWidth: 1000,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666',
  },
  productContent: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default PreviouslyOrderedProducts;
