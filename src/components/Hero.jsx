import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function Hero({ featuredProduct, onSelectProduct }) {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>BÁNH THỦ CÔNG • NƯỚNG MỖI NGÀY</span>
        </div>
        <h1>
          Hương vị ngọt ngào cho <em>những dịp đặc biệt.</em>
        </h1>
        <p className="hero-text">
          Từng chiếc bánh được làm bằng tất cả sự tỉ mỉ từ nguyên liệu tươi ngon nhất, sẵn sàng cùng bạn tạo nên những khoảnh khắc đáng nhớ bên người thân yêu.
        </p>
        <div className="hero-cta">
          <a className="primary-btn" href="#products">
            Khám phá thực đơn <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {featuredProduct && (
        <div className="hero-featured" onClick={() => onSelectProduct(featuredProduct)}>
          <div className="hero-card">
            <span className="featured-badge">Bán chạy nhất</span>
            <img src={featuredProduct.image} alt={featuredProduct.name} loading="lazy" />
            <div className="hero-card-info">
              <div>
                <strong>{featuredProduct.name}</strong>
                <p>{featuredProduct.category}</p>
              </div>
              <div className="hero-price-box">
                <span className="price">{formatMoney(featuredProduct.price)}</span>
                {featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price && (
                  <span className="hero-original-price">{formatMoney(featuredProduct.originalPrice)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
