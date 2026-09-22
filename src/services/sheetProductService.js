/**
 * Service đồng bộ danh sách bánh từ Google Sheets về Web
 */

export const DEFAULT_SHEET_CSV_URL = 
  import.meta.env?.VITE_PRODUCT_SHEET_CSV_URL || 
  "https://docs.google.com/spreadsheets/d/1mfoaP3P1KAoW2YudGaUUNr10DtGrIPqzX6x5LFKD6ig/export?format=csv";

export const DEFAULT_SHEET_EDIT_URL = 
  "https://docs.google.com/spreadsheets/d/1mfoaP3P1KAoW2YudGaUUNr10DtGrIPqzX6x5LFKD6ig/edit?usp=sharing";

export const SYNC_TOKEN = "YQGkQno8W38QwQU1v9u5Xz4GmP";

/**
 * Hàm phân tích cú pháp chuỗi CSV thành mảng 2 chiều
 * Xử lý chính xác các trường chứa dấu phẩy, dấu nháy kép, dấu xuống dòng.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let curVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        curVal += '"';
        i++; // bỏ qua dấu nháy kép escape
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(curVal.trim());
      curVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(curVal.trim());
      if (row.some((val) => val !== "")) {
        lines.push(row);
      }
      row = [];
      curVal = "";
    } else {
      curVal += char;
    }
  }

  if (curVal || row.length > 0) {
    row.push(curVal.trim());
    if (row.some((val) => val !== "")) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Hàm chuyển đổi chuỗi giá tiền thành số
 * Ví dụ: "350.000 đ", "350000", "350,000" -> 350000
 */
export function parsePrice(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Lấy danh sách sản phẩm từ Google Sheets qua URL CSV Export
 */
export async function fetchProductsFromSheet(csvUrl = DEFAULT_SHEET_CSV_URL) {
  const response = await fetch(csvUrl, {
    method: "GET",
    headers: {
      "Accept": "text/csv, text/plain;charset=utf-8"
    }
  });

  if (!response.ok) {
    throw new Error(`Không thể kết nối đến Google Sheets (Mã lỗi HTTP: ${response.status})`);
  }

  const csvText = await response.text();
  if (!csvText || !csvText.trim()) {
    throw new Error("Trang tính Google Sheets đang trống, chưa có dữ liệu sản phẩm.");
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error("Google Sheets cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu sản phẩm.");
  }

  const headers = rows[0].map((h) => h.toLowerCase());
  
  // Ánh xạ tên cột linh hoạt (hỗ trợ cả tiếng Anh và tiếng Việt)
  const getColIdx = (aliases) => {
    return headers.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const idIdx = getColIdx(["id", "mã", "stt"]);
  const nameIdx = getColIdx(["name", "tên bánh", "tên"]);
  const categoryIdx = getColIdx(["category", "danh mục", "loại"]);
  const priceIdx = getColIdx(["price", "giá bán", "giá"]);
  const originalPriceIdx = getColIdx(["originalprice", "giá gốc", "giá cũ"]);
  const imageIdx = getColIdx(["image", "ảnh đại diện", "hình"]);
  const imagesIdx = getColIdx(["images", "ảnh phụ", "hình phụ"]);
  const descIdx = getColIdx(["description", "mô tả"]);
  const sizeIdx = getColIdx(["size", "kích cỡ", "quy cách"]);
  const ingredientsIdx = getColIdx(["ingredients", "thành phần"]);
  const featuredIdx = getColIdx(["featured", "nổi bật"]);

  if (nameIdx === -1 || priceIdx === -1) {
    throw new Error("Google Sheet thiếu cột bắt buộc: 'Tên bánh' (name) hoặc 'Giá bán' (price).");
  }

  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameIdx];
    if (!name) continue; // Bỏ qua dòng trống

    const id = idIdx !== -1 && row[idIdx] ? parseInt(row[idIdx], 10) || i : i;
    const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : "Bánh kem";
    const price = parsePrice(row[priceIdx]);
    const originalPrice = originalPriceIdx !== -1 && row[originalPriceIdx] 
      ? parsePrice(row[originalPriceIdx]) 
      : Math.round(price * 1.15);

    const image = imageIdx !== -1 && row[imageIdx] 
      ? row[imageIdx] 
      : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80";

    let images = [];
    if (imagesIdx !== -1 && row[imagesIdx]) {
      images = row[imagesIdx]
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.startsWith("http"));
    }
    if (images.length === 0) {
      images = [image];
    }

    const description = descIdx !== -1 && row[descIdx] ? row[descIdx] : "";
    const size = sizeIdx !== -1 && row[sizeIdx] ? row[sizeIdx] : "Quy cách tiêu chuẩn";
    const ingredients = ingredientsIdx !== -1 && row[ingredientsIdx] ? row[ingredientsIdx] : "Nguyên liệu cao cấp tươi mới";

    let featured = false;
    if (featuredIdx !== -1 && row[featuredIdx]) {
      const featVal = row[featuredIdx].toString().trim().toLowerCase();
      featured = featVal === "true" || featVal === "1" || featVal === "có" || featVal === "yes";
    }

    products.push({
      id,
      name,
      category,
      price,
      originalPrice,
      image,
      images,
      description,
      size,
      ingredients,
      featured
    });
  }

  return products;
}
