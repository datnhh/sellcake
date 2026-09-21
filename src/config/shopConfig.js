export const SHOP_CONFIG = {
  shopName: import.meta.env.VITE_SHOP_NAME || "Tiệm Bếp bà Vưn",
  phone: import.meta.env.VITE_SHOP_PHONE || "0937658834",
  email: import.meta.env.VITE_SHOP_EMAIL || "thanhvannt1911@gmail.com",
  address: import.meta.env.VITE_SHOP_ADDRESS || "125 Đồng Văn Cống, Cát Lái, TP. Hồ Chí Minh",
  hours: import.meta.env.VITE_SHOP_HOURS || "08:00 - 20:00 (Hàng ngày)",
  googleSheetUrl: import.meta.env.VITE_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbzYbhwRWdtuYbjDrLiH1skG2V-oO4VpsmmATFnNCZgCdE2wWLEnbSHXIrZ36vYn5x7y/exec"
};

export const formatMoney = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
