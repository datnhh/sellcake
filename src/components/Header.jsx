import React from "react";
import { CakeSlice, ShoppingCart, Settings } from "lucide-react";

export default function Header({ shopName, totalItems, onOpenCart, onOpenAdmin }) {
  return (
    <header className="header">
      <a href="#home" className="brand">
        <div className="brand-icon">
          <CakeSlice size={24} />
        </div>
        <span>{shopName}</span>
      </a>

      <nav className="header-nav">
        <a href="#home">Trang chủ</a>
        <a href="#products">Thực đơn</a>
        <a href="#promise">Cam kết</a>
        <a href="#contact">Liên hệ</a>
      </nav>

      <div className="header-actions">
        <button 
          className="admin-btn" 
          onClick={onOpenAdmin} 
          title="Quản lý thực đơn (Thêm/Sửa bánh)"
        >
          <Settings size={18} />
          <span className="hide-on-mobile">Quản lý bánh</span>
        </button>

        <button 
          className="cart-button" 
          onClick={onOpenCart}
          aria-label="Mở giỏ hàng"
        >
          <ShoppingCart size={20} />
          <span className="cart-text hide-on-mobile">Giỏ hàng</span>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
}
