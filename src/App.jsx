import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import AdminProductModal from "./components/AdminProductModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import PromiseSection from "./components/PromiseSection";
import ContactSection from "./components/ContactSection";
import { SHOP_CONFIG, formatMoney } from "./config/shopConfig";
import { DEFAULT_PRODUCTS } from "./config/defaultProducts";
import { sendOrderToGoogleSheet } from "./services/orderApi";

export default function App() {
  // Quản lý danh sách sản phẩm (có hỗ trợ lưu LocalStorage khi chủ tiệm thêm/sửa)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("bakery-products-v2");
      if (!saved) return DEFAULT_PRODUCTS;
      const parsed = JSON.parse(saved);
      // Tự động đồng bộ originalPrice từ danh mục mẫu nếu trong cache trình duyệt chưa có
      return parsed.map(item => {
        const defaultItem = DEFAULT_PRODUCTS.find(d => d.id === item.id);
        return {
          ...item,
          originalPrice: item.originalPrice !== undefined ? item.originalPrice : defaultItem?.originalPrice
        };
      });
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  // Quản lý giỏ hàng
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("bakery-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bộ lọc danh mục
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // State các modal
  const [detailProduct, setDetailProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Lưu sản phẩm vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("bakery-products-v2", JSON.stringify(products));
    } catch (e) {
      console.error("Không thể lưu sản phẩm vào localStorage:", e);
    }
  }, [products]);

  // Lưu giỏ hàng vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("bakery-cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Không thể lưu giỏ hàng vào localStorage:", e);
    }
  }, [cart]);

  // Danh sách danh mục động dựa trên các sản phẩm đang có
  const categories = useMemo(() => {
    const list = ["Tất cả", ...new Set(products.map(p => p.category))];
    return list;
  }, [products]);

  // Danh sách sản phẩm sau lọc
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tất cả") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const featuredProduct = useMemo(() => {
    return products.find(p => p.featured) || products[0];
  }, [products]);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });

    setToast(`✓ Đã thêm ${quantity} bánh "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm thay đổi số lượng trong giỏ
  const handleChangeQty = (productId, delta) => {
    setCart(prev => 
      prev
        .map(item => item.id === productId ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  };

  // Hàm xóa món khỏi giỏ
  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Hàm thêm bánh mới (dành cho chủ shop)
  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  // Hàm xóa bánh (dành cho chủ shop)
  const handleDeleteProduct = (productId) => {
    if (confirm("Bạn có chắc muốn xóa loại bánh này khỏi thực đơn?")) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCart(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Khôi phục danh sách bánh mẫu ban đầu
  const handleResetProducts = () => {
    setProducts(DEFAULT_PRODUCTS);
    localStorage.removeItem("bakery-products-v2");
    setToast("✓ Đã khôi phục thực đơn bánh mặc định!");
    setTimeout(() => setToast(null), 3000);
  };

  // Mở checkout từ giỏ hàng
  const handleProceedCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Xử lý gửi đơn hàng lên Google Sheets
  const handleSubmitOrder = async (customerData) => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderLines = cart
      .map(item => `${item.name} (x${item.qty}) - ${formatMoney(item.price * item.qty)}`)
      .join("\n");

    const orderPayload = {
      orderId: "DH-" + Math.floor(100000 + Math.random() * 900000),
      customerName: customerData.name,
      customerPhone: customerData.phone,
      customerAddress: customerData.address,
      receiveDate: customerData.receiveDate,
      receiveTime: customerData.receiveTime || "Trong giờ mở cửa",
      orderItems: orderLines,
      totalPrice: formatMoney(totalAmount),
      note: customerData.note || "Không có"
    };

    try {
      const response = await sendOrderToGoogleSheet(orderPayload, SHOP_CONFIG.googleSheetUrl);
      
      setCart([]);
      setIsCheckoutOpen(false);

      if (response.isDemo) {
        setToast("✓ [Chế độ Demo] Đơn hàng đã được ghi nhận vào Console! Hãy cấu hình Google Sheet URL để lưu tự động.");
      } else {
        setToast("✓ Đã lưu đơn hàng lên Google Sheets thành công! Tiệm sẽ liên hệ với bạn trong ít phút.");
      }

      setTimeout(() => setToast(null), 6000);
    } catch (error) {
      alert(error.message || "Gửi đơn hàng thất bại. Vui lòng kiểm tra lại liên kết Google Sheets.");
    }
  };

  return (
    <div className="bakery-app">
      {/* Header */}
      <Header 
        shopName={SHOP_CONFIG.shopName}
        totalItems={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main>
        {/* Banner giới thiệu */}
        <Hero 
          featuredProduct={featuredProduct}
          onSelectProduct={setDetailProduct}
        />

        {/* Danh mục và Sản phẩm */}
        <section id="products" className="products-section">
          <div className="products-section-header">
            <div>
              <span className="eyebrow">THỰC ĐƠN HÔM NAY</span>
              <h2>Các Loại Bánh Tươi</h2>
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onOpenDetail={setDetailProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-category">
              <p>Chưa có loại bánh nào trong danh mục này.</p>
            </div>
          )}
        </section>

        {/* Cam kết của tiệm */}
        <PromiseSection />

        {/* Liên hệ & Giờ mở cửa */}
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} {SHOP_CONFIG.shopName}. Bánh thủ công nướng mới mỗi ngày.</p>
          <small>Hệ thống nhận đơn hàng tự động liên kết Google Sheets (100% Free Hosting & Database).</small>
        </div>
      </footer>

      {/* Modal Chi Tiết Bánh */}
      <ProductDetailModal 
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Modal Quản Lý Bánh (Chủ shop) */}
      <AdminProductModal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
      />

      {/* Drawer Giỏ Hàng */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onChangeQty={handleChangeQty}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* Modal Đặt Hàng */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Thông báo Toast */}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  );
}
