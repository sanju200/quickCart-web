import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getFilteredProducts, Product, getCategoryName } from '../services/product.service';
import { getAllCategories } from '../services/category.service';
import { CartItem } from '../services/cart.service';
import ProductCard from './ProductCard';
import '../styles/common.css';
import '../styles/forms.css';
import '../styles/sidebar.css';
import '../styles/category-products.css';

const CategoryProducts = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount, addToCartOptimistic, updateQtyOptimistic } = useCartCount();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSideCategory, setSelectedSideCategory] = useState(categoryData?.category || 'all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch ] = useState(categoryData?.search || '');
  const { width } = useWindowDimensions();
  
  // numColumns: on very small screens use 1 col so cards are readable
  const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : width > 400 ? 2 : 1;

  useEffect(() => {
    const fetchCats = async () => {
      try {
        if (categoryData?.allCategories && Array.isArray(categoryData.allCategories) && categoryData.allCategories.length > 0) {
          let passedCats = categoryData.allCategories;
          if (!passedCats.find((c: any) => c.id === 'all' || c.category === 'all')) {
            passedCats = [{ id: 'all', title: 'All Products', category: 'all', icon: '🌟' }, ...passedCats];
          }
          setCategories(passedCats);
          setCatLoading(false);
          return;
        }

        const data = await getAllCategories();
        let allCats = data;
        if (!allCats.find((c: any) => c.id === 'all' || c.category === 'all')) {
          allCats = [{ id: 'all', title: 'All', category: 'all', icon: '🌟' }, ...allCats];
        }
        setCategories(allCats);
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
    let filtered = [...allProducts];

    if (selectedSideCategory && selectedSideCategory !== 'all') {
      filtered = filtered.filter(p => {
        const catName = getCategoryName(p).toLowerCase();
        const catId = p.categoryId;
        return catId === selectedSideCategory || 
               catName === selectedSideCategory.toLowerCase();
      });
    }

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
    addToCartOptimistic(product);
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    updateQtyOptimistic(productId, delta);
  };

  return (
    <div className="cp-root">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate('HOME')} className="back-button" aria-label="Go back">
           <span className="back-icon">←</span>
        </button>
        <h1 className="header-title">All Categories</h1>
      </div>

      {/* Body: sidebar + products */}
      <div className="cp-body">

        {/* Sidebar */}
        <aside className="sidebar">
          {catLoading ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <ActivityIndicator size="small" color="#2E7D32" />
            </div>
          ) : (
            <div className="sidebar-list-content">
              {categories.map((item) => {
                const isActive = selectedSideCategory === (item.tag || item.id || item.name);
                const label = item.name || item.title || '';
                return (
                  <button 
                    key={item.id || item.tag || item.name}
                    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                    onClick={() => setSelectedSideCategory(item.tag || item.id || item.name)}
                    data-label={label}
                    title={label}
                  >
                    <div className={`sidebar-icon-box ${isActive ? 'sidebar-icon-box-active' : ''}`}>
                      <span className="sidebar-icon">{item.icon || '📦'}</span>
                    </div>
                    <span className={`sidebar-text ${isActive ? 'sidebar-text-active' : ''}`}>
                      {label}
                    </span>
                    {isActive && <div className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Product grid */}
        <main className="cp-main">
          {loading ? (
            <div className="center-container">
              <ActivityIndicator size="large" color="#2E7D32" />
              <p style={{ marginTop: 15, color: '#666', fontWeight: 600 }}>Loading products...</p>
            </div>
          ) : error ? (
            <div className="center-container">
              <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 20 }}>{error}</p>
              <button className="track-btn" style={{ backgroundColor: '#2E7D32', cursor: 'pointer', border: 'none' }} onClick={handleRetry}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>Retry</span>
              </button>
            </div>
          ) : (
            <div
              className="cp-grid"
              style={{ gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}
            >
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
                <div className="cp-empty" style={{ gridColumn: `1 / span ${numColumns}` }}>
                  <span style={{ fontSize: 56, marginBottom: 16, opacity: 0.3, display: 'block' }}>🔍</span>
                  <h2 style={{ fontSize: 18, color: '#333', fontWeight: 700, margin: '0 0 8px' }}>No Products Found</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Try a different category or clear your search</p>
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
