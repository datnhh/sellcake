# Tiệm Bánh Nhà Mình (Bakery Shop) 🍰

Trang web bán bánh ngọt thủ công cá nhân, hoạt động **100% MIỄN PHÍ** (Free Hosting + Free Database lưu đơn hàng tự động vào Google Sheets).

---

## 🌟 Tính Năng Nổi Bật

* **Giao diện cao cấp, ấm cúng:** Chuẩn phong cách tiệm bánh ngọt châu Âu, hiển thị tối ưu trên cả điện thoại di động và máy tính.
* **Thực đơn linh hoạt:** Phân loại theo danh mục (Bánh kem, Bánh lạnh, Bánh nhỏ...), xem chi tiết ảnh to, thành phần và quy cách kích thước bánh.
* **Tự quản lý thực đơn trực tiếp:** Có nút **"Quản lý bánh"** trên thanh header cho phép chủ tiệm tự thêm bánh mới, đặt giá, dán link ảnh mà không cần can thiệp vào mã nguồn.
* **Giỏ hàng tiện lợi:** Lưu giỏ hàng trong trình duyệt (`localStorage`), hỗ trợ tăng giảm số lượng, xóa món.
* **Đặt hàng chống spam:**
  * Validate chuẩn số điện thoại di động 10 số của Việt Nam.
  * Chặn chọn ngày giao bánh trong quá khứ.
  * Nút đặt hàng có hiệu ứng xoay (Loading Spinner) và vô hiệu hóa chống bấm gửi nhiều lần.
* **Lưu đơn tự động vào Google Sheets:** Không tốn phí database, không lo giới hạn gửi email. Mỗi khi khách đặt bánh, một dòng đơn hàng mới sẽ lập tức xuất hiện trên Google Sheet của bạn.

---

## 🚀 1. Chạy Dự Án Trên Máy Local

```bash
# 1. Cài đặt các gói thư viện
npm install

# 2. Khởi chạy server phát triển
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 📊 2. Hướng Dẫn Kết Nối Google Sheets Nhận Đơn (Chỉ mất 2 phút)

Dữ liệu đơn hàng sẽ được gửi thẳng vào Google Sheet của bạn thông qua Google Apps Script Web App hoàn toàn miễn phí.

### Bước 1: Tạo Google Sheet mới
1. Truy cập [sheets.new](https://sheets.new) để mở một bảng tính Google mới.
2. Đặt tên bảng tính: **"Quản Lý Đơn Hàng Bánh"**.

### Bước 2: Dán mã Google Apps Script
1. Trên menu trên cùng của Google Sheet, bấm vào: **Tiện ích mở rộng** (Extensions) ➔ **Apps Script**.
2. Xóa toàn bộ mã mặc định có sẵn trong file `Code.gs`.
3. Mở file [google-apps-script/Code.gs](file:///d:/WORKSPACE/AI/sellcake/google-apps-script/Code.gs) trong dự án này, copy toàn bộ nội dung và dán vào.
4. Bấm biểu tượng **Lưu dự án** (Save hoặc phím tắt `Ctrl + S`).

### Bước 3: Triển khai Web App (Lấy URL nhận đơn)
1. Bấm nút **Triển khai** (Deploy) màu xanh ở góc trên bên phải ➔ Chọn **Tùy chọn triển khai mới** (New deployment).
2. Bấm vào biểu tượng bánh răng (Chọn loại) ➔ Chọn **Ứng dụng web** (Web app).
3. Thiết lập thông số như sau:
   * **Mô tả:** Nhận đơn đặt bánh
   * **Thực thi dưới dạng (Execute as):** `Tôi` (Me)
   * **Ai có quyền truy cập (Who has access):** `Bất kỳ ai` (Anyone) *(Lưu ý: Bắt buộc chọn "Bất kỳ ai" để web tĩnh có thể gửi đơn vào Sheet)*.
4. Bấm nút **Triển khai** (Deploy) ➔ Cấp quyền truy cập Google Account của bạn nếu được hỏi.
5. Sao chép dòng **URL ứng dụng web** (Web App URL) có định dạng:
   `https://script.google.com/macros/s/.../exec`

### Bước 4: Cấu hình URL vào Website
Mở file `.env` trong thư mục gốc và dán URL vừa lấy được vào:

```env
VITE_GOOGLE_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> **Lưu ý:** Nếu bạn chưa điền URL này, hệ thống sẽ tự động chạy ở **chế độ Demo** (vẫn cho phép đặt hàng và in dữ liệu đơn hàng ra Console của trình duyệt để kiểm tra mà không bị lỗi).

---

## 🛠️ 3. Tùy Chỉnh Thông Tin Cửa Hàng

Mở file `.env` để sửa các thông tin hiển thị của tiệm bánh:

```env
VITE_SHOP_NAME=Tiệm Bánh Nhà Mình
VITE_SHOP_PHONE=0900 000 000
VITE_SHOP_EMAIL=tiembanh@example.com
VITE_SHOP_ADDRESS=123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh
VITE_SHOP_HOURS=08:00 - 20:00 (Hàng ngày)
```

---

## ☁️ 4. Hướng Dẫn Deploy Lên Cloudflare Pages (Miễn Phí 100% Trọn Đời)

Cloudflare Pages là nền tảng tối ưu nhất cho web tĩnh tại Việt Nam: băng thông không giới hạn, bảo mật cao và tốc độ tải trang cực nhanh.

1. Đẩy mã nguồn lên kho chứa GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: website bán bánh cá nhân lưu đơn google sheets"
   git push origin main
   ```
2. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ Vào mục **Workers & Pages** ➔ Bấm **Create application** ➔ Tab **Pages** ➔ **Connect to Git**.
3. Chọn Repository `sellcake`.
4. Điền cấu hình build:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Vào mục **Environment variables** (Biến môi trường) và thêm biến:
   * Key: `VITE_GOOGLE_SHEET_URL`
   * Value: `<URL Web App Google Apps Script của bạn>`
6. Bấm **Save and Deploy**. Sau 1 phút, website của bạn sẽ hoạt động chính thức trên tên miền miễn phí dạng `*.pages.dev`!
