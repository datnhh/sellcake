import React from "react";
import { Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

export default function PromiseSection() {
  return (
    <section id="promise" className="promise-section">
      <div className="promise-grid">
        <div className="promise-item">
          <div className="promise-icon"><Sparkles size={24} /></div>
          <span className="promise-step">01</span>
          <h3>Tươi Mới Mỗi Ngày</h3>
          <p>Bánh chỉ được nướng sau khi chốt đơn, tuyệt đối không dùng chất bảo quản hay phụ gia độc hại.</p>
        </div>

        <div className="promise-item">
          <div className="promise-icon"><HeartHandshake size={24} /></div>
          <span className="promise-step">02</span>
          <h3>Nguyên Liệu Tuyển Chọn</h3>
          <p>Ưu tiên sử dụng bơ động vật cao cấp của Pháp, kem whipping tươi béo nhẹ và trái cây tươi nguồn gốc rõ ràng.</p>
        </div>

        <div className="promise-item">
          <div className="promise-icon"><ShieldCheck size={24} /></div>
          <span className="promise-step">03</span>
          <h3>Giao Bánh Cẩn Thận</h3>
          <p>Bánh được đóng hộp chắc chắn, bảo quản cẩn thận để giữ trọn vẹn vẻ đẹp thẩm mỹ khi tới tay bạn.</p>
        </div>
      </div>
    </section>
  );
}
