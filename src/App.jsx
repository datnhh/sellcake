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
import SyncProductsPage from "./components/SyncProductsPage";
import { SHOP_CONFIG, formatMoney } from "./config/shopConfig";
import PRODUCTS_DATA from "./data/products.json";
import { sendOrderToGoogleSheet } from "./services/orderApi";

// Chuẩn hóa sản phẩm: đảm bảo variants được sắp xếp tăng dần và defaultVariant là size nhỏ nhất
function normalizeProductsToSmallestVariant(items) {
  if (!Array.isArray(items)) return items;
  return items.map(product => {
    if (!product.variants || product.variants.length === 0) return product;
    const variants = [...product.variants].sort((a, b) => a.price - b.price);
    const minPrice = Math.min(...variants.map(v => v.price));
    const maxPrice = Math.max(...variants.map(v => v.price));
    const defaultVariant = variants.find(v => v.price === minPrice) || variants[0];
    return {
      ...product,
      variants,
      minPrice,
      maxPrice,
      price: defaultVariant.price,
      originalPrice: defaultVariant.originalPrice,
      hasVariants: variants.length > 1,
      defaultVariant
    };
  });
}

export default function App() {
  // Quản lý route hiển thị (trang chủ hoặc trang đồng bộ /sync-banh)
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes("/sync-banh") || search.includes("sync-banh")) {
      return "sync";
    }
    return "home";
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.includes("/sync-banh") || search.includes("sync-banh")) {
        setCurrentRoute("sync");
      } else {
        setCurrentRoute("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // Quản lý danh sách sản phẩm (đọc từ cache LocalStorage hoặc file products.json, ưu tiên size nhỏ nhất)
  const [products, setProducts] = useState(() => {
    try {
      const savedV6 = localStorage.getItem("bakery-products-v6");
      if (savedV6) {
        return normalizeProductsToSmallestVariant(JSON.parse(savedV6));
      }
      // Dọn dẹp cache cũ v4, v5 để nạp danh mục ảnh mới chuẩn từ products.json
      localStorage.removeItem("bakery-products-v5");
      localStorage.removeItem("bakery-products-v4");
      const initial = normalizeProductsToSmallestVariant(PRODUCTS_DATA);
      localStorage.setItem("bakery-products-v6", JSON.stringify(initial));
      return initial;
    } catch {
      return normalizeProductsToSmallestVariant(PRODUCTS_DATA);
    }
  });

  // Quản lý giỏ hàng
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("bakery-cart-v3");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bộ lọc danh mục
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // State các modal
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailInitialVariant, setDetailInitialVariant] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Hỗ trợ mở modal quản lý bánh khi cần test ở local (truy cập ?admin=true)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("admin") === "true") {
      setIsAdminOpen(true);
    }
  }, []);

  // Lưu sản phẩm vào localStorage khi có thay đổi (v6)
  useEffect(() => {
    try {
      localStorage.setItem("bakery-products-v6", JSON.stringify(products));
    } catch (e) {
      console.error("Không thể lưu sản phẩm vào localStorage:", e);
    }
  }, [products]);

  // Lưu giỏ hàng vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("bakery-cart-v3", JSON.stringify(cart));
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

  // Mở modal chi tiết bánh (mặc định mở với size nhỏ nhất)
  const handleOpenDetail = (product, variant = null) => {
    setDetailProduct(product);
    const smallestVariant = product?.variants && product.variants.length > 0
      ? [...product.variants].sort((a, b) => a.price - b.price)[0]
      : null;
    setDetailInitialVariant(variant || product?.defaultVariant || smallestVariant || null);
  };

  // Hàm thêm vào giỏ hàng (Mặc định chọn Size nhỏ nhất nếu không chỉ định)
  const handleAddToCart = (product, quantity = 1, variant = null) => {
    const smallestVariant = product?.variants && product.variants.length > 0
      ? [...product.variants].sort((a, b) => a.price - b.price)[0]
      : null;
    const selectedVariant = variant || product?.defaultVariant || smallestVariant || {
      id: `${product.id}_def`,
      name: "Size tiêu chuẩn",
      price: product.price,
      originalPrice: product.originalPrice
    };

    const cartItemId = `${product.id}_${selectedVariant.id || selectedVariant.name}`;

    setCart(prev => {
      const foundIdx = prev.findIndex(item => item.cartItemId === cartItemId || item.id === cartItemId);
      if (foundIdx !== -1) {
        return prev.map((item, idx) =>
          idx === foundIdx ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: selectedVariant.price,
          originalPrice: selectedVariant.originalPrice,
          selectedVariant,
          variants: product.variants || [selectedVariant],
          qty: quantity
        }
      ];
    });

    setToast(`✓ Đã thêm ${quantity} bánh "${product.name} (${selectedVariant.name})" vào giỏ hàng!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm thay đổi số lượng trong giỏ
  const handleChangeQty = (cartItemId, delta) => {
    setCart(prev =>
      prev
        .map(item => (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  };

  // Hàm xóa món khỏi giỏ
  const handleRemoveItem = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId));
  };

  // Hàm chỉnh sửa lại size bánh ngay trong giỏ hàng
  const handleChangeVariant = (cartItemId, newVariant) => {
    setCart(prev => {
      const currentItem = prev.find(item => item.cartItemId === cartItemId || item.id === cartItemId);
      if (!currentItem) return prev;

      const newCartItemId = `${currentItem.productId || currentItem.id}_${newVariant.id || newVariant.name}`;

      // Nếu chọn lại chính variant hiện tại thì bỏ qua
      if (currentItem.cartItemId === newCartItemId) return prev;

      const existingItem = prev.find(item => item.cartItemId === newCartItemId);
      if (existingItem) {
        // Nếu size mới đã có trong giỏ -> gộp số lượng và xóa dòng cũ
        return prev
          .filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId)
          .map(item => item.cartItemId === newCartItemId ? { ...item, qty: item.qty + currentItem.qty } : item);
      }

      // Chưa có -> Cập nhật sang biến thể mới
      return prev.map(item => {
        if (item.cartItemId === cartItemId || item.id === cartItemId) {
          return {
            ...item,
            cartItemId: newCartItemId,
            selectedVariant: newVariant,
            price: newVariant.price,
            originalPrice: newVariant.originalPrice
          };
        }
        return item;
      });
    });

    setToast(`✓ Đã đổi sang ${newVariant.name}`);
    setTimeout(() => setToast(null), 2500);
  };

  // Hàm thêm bánh mới (dành cho chủ shop)
  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  // Hàm xóa bánh (dành cho chủ shop)
  const handleDeleteProduct = (productId) => {
    if (confirm("Bạn có chắc muốn xóa loại bánh này khỏi thực đơn?")) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCart(prev => prev.filter(p => p.productId !== productId && p.id !== productId));
    }
  };

  // Khôi phục danh sách bánh mẫu ban đầu
  const handleResetProducts = () => {
    const defaultItems = normalizeProductsToSmallestVariant(PRODUCTS_DATA);
    setProducts(defaultItems);
    localStorage.removeItem("bakery-products-v6");
    localStorage.removeItem("bakery-products-v5");
    localStorage.removeItem("bakery-products-v4");
    setToast("✓ Đã khôi phục thực đơn bánh mặc định!");
    setTimeout(() => setToast(null), 3000);
  };

  // Mở checkout từ giỏ hàng
  const handleProceedCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Xử lý gửi đơn hàng lên Google Sheets & Telegram
  const handleSubmitOrder = async (customerData) => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderLines = cart
      .map(item => {
        const sizeBadge = item.selectedVariant?.name ? ` [${item.selectedVariant.name}]` : "";
        return `${item.name}${sizeBadge} (x${item.qty}) - ${formatMoney(item.price * item.qty)}`;
      })
      .join("\n");

    const orderPayload = {
      orderId: "DH-" + Math.floor(100000 + Math.random() * 900000),
      customerName: customerData.name,
      customerPhone: customerData.phone,
      customerAddress: customerData.address,
      receiveDate: customerData.receiveDate || "Giao sớm nhất",
      receiveTime: customerData.receiveTime || "Trong ngày",
      orderItems: orderLines,
      totalPrice: formatMoney(totalAmount),
      note: customerData.note || "Không có"
    };

    try {
      const response = await sendOrderToGoogleSheet(orderPayload, SHOP_CONFIG.googleSheetUrl);

      setCart([]);
      setIsCheckoutOpen(false);

      if (response.isDemo) {
        setToast("✓ [Chế độ Demo] Đơn hàng đã được ghi nhận vào Console! Hãy cấu hình Sheet URL để lưu tự động.");
      } else {
        setToast("✓ Đã ghi nhận đơn hàng thành công! Tiệm sẽ liên hệ với bạn trong ít phút.");
      }

      setTimeout(() => setToast(null), 6000);
    } catch (error) {
      alert(error.message || "Gửi đơn hàng thất bại. Vui lòng kiểm tra lại liên kết Sheets.");
    }
  };

  // Render trang đồng bộ sản phẩm từ Google Sheet nếu truy cập /sync-banh
  if (currentRoute === "sync") {
    return (
      <SyncProductsPage
        onBackToHome={handleBackToHome}
        onProductsUpdated={(newProducts) => setProducts(newProducts)}
      />
    );
  }

  return (
    <div className="bakery-app">
      {/* Header */}
      <Header
        shopName={SHOP_CONFIG.shopName}
        totalItems={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        {/* Banner giới thiệu */}
        <Hero
          featuredProduct={featuredProduct}
          onSelectProduct={handleOpenDetail}
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
                onAddToCart={handleAddToCart}
                onOpenDetail={handleOpenDetail}
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
          <img src="/logo.png" alt={SHOP_CONFIG.shopName} className="footer-logo" />
          <p>© {new Date().getFullYear()} {SHOP_CONFIG.shopName}. Bánh thủ công nướng mới mỗi ngày.</p>
          <small>Website giới thiệu và nhận đặt bánh hoàn toàn miễn phí do tiệm tự quản lý.</small>
        </div>
      </footer>

      {/* Modal Chi Tiết Bánh */}
      {detailProduct && (
        <ProductDetailModal
          key={detailProduct.id}
          product={detailProduct}
          initialVariant={detailInitialVariant}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

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
        onChangeVariant={handleChangeVariant}
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
