import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  FileSpreadsheet, 
  Cake, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { formatMoney } from "../config/shopConfig";
import { 
  fetchProductsFromSheet, 
  DEFAULT_SHEET_CSV_URL, 
  DEFAULT_SHEET_EDIT_URL,
  SYNC_TOKEN 
} from "../services/sheetProductService";
import DEFAULT_PRODUCTS_JSON from "../data/products.json";

export default function SyncProductsPage({ onBackToHome, onProductsUpdated }) {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const isAuthorized = token === SYNC_TOKEN;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [syncedProducts, setSyncedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("bakery-products-v2");
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS_JSON;
    } catch {
      return DEFAULT_PRODUCTS_JSON;
    }
  });
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem("bakery-last-sync") || "Chưa đồng bộ lần nào";
  });

  // Tự động chạy đồng bộ ngay khi vào trang nếu token hợp lệ
  useEffect(() => {
    if (isAuthorized) {
      handleSync();
    }
  }, [isAuthorized]);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const products = await fetchProductsFromSheet(DEFAULT_SHEET_CSV_URL);
      
      // Lưu vào LocalStorage
      localStorage.setItem("bakery-products-v2", JSON.stringify(products));
      const nowFormatted = new Date().toLocaleString("vi-VN");
      localStorage.setItem("bakery-last-sync", nowFormatted);

      setSyncedProducts(products);
      setLastSyncTime(nowFormatted);
      setSuccess(true);

      if (onProductsUpdated) {
        onProductsUpdated(products);
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi trong quá trình kéo dữ liệu từ Google Sheets.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tải về file JSON cập nhật để lưu vào code source nếu muốn
  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syncedProducts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "products.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trường hợp KHÔNG CÓ TOKEN hoặc SAI TOKEN
  if (!isAuthorized) {
    return (
      <div className="sync-page-container">
        <div className="sync-card sync-card-unauthorized">
          <div className="sync-icon-circle sync-icon-error">
            <ShieldAlert size={48} />
          </div>
          <h2>403 - Truy Cập Bị Từ Chối</h2>
          <p className="sync-desc">
            Trang đồng bộ sản phẩm này yêu cầu mã xác thực bảo mật bí mật (<code>token</code>).
          </p>
          <div className="sync-unauthorized-box">
            <p>Vui lòng kiểm tra lại liên kết URL của bạn, cần có định dạng:</p>
            <code>/sync-banh?token=YQGkQno8W38QwQU1v9u5Xz4GmP</code>
          </div>
          <button 
            type="button" 
            className="sync-btn sync-btn-secondary" 
            onClick={onBackToHome}
          >
            <ArrowLeft size={18} /> Quay về trang bán bánh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sync-page-container">
      <div className="sync-card">
        {/* Header trang Sync */}
        <div className="sync-header">
          <button 
            type="button" 
            className="sync-back-link" 
            onClick={onBackToHome}
          >
            <ArrowLeft size={18} /> Về trang chủ tiệm bánh
          </button>
          
          <div className="sync-title-group">
            <span className="sync-badge">
              <Sparkles size={14} /> QUẢN TRỊ VIÊN
            </span>
            <h1>Đồng Bộ Sản Phẩm Từ Google Sheet</h1>
            <p className="sync-subtitle">
              Lấy toàn bộ thực đơn bánh mới nhất từ Google Sheets và nạp tức thì lên Website tiệm bánh.
            </p>
          </div>
        </div>

        {/* Trạng thái và Nút hành động */}
        <div className="sync-actions-panel">
          <div className="sync-status-info">
            <div className="sync-meta-item">
              <span className="meta-label">Trạng thái đồng bộ:</span>
              {isLoading ? (
                <span className="meta-value status-loading">
                  <RefreshCw size={14} className="spin" /> Đang tải từ Sheet...
                </span>
              ) : success ? (
                <span className="meta-value status-success">
                  <CheckCircle2 size={14} /> Thành công ({syncedProducts.length} bánh)
                </span>
              ) : error ? (
                <span className="meta-value status-error">
                  <AlertTriangle size={14} /> Có lỗi xảy ra
                </span>
              ) : (
                <span className="meta-value">Sẵn sàng</span>
              )}
            </div>

            <div className="sync-meta-item">
              <span className="meta-label">Lần đồng bộ gần nhất:</span>
              <span className="meta-value text-muted">{lastSyncTime}</span>
            </div>
          </div>

          <div className="sync-button-group">
            <button
              type="button"
              className="sync-btn sync-btn-primary"
              disabled={isLoading}
              onClick={handleSync}
            >
              <RefreshCw size={18} className={isLoading ? "spin" : ""} />
              {isLoading ? "Đang xử lý..." : "Đồng bộ ngay bây giờ"}
            </button>

            <a
              href={DEFAULT_SHEET_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sync-btn sync-btn-outline"
            >
              <FileSpreadsheet size={18} /> Mở file Google Sheet <ExternalLink size={14} />
            </a>

            <button
              type="button"
              className="sync-btn sync-btn-secondary"
              onClick={handleDownloadJson}
              title="Tải về file products.json mới nhất"
            >
              <Download size={18} /> Tải file JSON
            </button>
          </div>
        </div>

        {/* Khối thông báo lỗi (nếu Sheet chưa có dữ liệu hoặc lỗi kết nối) */}
        {error && (
          <div className="sync-alert sync-alert-warning">
            <AlertTriangle size={24} className="alert-icon" />
            <div className="alert-content">
              <h4>Lưu ý khi đồng bộ từ Google Sheet:</h4>
              <p>{error}</p>
              <div className="alert-instructions">
                <strong>👉 Hướng dẫn nhập dữ liệu lần đầu vào Google Sheet:</strong>
                <ol>
                  <li>Mở file Google Sheet của bạn bằng nút <i>"Mở file Google Sheet"</i> ở trên.</li>
                  <li>Trên thanh menu của Google Sheet, chọn: <b>Tệp (File) &gt; Nhập (Import) &gt; Tải lên (Upload)</b>.</li>
                  <li>Chọn tệp <b><code>public/danh_sach_banh.csv</code></b> đã được tạo sẵn trong thư mục dự án này.</li>
                  <li>Sau khi tải lên thành công, quay lại đây bấm nút <b>"Đồng bộ ngay bây giờ"</b>!</li>
                </ol>
                <a 
                  href="/danh_sach_banh.csv" 
                  download="danh_sach_banh.csv"
                  className="sync-download-csv-btn"
                >
                  <Download size={15} /> Tải file danh_sach_banh.csv mẫu về máy
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Khối thông báo thành công */}
        {success && (
          <div className="sync-alert sync-alert-success">
            <CheckCircle2 size={24} className="alert-icon" />
            <div className="alert-content">
              <h4>Đồng bộ thành công!</h4>
              <p>
                Đã nạp thành công <b>{syncedProducts.length}</b> món bánh từ Google Sheet vào hệ thống.
                Khách hàng truy cập website sẽ thấy ngay danh mục bánh mới nhất.
              </p>
            </div>
          </div>
        )}

        {/* Danh sách các sản phẩm sau khi đồng bộ */}
        <div className="sync-preview-section">
          <div className="sync-preview-header">
            <h3>Danh Sách Bánh Hiện Tại ({syncedProducts.length} sản phẩm)</h3>
            <button 
              type="button" 
              className="sync-view-shop-btn"
              onClick={onBackToHome}
            >
              Xem giao diện bán hàng <ChevronRight size={16} />
            </button>
          </div>

          <div className="sync-products-grid">
            {syncedProducts.map((p) => (
              <div key={p.id} className="sync-product-card">
                <div className="sync-card-thumb">
                  <img src={p.image} alt={p.name} />
                  {p.featured && <span className="sync-featured-tag">Nổi bật</span>}
                </div>
                <div className="sync-card-info">
                  <span className="sync-card-cat">{p.category}</span>
                  <h4 className="sync-card-name">{p.name}</h4>
                  <div className="sync-card-pricing">
                    <span className="sync-current-price">{formatMoney(p.price)}</span>
                    {p.originalPrice > p.price && (
                      <span className="sync-old-price">{formatMoney(p.originalPrice)}</span>
                    )}
                  </div>
                  <p className="sync-card-size">📏 {p.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
