import React from "react";
import { Plus, Eye } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function ProductCard({ product, onAddToCart, onOpenDetail }) {
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <article className="product-card">
      <div className="product-card-image" onClick={() => onOpenDetail(product)}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-badge">{product.category}</span>
        {hasDiscount && (
          <span className="product-discount-badge">-{discountPercent}%</span>
        )}
        <button 
          className="quick-view-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(product);
          }}
          title="Xem chi tiết"
        >
          <Eye size={16} /> Xem chi tiết
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-title" onClick={() => onOpenDetail(product)}>
          {product.name}
        </h3>
        <p className="product-desc">{product.description}</p>
        
        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="product-price">
              {formatMoney(product.price)}
            </span>
            {hasDiscount && (
              <span className="product-original-price">
                {formatMoney(product.originalPrice)}
              </span>
            )}
          </div>
          <button 
            className="add-to-cart-btn" 
            onClick={() => onAddToCart(product)}
            title="Thêm nhanh vào giỏ"
          >
            <Plus size={18} />
            <span>Thêm</span>
          </button>
        </div>
      </div>
    </article>
  );
}
