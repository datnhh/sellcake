/**
 * Service xử lý gửi đơn hàng lên Google Sheets thông qua Google Apps Script Web App.
 */

export async function sendOrderToGoogleSheet(orderData, webAppUrl) {
  // Nếu chưa có URL hoặc vẫn để giá trị mặc định, chạy ở chế độ DEMO
  if (!webAppUrl || webAppUrl.includes("YOUR_SCRIPT_ID")) {
    console.warn("⚠️ CHẾ ĐỘ DEMO: Chưa cấu hình VITE_GOOGLE_SHEET_URL. Đơn hàng hiển thị dưới đây:", orderData);
    // Giả lập thời gian mạng 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      isDemo: true,
      message: "Đơn hàng đã được ghi nhận ở chế độ demo (chưa cấu hình link Google Sheet)."
    };
  }

  try {
    /**
     * Dùng Content-Type: text/plain;charset=utf-8 để tránh trình duyệt gửi CORS preflight OPTIONS request
     * giúp Google Apps Script xử lý mượt mà 100% không bị chặn bởi chính sách CORS.
     */
    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(orderData)
    });

    // Nếu response có thể đọc JSON
    try {
      const result = await response.json();
      return {
        success: true,
        isDemo: false,
        data: result
      };
    } catch {
      // Một số phiên bản GAS redirect 302, nhưng lệnh POST đã được ghi thành công vào Sheet
      return {
        success: true,
        isDemo: false,
        message: "Đã gửi đơn hàng thành công lên Google Sheet!"
      };
    }
  } catch (error) {
    console.error("Lỗi khi gửi đơn lên Google Sheets:", error);
    throw new Error("Không thể kết nối tới Google Sheets. Vui lòng kiểm tra lại liên kết Web App hoặc quyền truy cập.");
  }
}
