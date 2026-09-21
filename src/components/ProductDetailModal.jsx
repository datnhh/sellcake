import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
