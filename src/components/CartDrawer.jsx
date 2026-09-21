import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onChangeQty, 
  onRemoveItem, 
  onProceedCheckout 
}) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={22} />
            <h2>Giỏ hàng của bạn</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🍰</div>
            <p>Giỏ hàng của bạn đang trống.</p>
            <button className="primary-btn" onClick={onClose}>
              Xem các loại bánh
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-price">{formatMoney(item.price)}</span>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => onChangeQty(item.id, -1)}
                          aria-label="Giảm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-number">{item.qty}</span>
                        <button 
                          onClick={() => onChangeQty(item.id, 1)}
                          aria-label="Tăng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        className="remove-item-btn" 
                        onClick={() => onRemoveItem(item.id)}
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <div className="cart-subtotal">
                <span>Tổng thanh toán</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <button 
                className="primary-btn checkout-btn" 
                onClick={onProceedCheckout}
              >
                Tiến hành đặt bánh <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
