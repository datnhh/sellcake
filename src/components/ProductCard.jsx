import React, { useState, useEffect } from "react";
import { Plus, Eye, Check } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

// Lấy biến thể có giá thấp nhất (size nhỏ nhất)
function getSmallestVariant(p) {
  if (!p) return null;
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    return [...p.variants].sort((a, b) => a.price - b.price)[0];
  }
  return p.defaultVariant || null;
}

export default function ProductCard({ product, onAddToCart, onOpenDetail }) {
  // Mặc định chọn Size nhỏ nhất (hoặc biến thể có giá thấp nhất)
  const [selectedVariant, setSelectedVariant] = useState(() => getSmallestVariant(product));
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setSelectedVariant(getSmallestVariant(product));
  }, [product]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOrigPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  const hasDiscount = Boolean(currentOrigPrice && currentOrigPrice > currentPrice);
  const discountPercent = hasDiscount
    ? Math.round(((currentOrigPrice - currentPrice) / currentOrigPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product, 1, selectedVariant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <div className="product-card-image" onClick={() => onOpenDetail(product, selectedVariant)}>
        <img
          src={product.image}
          alt={`${product.name} - Bếp Bà Vưn`}
          loading="lazy"
        />
        <span className="product-badge">{product.category}</span>
        {hasDiscount && (
          <span className="product-discount-badge">-{discountPercent}%</span>
        )}
        <button
          className="quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(product, selectedVariant);
          }}
          title="Xem chi tiết"
        >
          <Eye size={16} /> Xem chi tiết
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-title" onClick={() => onOpenDetail(product, selectedVariant)}>
          {product.name}
        </h3>
        <p className="product-desc">{product.description}</p>

        {/* Khối chọn kích cỡ / biến thể ngay trên box */}
        {product.hasVariants && product.variants && product.variants.length > 1 && (
          <div className="product-card-variants">
            <div className="variants-header">
              <span className="variant-label">Chọn size:</span>
            </div>
            <div className="variant-chips-grid">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`variant-chip-btn ${isSelected ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    title={`${v.name} - ${formatMoney(v.price)}`}
                  >
                    <span className="chip-name">{v.name}</span>
                    <span className="chip-price">{formatMoney(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-price-box">
            <div className="product-price-row">
              <span className="product-price">
                {formatMoney(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="product-original-price">
                  {formatMoney(currentOrigPrice)}
                </span>
              )}
            </div>
            {product.hasVariants && (
              <span className="product-size-hint">
                {selectedVariant?.name || "Size tiêu chuẩn"}
              </span>
            )}
          </div>

          <button
            className={`add-to-cart-btn ${justAdded ? "added" : ""}`}
            onClick={handleQuickAdd}
            title={`Thêm ${selectedVariant?.name || ""} vào giỏ`}
          >
            {justAdded ? (
              <>
                <Check size={18} />
                <span>Đã thêm</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Thêm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
