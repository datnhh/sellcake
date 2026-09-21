import React, { useState } from "react";
import { X, CheckCircle, Loader2, User, Phone, MapPin, MessageSquare } from "lucide-react";
import { formatMoney } from "../config/shopConfig";

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  onSubmitOrder 
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "phone") {
      setPhoneError("");
    }
  };

  const validatePhone = (phone) => {
    const vnPhoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    const cleanPhone = phone.replace(/[\s.-]/g, "");
    return vnPhoneRegex.test(cleanPhone) && cleanPhone.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setPhoneError("Số điện thoại không hợp lệ. Vui lòng nhập số di động 10 số (VD: 0912345678).");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitOrder(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {!isSubmitting && (
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={22} />
          </button>
        )}

        <form className="checkout-form-wrapper" onSubmit={handleSubmit}>
          <div className="checkout-header">
            <span className="eyebrow">XÁC NHẬN ĐẶT BÁNH</span>
            <h2>Thông Tin Giao Hàng</h2>
          </div>

          <div className="checkout-body">
            <div className="checkout-summary-box">
              <div className="summary-title">Đơn hàng của bạn ({totalItems} sản phẩm)</div>
              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item-line">
                    <span>{item.name} × {item.qty}</span>
                    <strong>{formatMoney(item.price * item.qty)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-total-line">
                <span>Tổng thanh toán:</span>
                <strong className="final-price">{formatMoney(total)}</strong>
              </div>
            </div>

            <p className="checkout-notice-text">
              (*) Vui lòng điền thông tin để tiệm liên hệ xác nhận và làm bánh cho bạn.
            </p>

            <div className="checkout-form-fields">
              <div className="form-group">
                <label><User size={15} /> Họ và tên người nhận *</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="form-group">
                <label><Phone size={15} /> Số điện thoại liên hệ *</label>
                <input 
                  type="tel"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                  placeholder="09xx xxx xxx"
                />
                {phoneError && <span className="field-error">{phoneError}</span>}
              </div>

              <div className="form-group">
                <label><MapPin size={15} /> Địa chỉ giao bánh *</label>
                <input 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                  placeholder="Số nhà, tên đường, phường, quận..."
                />
              </div>

              <div className="form-group">
                <label><MessageSquare size={15} /> Ghi chú cho tiệm bánh</label>
                <textarea 
                  name="note" 
                  rows="2" 
                  value={formData.note} 
                  onChange={handleChange} 
                  disabled={isSubmitting}
                  placeholder="Ví dụ: Ghi chữ 'Chúc mừng sinh nhật Mai' lên bánh, chuẩn bị thêm nến số..."
                />
              </div>
            </div>
          </div>

          <div className="checkout-footer">
            <button 
              type="submit" 
              className={`primary-btn submit-order-btn ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Đang ghi nhận đơn hàng lên Google Sheets...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Gửi Đơn Đặt Bánh ({formatMoney(total)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
