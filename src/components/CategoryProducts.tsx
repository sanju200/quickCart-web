import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getFilteredProducts, Product, getCategoryName } from '../services/product.service';
import { getAllCategories } from '../services/category.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import ProductCard from './ProductCard';
import '../styles/common.css';
import '../styles/forms.css';
import '../styles/sidebar.css';

const CategoryProducts = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSideCategory, setSelectedSideCategory] = useState(categoryData?.category || 'all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch ] = useState(categoryData?.search || '');
  const { width } = useWindowDimensions();
  
  const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;

  useEffect(() => {
    const fetchCats = async () => {
      try {
        // If categories were passed through navigation, use them instead of re-fetching
        if (categoryData?.allCategories && Array.isArray(categoryData.allCategories) && categoryData.allCategories.length > 0) {
          console.log('[CategoryProducts] Using passed categories data');
          setCategories(categoryData.allCategories);
          return;
        }

        console.log('[CategoryProducts] Fetching categories from API');
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading sidebar categories:', err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCats();
  }, [categoryData?.allCategories]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products without server-side filters
      const data = await getFilteredProducts(); 
      setAllProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    // Perform local filtering
    let filtered = [...allProducts];

    // Filter by Category
    if (selectedSideCategory && selectedSideCategory !== 'all') {
      filtered = filtered.filter(p => {
        const catName = getCategoryName(p).toLowerCase();
        const catId = p.categoryId;
        
        // Match by ID or by Name/Tag
        return catId === selectedSideCategory || 
               catName === selectedSideCategory.toLowerCase();
      });
    }

    // Filter by Search
    if (localSearch.trim()) {
      const query = localSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        getCategoryName(p).toLowerCase().includes(query)
      );
    }

    setProducts(filtered);
  }, [allProducts, selectedSideCategory, localSearch]);

  useEffect(() => {
    if (categoryData?.search !== undefined) {
      setLocalSearch(categoryData.search);
    }
    if (categoryData?.category !== undefined) {
        setSelectedSideCategory(categoryData.category);
    }
  }, [categoryData?.search, categoryData?.category]);

  const handleRetry = () => {
    fetchAllProducts();
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
      console.error('Add to cart error:', err);
    }
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      console.error('Error updating cart:', err);
    }
  };

  return (
    <div className="container" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <button onClick={() => navigate('HOME')} className="back-button" aria-label="Go back">
           <span className="back-icon">←</span>
        </button>
        <h1 className="header-title">All Categories</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {catLoading ? (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <ActivityIndicator size="small" color="#2E7D32" />
            </div>
          ) : (
            <div className="sidebar-list-content" style={{ overflowY: 'auto', flex: 1 }}>
              {categories.map((item) => {
                const isActive = selectedSideCategory === (item.tag || item.id || item.name);
                return (
                  <button 
                    key={item.id || item.tag || item.name}
                    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                    onClick={() => setSelectedSideCategory(item.tag || item.id || item.name)}
                  >
                    <div className={`sidebar-icon-box ${isActive ? 'sidebar-icon-box-active' : ''}`}>
                      <span className="sidebar-icon">{item.icon || '📦'}</span>
                    </div>
                    <span className={`sidebar-text ${isActive ? 'sidebar-text-active' : ''}`}>
                      {item.name || item.title}
                    </span>
                    {isActive && <div className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="product-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div className="center-container">
              <ActivityIndicator size="large" color="#2E7D32" />
              <p style={{ marginTop: 15, color: '#666', fontWeight: 600 }}>Refreshing products...</p>
            </div>
          ) : error ? (
            <div className="center-container">
              <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 20 }}>{error}</p>
              <button className="track-btn" style={{ backgroundColor: '#2E7D32' }} onClick={handleRetry}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>Retry</span>
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
                  <span style={{ fontSize: 64, marginBottom: 20, opacity: 0.3, display: 'block' }}>🔍</span>
                  <h2 style={{ fontSize: 20, color: '#333', fontWeight: 700 }}>No Products Found</h2>
                  <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Try adjusting your search or category filters</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryProducts;
