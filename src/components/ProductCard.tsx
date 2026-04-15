import React from 'react';
import { Product, getCategoryName } from '../services/product.service';
import '../styles/common.css';
import '../styles/components.css';

interface ProductCardProps {
  item: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onUpdateQuantity: (productId: string, currentQty: number, delta: number) => void;
  numColumns: number;
}

/** Returns a display-friendly weight string. Falls back to "1 Unit" if missing. */
const formatWeight = (weight?: string): string => {
  if (!weight || weight.trim() === '' || weight === 'undefined' || weight === 'null') {
    return '1 Unit';
  }
  return weight;
};

const ProductCard: React.FC<ProductCardProps> = ({ item, quantity, onAdd, onUpdateQuantity, numColumns }) => {
  return (
    <div className="product-card">
      {/* Category badge — top-left corner of card */}
      <span className="float-category">{getCategoryName(item)}</span>

      {/* Product image */}
      <div className="product-image-container">
        <img 
          src={item.image || 'https://via.placeholder.com/150'} 
          className="product-image"
          alt={item.name}
          loading="lazy"
        />
      </div>
      
      {/* Product info */}
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <span className="product-weight">{formatWeight(item.weight)}</span>
        
        <div className="price-row">
          <span className="product-price">₹{item.price}</span>

          {quantity > 0 ? (
            <div className="quantity-control">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantity, -1); }} 
                className="qty-btn"
                aria-label="Decrease quantity"
              >
                <span className="qty-btn-text">−</span >
              </button>
              <span className="qty-text">{quantity}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantity, 1); }} 
                className="qty-btn"
                aria-label="Increase quantity"
              >
                <span className="qty-btn-text">+</span >
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onAdd(item); }} 
              className="add-button"
              aria-label="Add to cart"
            >
              <span className="add-text">ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



export default ProductCard;
