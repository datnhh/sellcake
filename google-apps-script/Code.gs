/**
 * Google Apps Script - Web App nhận đơn hàng tự động từ Web Bán Bánh
 * 
 * Hướng dẫn thiết lập:
 * 1. Mở Google Sheets (https://sheets.new) để tạo 1 bảng tính mới.
 * 2. Đặt tên bảng tính: "Quản Lý Đơn Hàng Bánh".
 * 3. Trên menu chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết code cũ trong file Code.gs và dán toàn bộ đoạn code này vào.
 * 5. Bấm icon "Lưu dự án" (Save - phím tắt Ctrl+S).
 * 6. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> chọn "Tùy chọn triển khai mới" (New deployment).
 * 7. Chọn loại triển khai: "Ứng dụng web" (Web app).
 *    - Mô tả: "API nhận đơn hàng"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG!
 * 8. Bấm "Triển khai" (Deploy) -> Cấp quyền cho script nếu được hỏi.
 * 9. Sao chép "URL ứng dụng web" (Web App URL) và dán vào file .env (biến VITE_GOOGLE_SHEET_URL) của website.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa script tối đa 10s để tránh xung đột khi có nhiều đơn cùng lúc

  try {
    var sheetName = "Đơn Hàng";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Tiêu đề các cột nếu bảng tính đang trống
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Thời Gian Đặt",
        "Mã Đơn",
        "Tên Khách Hàng",
        "Số Điện Thoại",
        "Địa Chỉ Nhận",
        "Ngày Nhận",
        "Giờ Nhận",
        "Chi Tiết Bánh Đặt",
        "Tổng Tiền",
        "Ghi Chú",
        "Trạng Thái"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f4e5da");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error("Không tìm thấy dữ liệu đơn hàng");
    }

    var now = new Date();
    var timeFormatted = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");

    var row = [
      timeFormatted,
      data.orderId || ("DH-" + Math.floor(100000 + Math.random() * 900000)),
      data.customerName || "",
      data.customerPhone || "",
      data.customerAddress || "",
      data.receiveDate || "Không chỉ định",
      data.receiveTime || "Không chỉ định",
      data.orderItems || "",
      data.totalPrice || "",
      data.note || "Không có",
      "Mới đặt"
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu đơn hàng thành công" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Google Apps Script Web App đang hoạt động bình thường!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
