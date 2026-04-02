import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
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

const ProductCard: React.FC<ProductCardProps> = ({ item, quantity, onAdd, onUpdateQuantity, numColumns }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={item.image || 'https://via.placeholder.com/150'} 
          className="product-image"
          alt={item.name}
          loading="lazy"
        />
        <span className="float-category">{getCategoryName(item)}</span>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <span className="product-weight">{item.weight}</span>
        
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
