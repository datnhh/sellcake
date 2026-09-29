import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function ProductDetailModal({ product, initialVariant, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Biến thể đang chọn: ưu tiên initialVariant hoặc defaultVariant (size lớn nhất)
  const [selectedVariant, setSelectedVariant] = useState(
    initialVariant || product?.defaultVariant || product?.variants?.[0] || null
  );

  // Đồng bộ khi đổi sản phẩm hoặc initialVariant
  useEffect(() => {
    setSelectedVariant(
      initialVariant || product?.defaultVariant || product?.variants?.[0] || null
    );
    setQuantity(1);
  }, [product?.id, initialVariant]);

  // Lấy tối đa 10 ảnh, fallback về product.image nếu không có mảng images
  const imageList = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.slice(0, 10);
    }
    return product.image ? [product.image] : [];
  }, [product]);

  // Reset vị trí slide khi đổi bánh
  useEffect(() => {
    setCurrentIndex(0);
    setIsPaused(false);
  }, [product?.id]);

  // Tự động chuyển slide mỗi 3.5s (tự tạm dừng khi rê chuột hoặc chạm tay)
  useEffect(() => {
    if (imageList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % imageList.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [imageList.length, isPaused]);

  // Hỗ trợ phím mũi tên trái/phải để chuyển ảnh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (imageList.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setCurrentIndex(prev => (prev - 1 + imageList.length) % imageList.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex(prev => (prev + 1) % imageList.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageList.length]);

  if (!product) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % imageList.length);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOrigPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  const hasDiscount = Boolean(currentOrigPrice && currentOrigPrice > currentPrice);
  const discountPercent = hasDiscount 
    ? Math.round(((currentOrigPrice - currentPrice) / currentOrigPrice) * 100) 
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant);
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
          {/* Gallery Slider ảnh bánh */}
          <div 
            className="detail-gallery-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="gallery-main-viewport">
              <img 
                key={currentIndex}
                src={imageList[currentIndex]} 
                alt={`${product.name} - góc ảnh ${currentIndex + 1}`} 
                loading="lazy"
                decoding="async"
                className="gallery-main-img"
              />

              {imageList.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="gallery-nav-btn prev" 
                    onClick={handlePrev}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    type="button"
                    className="gallery-nav-btn next" 
                    onClick={handleNext}
                    aria-label="Ảnh kế tiếp"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="gallery-counter-badge">
                    {currentIndex + 1} / {imageList.length}
                  </div>
                </>
              )}
            </div>

            {/* Dải hình thu nhỏ (Thumbnails) */}
            {imageList.length > 1 && (
              <div className="gallery-thumbnails-row">
                {imageList.map((imgUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`gallery-thumb-btn ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Xem ảnh số ${idx + 1}`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${product.name} thumb ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-content">
            <span className="detail-category">{product.category}</span>
            <h2 className="detail-title">{product.name}</h2>
            
            <div className="detail-price-box">
              <span className="detail-price">{formatMoney(currentPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="detail-original-price">{formatMoney(currentOrigPrice)}</span>
                  <span className="detail-discount-badge">Tiết kiệm {discountPercent}%</span>
                </>
              )}
            </div>

            {/* Chọn Size / Biến thể trong modal chi tiết */}
            {product.hasVariants && product.variants && product.variants.length > 1 && (
              <div className="detail-section detail-variants-section">
                <h4>Chọn kích cỡ / phân loại</h4>
                <div className="modal-variant-options">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`modal-variant-btn ${isSelected ? "active" : ""}`}
                        onClick={() => setSelectedVariant(v)}
                      >
                        <div className="modal-variant-info">
                          <span className="modal-variant-name">{v.name}</span>
                          <span className="modal-variant-price">{formatMoney(v.price)}</span>
                        </div>
                        {isSelected && <span className="variant-check-icon">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Mô tả sản phẩm</h4>
              <p>{product.description}</p>
            </div>

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
                  aria-label="Giảm số lượng"
                >
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Tăng số lượng"
                >
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
                    <ShoppingCart size={18} /> Thêm {formatMoney(currentPrice * quantity)}
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
