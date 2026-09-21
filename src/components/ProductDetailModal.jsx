import React, { useState } from "react";
import { X, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={22} />
        </button>

        <div className="detail-grid">
          <div className="detail-image-container">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="detail-content">
            <span className="detail-category">{product.category}</span>
            <h2 className="detail-title">{product.name}</h2>
            <div className="detail-price-box">
              <span className="detail-price">{formatMoney(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="detail-original-price">{formatMoney(product.originalPrice)}</span>
                  <span className="detail-discount-badge">Tiết kiệm {discountPercent}%</span>
                </>
              )}
            </div>

            <div className="detail-section">
              <h4>Mô tả sản phẩm</h4>
              <p>{product.description}</p>
            </div>

            {product.size && (
              <div className="detail-section">
                <h4>Kích thước / Quy cách</h4>
                <p className="detail-highlight">{product.size}</p>
              </div>
            )}

            {product.ingredients && (
              <div className="detail-section">
                <h4>Nguyên liệu chính</h4>
                <p>{product.ingredients}</p>
              </div>
            )}

            <div className="detail-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>
                  <Plus size={16} />
                </button>
              </div>

              <button 
                className={`primary-btn add-btn ${added ? "success" : ""}`} 
                onClick={handleAdd}
                disabled={added}
              >
                {added ? (
                  <>
                    <Check size={18} /> Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Thêm {formatMoney(product.price * quantity)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
