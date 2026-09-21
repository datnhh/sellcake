import React, { useState } from "react";
import { X, Plus, Trash2, RotateCcw, Image, Tag, DollarSign, AlignLeft } from "lucide-react";
import { formatMoney } from "../config/shopConfig";
import { CATEGORIES } from "../config/defaultProducts";

export default function AdminProductModal({ 
  isOpen, 
  onClose, 
  products, 
  onAddProduct, 
  onDeleteProduct, 
  onResetProducts 
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Bánh kem",
    customCategory: "",
    price: "",
    originalPrice: "",
    image: "",
    description: "",
    size: "",
    ingredients: ""
  });

  const [activeTab, setActiveTab] = useState("add"); // 'add' hoặc 'list'
  const [msg, setMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Vui lòng điền tên bánh và giá tiền!");
      return;
    }

    const finalCategory = formData.category === "Mới" && formData.customCategory.trim() 
      ? formData.customCategory.trim() 
      : formData.category;

    const originalPriceNum = formData.originalPrice ? Number(formData.originalPrice) : null;

    const newProduct = {
      id: Date.now(),
      name: formData.name.trim(),
      category: finalCategory,
      price: Number(formData.price),
      originalPrice: originalPriceNum && originalPriceNum > Number(formData.price) ? originalPriceNum : null,
      image: formData.image.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
      description: formData.description.trim() || "Bánh thơm ngon được làm thủ công mỗi ngày.",
      size: formData.size.trim() || "Tiêu chuẩn",
      ingredients: formData.ingredients.trim() || "Nguyên liệu tự nhiên, không chất bảo quản.",
      featured: false
    };

    onAddProduct(newProduct);
    setFormData({
      name: "",
      category: "Bánh kem",
      customCategory: "",
      price: "",
      originalPrice: "",
      image: "",
      description: "",
      size: "",
      ingredients: ""
    });
    setMsg("✓ Đã thêm bánh mới thành công!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={22} />
        </button>

        <div className="admin-header">
          <h2>Quản Lý Thực Đơn Bánh</h2>
          <p>Thêm bánh mới hoặc quản lý danh mục bánh hiện tại của tiệm.</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            <Plus size={16} /> Thêm bánh mới
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Danh sách bánh ({products.length})
          </button>
        </div>

        {msg && <div className="admin-success-msg">{msg}</div>}

        {activeTab === "add" ? (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label><Tag size={15} /> Tên bánh *</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="Ví dụ: Bánh Mousse Chanh Leo"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Danh mục</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                >
                  {CATEGORIES.filter(c => c !== "Tất cả").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Mới">+ Thêm danh mục mới</option>
                </select>
              </div>

              {formData.category === "Mới" && (
                <div className="form-group">
                  <label>Tên danh mục mới</label>
                  <input 
                    name="customCategory" 
                    value={formData.customCategory} 
                    onChange={handleChange} 
                    placeholder="Ví dụ: Bánh Mì" 
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><DollarSign size={15} /> Giá bán (VNĐ) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  min="1000"
                  step="1000"
                  placeholder="Ví dụ: 350000"
                />
              </div>

              <div className="form-group">
                <label><DollarSign size={15} /> Giá gốc / niêm yết (gạch ngang)</label>
                <input 
                  type="number" 
                  name="originalPrice" 
                  value={formData.originalPrice} 
                  onChange={handleChange} 
                  min="1000"
                  step="1000"
                  placeholder="Ví dụ: 400000 (không bắt buộc)"
                />
              </div>
            </div>

            <div className="form-group">
              <label><Image size={15} /> Link ảnh bánh (URL hình ảnh)</label>
              <input 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="https://images.unsplash.com/photo-..."
              />
              <small className="help-text">Nếu để trống, hệ thống sẽ sử dụng hình ảnh bánh mặc định.</small>
            </div>

            <div className="form-group">
              <label><AlignLeft size={15} /> Mô tả ngắn</label>
              <textarea 
                name="description" 
                rows="2" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Hương vị, điểm đặc biệt của bánh..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kích thước / Quy cách</label>
                <input 
                  name="size" 
                  value={formData.size} 
                  onChange={handleChange} 
                  placeholder="Ví dụ: Size 16cm (4-6 người)"
                />
              </div>

              <div className="form-group">
                <label>Thành phần chính</label>
                <input 
                  name="ingredients" 
                  value={formData.ingredients} 
                  onChange={handleChange} 
                  placeholder="Ví dụ: Bột mì, kem tươi, hoa quả..."
                />
              </div>
            </div>

            <button type="submit" className="primary-btn submit-btn">
              <Plus size={18} /> Lưu vào thực đơn
            </button>
          </form>
        ) : (
          <div className="admin-product-list">
            <div className="admin-list-actions">
              <span>Đang có {products.length} loại bánh</span>
              <button 
                type="button" 
                className="reset-btn" 
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn khôi phục về danh sách bánh mẫu ban đầu không?")) {
                    onResetProducts();
                  }
                }}
              >
                <RotateCcw size={15} /> Khôi phục bánh mặc định
              </button>
            </div>

            <div className="admin-items-scroll">
              {products.map(p => (
                <div key={p.id} className="admin-item-row">
                  <img src={p.image} alt={p.name} />
                  <div className="admin-item-info">
                    <strong>{p.name}</strong>
                    <span>
                      {p.category} • {formatMoney(p.price)}
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="admin-item-original-price"> (Gốc: {formatMoney(p.originalPrice)})</span>
                      )}
                    </span>
                  </div>
                  <button 
                    className="delete-item-btn" 
                    onClick={() => onDeleteProduct(p.id)}
                    title="Xóa bánh này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
