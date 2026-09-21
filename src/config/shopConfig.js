export const SHOP_CONFIG = {
  shopName: import.meta.env.VITE_SHOP_NAME || "Tiệm Bánh Nhà Mình",
  phone: import.meta.env.VITE_SHOP_PHONE || "0900 000 000",
  email: import.meta.env.VITE_SHOP_EMAIL || "tiembanh@example.com",
  address: import.meta.env.VITE_SHOP_ADDRESS || "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
  hours: import.meta.env.VITE_SHOP_HOURS || "08:00 - 20:00 (Hàng ngày)",
  googleSheetUrl: import.meta.env.VITE_GOOGLE_SHEET_URL || ""
};

export const formatMoney = (n) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
