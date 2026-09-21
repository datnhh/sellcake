/**
 * Google Apps Script - Web App nhận đơn hàng tự động từ Web Bán Bánh
 * TÍCH HỢP: Lưu đơn vào Google Sheets + Bắn tin nhắn thông báo tức thì qua Telegram Bot!
 * 
 * ==============================================================================
 * HƯỚNG DẪN 3 BƯỚC CẤU HÌNH THÔNG BÁO TELEGRAM (HOÀN TOÀN MIỄN PHÍ VĨNH VIỄN)
 * ==============================================================================
 * 
 * BƯỚC 1: Lấy BOT TOKEN từ Telegram
 * 1. Mở ứng dụng Telegram trên điện thoại hoặc máy tính.
 * 2. Tìm kiếm bot: @BotFather (có tích xanh).
 * 3. Gửi lệnh: /newbot
 * 4. Nhập tên cho bot (ví dụ: Bếp Bà Vưn Bot).
 * 5. Nhập username cho bot (kết thúc bằng từ 'bot', ví dụ: bepbavan_order_bot).
 * 6. BotFather sẽ gửi cho bạn một chuỗi token dạng: 7123456789:AAFxAbc...
 *    -> Sao chép chuỗi này dán vào biến TELEGRAM_BOT_TOKEN ở bên dưới.
 * 
 * BƯỚC 2: Lấy CHAT ID của bạn (hoặc nhóm bạn muốn nhận đơn)
 * Cách A - Nhận tin nhắn riêng cho bạn:
 * 1. Mở bot bạn vừa tạo và bấm nút "START" (bắt buộc để bot có quyền gửi tin cho bạn).
 * 2. Tìm bot: @userinfobot trên Telegram và bấm START.
 * 3. Nó sẽ trả về cho bạn "Id: 123456789" -> Đó chính là CHAT ID của bạn.
 *    -> Sao chép dán vào biến TELEGRAM_CHAT_ID ở bên dưới.
 * 
 * Cách B - Nhận tin nhắn vào Nhóm (để nhiều người cùng nhận):
 * 1. Tạo 1 nhóm Telegram, thêm Bot bạn vừa tạo vào nhóm.
 * 2. Thêm bot @RawDataBot vào nhóm để xem Id nhóm (có dạng số âm, ví dụ: -1001234567890).
 * 3. Sau khi lấy được Id nhóm, bạn có thể xóa bot @RawDataBot ra khỏi nhóm.
 *    -> Dán Id nhóm đó vào TELEGRAM_CHAT_ID.
 * 
 * BƯỚC 3: Triển khai Web App
 * 1. Bấm nút "Lưu" (Ctrl + S).
 * 2. Bạn có thể chọn hàm "testTelegram" ở thanh công cụ phía trên rồi bấm "Chạy" (Run) để nhận thử 1 tin nhắn mẫu!
 * 3. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> chọn "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng: "Tôi" (Me)
 *    - Ai có quyền truy cập: "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG!
 * 4. Bấm "Triển khai" -> Cấp quyền truy cập nếu Google yêu cầu.
 * 5. Sao chép URL Web App dán vào file .env (VITE_GOOGLE_SHEET_URL) của website bán bánh.
 */

// ==============================================================================
// CẤU HÌNH THÔNG TIN TELEGRAM BOT
// ==============================================================================
var TELEGRAM_BOT_TOKEN = "8980057993:AAE0mtygHv1bKquY_R3kzdArbSQKwr4WWwQ"; 
var TELEGRAM_CHAT_ID = "-5419722424";

// Tên trang tính lưu đơn
var SHEET_NAME = "Đơn Hàng";

/**
 * Xử lý khi Website gửi đơn hàng lên (HTTP POST)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa script tối đa 10s để tránh xung đột khi có nhiều đơn cùng lúc

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
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
      throw new Error("Không tìm thấy dữ liệu đơn hàng gửi lên");
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

    // 1. Lưu đơn vào Google Sheet
    sheet.appendRow(row);

    // 2. Bắn tin nhắn thông báo tức thì lên Telegram
    sendTelegramNotification(data, timeFormatted);

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Đã lưu đơn hàng vào Sheet và gửi thông báo Telegram thành công" 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hàm gửi tin nhắn thông báo đơn hàng mới qua Telegram Bot
 */
function sendTelegramNotification(data, timeFormatted) {
  // Kiểm tra nếu chưa điền token thì bỏ qua
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || 
      TELEGRAM_BOT_TOKEN.indexOf("ĐIỀN_") !== -1 || 
      TELEGRAM_CHAT_ID.indexOf("ĐIỀN_") !== -1) {
    Logger.log("Chưa cấu hình Telegram Bot Token hoặc Chat ID, bỏ qua bước gửi thông báo.");
    return;
  }

  try {
    var message = "🎂 <b>CÓ ĐƠN ĐẶT BÁNH MỚI!</b>\n"
      + "━━━━━━━━━━━━━━━━━━━\n"
      + "🆔 <b>Mã đơn:</b> <code>" + (data.orderId || "DH-MỚI") + "</code>\n"
      + "⏰ <b>Thời gian:</b> " + timeFormatted + "\n"
      + "👤 <b>Khách hàng:</b> " + escapeHtml(data.customerName || "Khách lẻ") + "\n"
      + "📞 <b>Điện thoại:</b> <b>" + escapeHtml(data.customerPhone || "N/A") + "</b>\n"
      + "📍 <b>Địa chỉ:</b> " + escapeHtml(data.customerAddress || "N/A") + "\n\n"
      + "🍰 <b>Chi tiết bánh:</b>\n" + escapeHtml(data.orderItems || "N/A") + "\n\n"
      + "💰 <b>Tổng thanh toán:</b> <b>" + (data.totalPrice || "0 đ") + "</b>\n"
      + "📝 <b>Ghi chú:</b> <i>" + escapeHtml(data.note || "Không có") + "</i>\n"
      + "━━━━━━━━━━━━━━━━━━━\n"
      + "👉 <i>Vui lòng gọi xác nhận đơn cho khách sớm nhé!</i>";

    var url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
    var payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Kết quả gửi Telegram: " + response.getContentText());

  } catch (err) {
    // Không làm gián đoạn việc lưu Sheet nếu Telegram gặp sự cố
    Logger.log("Lỗi gửi thông báo Telegram: " + err.toString());
  }
}

/**
 * Hàm hỗ trợ thoát ký tự đặc biệt trong HTML để không làm hỏng cú pháp tin nhắn Telegram
 */
function escapeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Hàm kiểm tra nhanh Web App có hoạt động không
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "ok", 
      message: "Google Apps Script Web App đang hoạt động bình thường!" 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HÀM TEST THỬ THÔNG BÁO TELEGRAM (Bấm nút 'Chạy' ở thanh công cụ để thử nghiệm)
 */
function testTelegram() {
  var testData = {
    orderId: "DH-999888",
    customerName: "Nguyễn Hoài Đạt (Đơn Thử Nghiệm)",
    customerPhone: "0937 658 834",
    customerAddress: "125 Đồng Văn Cống, Cát Lái, TP. Thủ Đức",
    orderItems: "Bánh kem dâu tây tươi (x1) - 350.000 đ\nTiramisu chuẩn Ý (x1) - 85.000 đ",
    totalPrice: "435.000 đ",
    note: "Ghi chữ 'Chúc mừng sinh nhật Mai' lên bánh nhé"
  };

  var now = new Date();
  var timeFormatted = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");

  sendTelegramNotification(testData, timeFormatted);
  Logger.log("Đã kích hoạt hàm testTelegram, vui lòng kiểm tra hộp thoại Telegram của bạn!");
}
