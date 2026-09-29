/**
 * Service đồng bộ danh sách bánh từ Google Sheets về Web
 * Hỗ trợ Biến thể sản phẩm (Product Variants), tự động kế thừa dòng và gom nhóm theo ID.
 */

// Ưu tiên đọc tab [public_web] nếu có, nếu chưa có sẽ đọc tab mặc định
export const DEFAULT_SHEET_CSV_URL = 
  import.meta.env?.VITE_PRODUCT_SHEET_CSV_URL || 
  "https://docs.google.com/spreadsheets/d/1mfoaP3P1KAoW2YudGaUUNr10DtGrIPqzX6x5LFKD6ig/gviz/tq?tqx=out:csv&sheet=public_web";

export const FALLBACK_SHEET_CSV_URL = 
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
 * Hỗ trợ gom nhóm biến thể theo ID và kế thừa dữ liệu dòng con.
 */
export async function fetchProductsFromSheet(csvUrl = DEFAULT_SHEET_CSV_URL) {
  let response;
  try {
    response = await fetch(csvUrl, {
      method: "GET",
      headers: { "Accept": "text/csv, text/plain;charset=utf-8" }
    });
  } catch (err) {
    // Nếu link chính lỗi (ví dụ chưa có sheet public_web), thử link dự phòng
    if (csvUrl !== FALLBACK_SHEET_CSV_URL) {
      response = await fetch(FALLBACK_SHEET_CSV_URL, {
        method: "GET",
        headers: { "Accept": "text/csv, text/plain;charset=utf-8" }
      });
    } else {
      throw err;
    }
  }

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

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  
  // Ánh xạ tên cột linh hoạt (hỗ trợ cả tiếng Anh và tiếng Việt)
  const getColIdx = (aliases) => {
    return headers.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const idIdx = getColIdx(["id", "mã", "stt"]);
  const nameIdx = getColIdx(["name", "tên bánh", "tên"]);
  const categoryIdx = getColIdx(["category", "danh mục", "loại"]);
  const variantIdx = getColIdx(["variant_name", "tên size", "size bánh", "kích cỡ", "biến thể", "quy cách", "size"]);
  const priceIdx = getColIdx(["price", "giá bán", "giá"]);
  const originalPriceIdx = getColIdx(["original_price", "originalprice", "giá gốc", "giá cũ"]);
  const imageIdx = getColIdx(["image", "ảnh đại diện", "hình đại diện", "ảnh"]);
  const imagesIdx = getColIdx(["images", "ảnh phụ", "hình phụ", "hình chi tiết", "ảnh chi tiết"]);
  const descIdx = getColIdx(["description", "mô tả"]);
  const ingredientsIdx = getColIdx(["ingredients", "thành phần", "nguyên liệu"]);
  const featuredIdx = getColIdx(["featured", "nổi bật"]);

  if (priceIdx === -1) {
    throw new Error("Google Sheet thiếu cột bắt buộc: 'Giá bán' (price).");
  }

  const productMap = new Map();
  let lastProduct = null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowPrice = parsePrice(row[priceIdx]);
    if (!rowPrice && !row[nameIdx]) continue; // Bỏ qua dòng trống

    const rowId = idIdx !== -1 && row[idIdx] ? parseInt(row[idIdx], 10) : null;
    const rowName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : "";
    const rawVariantName = variantIdx !== -1 && row[variantIdx] ? row[variantIdx].trim() : "";

    // Xác định xem dòng này là sản phẩm mới hay là biến thể kế thừa của sản phẩm trước
    let isChildVariant = false;
    let targetId = rowId;

    if (rowId && productMap.has(rowId)) {
      // Đã có sản phẩm mang ID này -> Là biến thể tiếp theo của sản phẩm đó
      isChildVariant = true;
    } else if (!rowId && !rowName && lastProduct) {
      // Dòng trống cả ID và Tên nhưng có giá/size -> Kế thừa sản phẩm phía trên
      isChildVariant = true;
      targetId = lastProduct.id;
    } else if (rowId) {
      targetId = rowId;
    } else {
      targetId = i;
    }

    if (isChildVariant && targetId && productMap.has(targetId)) {
      const parent = productMap.get(targetId);
      const varName = rawVariantName || `Biến thể ${parent.variants.length + 1}`;
      const varPrice = rowPrice || parent.price;
      const varOrigPrice = originalPriceIdx !== -1 && row[originalPriceIdx]
        ? parsePrice(row[originalPriceIdx])
        : Math.round(varPrice * 1.15);

      parent.variants.push({
        id: `${parent.id}_${parent.variants.length + 1}`,
        name: varName,
        price: varPrice,
        originalPrice: varOrigPrice
      });
      continue;
    }

    // Trường hợp là sản phẩm mới (dòng cha)
    const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim() : "Bánh lạnh";
    const price = rowPrice || 50000;
    const originalPrice = originalPriceIdx !== -1 && row[originalPriceIdx] 
      ? parsePrice(row[originalPriceIdx]) 
      : Math.round(price * 1.15);

    const image = imageIdx !== -1 && row[imageIdx] && row[imageIdx].startsWith("http")
      ? row[imageIdx].trim() 
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

    const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "Bánh làm thủ công tươi ngon mỗi ngày.";
    const ingredients = ingredientsIdx !== -1 && row[ingredientsIdx] ? row[ingredientsIdx].trim() : "Nguyên liệu tự nhiên, chuẩn vị.";

    let featured = false;
    if (featuredIdx !== -1 && row[featuredIdx]) {
      const featVal = row[featuredIdx].toString().trim().toLowerCase();
      featured = featVal === "true" || featVal === "1" || featVal === "có" || featVal === "yes";
    }

    const initialVariantName = rawVariantName || "Size tiêu chuẩn";

    const newProduct = {
      id: targetId,
      name: rowName || `Bánh ngon #${targetId}`,
      category,
      price,
      originalPrice,
      image,
      images,
      description,
      ingredients,
      featured,
      variants: [
        {
          id: `${targetId}_1`,
          name: initialVariantName,
          price,
          originalPrice
        }
      ]
    };

    productMap.set(targetId, newProduct);
    lastProduct = newProduct;
  }

  // Chuẩn hóa và tính toán minPrice, maxPrice, defaultVariant cho từng sản phẩm
  const products = Array.from(productMap.values()).map(product => {
    const variants = product.variants;
    const prices = variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Mặc định chọn Size Lớn Nhất (hoặc biến thể có giá cao nhất) theo yêu cầu của bạn
    let defaultVariant = variants.find(v => v.price === maxPrice) || variants[0];

    return {
      ...product,
      minPrice,
      maxPrice,
      price: defaultVariant.price,
      originalPrice: defaultVariant.originalPrice,
      hasVariants: variants.length > 1,
      defaultVariant
    };
  });

  return products;
}
