import React from "react";
import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { SHOP_CONFIG } from "../config/shopConfig";

export default function ContactSection() {
  const cleanPhone = SHOP_CONFIG.phone.replace(/[\s.-]/g, "");

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-intro">
          <span className="eyebrow">LIÊN HỆ VỚI CHÚNG TÔI</span>
          <h2>Đặt Bánh Hoặc Cần Tư Vấn?</h2>
          <p>
            Bạn cần đặt bánh theo yêu cầu riêng, bánh tiệc sự kiện hay muốn chọn hương vị đặc biệt? Đừng ngần ngại liên hệ ngay với tiệm để được hỗ trợ nhanh nhất nhé!
          </p>
        </div>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon"><Phone size={22} /></div>
            <div>
              <h4>Hotline / Zalo</h4>
              <a href={`tel:${cleanPhone}`}>{SHOP_CONFIG.phone}</a>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon"><MapPin size={22} /></div>
            <div>
              <h4>Địa chỉ tiệm</h4>
              <p>{SHOP_CONFIG.address}</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon"><Clock size={22} /></div>
            <div>
              <h4>Giờ mở cửa</h4>
              <p>{SHOP_CONFIG.hours}</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon"><Mail size={22} /></div>
            <div>
              <h4>Email hỗ trợ</h4>
              <a href={`mailto:${SHOP_CONFIG.email}`}>{SHOP_CONFIG.email}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
