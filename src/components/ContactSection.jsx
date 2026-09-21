import React from "react";
import { Phone, MapPin, Clock, Mail, Facebook, ExternalLink } from "lucide-react";
import { SHOP_CONFIG } from "../config/shopConfig";

function ZaloIcon({ size = 22, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M16 3C8.82 3 3 8.37 3 15c0 3.75 1.88 7.09 4.83 9.29L6.5 28.5a.8.8 0 0 0 1.18.83l5.58-2.95c.89.24 1.82.37 2.74.37 7.18 0 13-5.37 13-12S23.18 3 16 3z" 
        fill="#0068FF" 
      />
      <path 
        d="M11 11h10v2.4l-6.5 6.8H21v2.3H11v-2.4l6.5-6.8H11V11z" 
        fill="#ffffff" 
      />
    </svg>
  );
}

export default function ContactSection() {
  const cleanPhone = SHOP_CONFIG.phone.replace(/[\s.-]/g, "");

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-intro">
          <span className="eyebrow">LIÊN HỆ VỚI CHÚNG TÔI</span>
          <h2>Đặt Bánh Hoặc Cần Tư Vấn?</h2>
          <p>
            Bạn cần đặt bánh theo yêu cầu riêng, bánh tiệc sự kiện hay muốn chọn hương vị đặc biệt? Đừng ngần ngại nhắn tin Zalo hoặc ghé Fanpage Facebook của tiệm để được hỗ trợ nhanh nhất nhé!
          </p>

          <div className="contact-quick-actions">
            <a 
              href={SHOP_CONFIG.zalo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="quick-action-btn"
            >
              <div className="quick-action-icon">
                <ZaloIcon size={22} />
              </div>
              <div>
                <span className="btn-label">Tư vấn nhanh qua Zalo</span>
                <strong>{SHOP_CONFIG.phone}</strong>
              </div>
            </a>

            <a 
              href={SHOP_CONFIG.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="quick-action-btn"
            >
              <div className="quick-action-icon">
                <Facebook size={20} />
              </div>
              <div>
                <span className="btn-label">Ghé thăm Fanpage Facebook</span>
                <strong>Bếp Bà Vưn</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon phone">
              <Phone size={22} />
            </div>
            <div>
              <h4>Hotline gọi điện</h4>
              <a href={`tel:${cleanPhone}`}>{SHOP_CONFIG.phone}</a>
            </div>
          </div>

          <a 
            href={SHOP_CONFIG.zalo} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-card contact-card-clickable"
          >
            <div className="contact-card-icon zalo">
              <ZaloIcon size={22} />
            </div>
            <div>
              <h4>Nhắn tin Zalo</h4>
              <span className="contact-card-link">{SHOP_CONFIG.phone} <ExternalLink size={13} /></span>
            </div>
          </a>

          <a 
            href={SHOP_CONFIG.facebook} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-card contact-card-clickable"
          >
            <div className="contact-card-icon facebook">
              <Facebook size={22} />
            </div>
            <div>
              <h4>Facebook Fanpage</h4>
              <span className="contact-card-link">fb.me/bepbavan <ExternalLink size={13} /></span>
            </div>
          </a>

          <div className="contact-card">
            <div className="contact-card-icon map">
              <MapPin size={22} />
            </div>
            <div>
              <h4>Địa chỉ tiệm</h4>
              <p>{SHOP_CONFIG.address}</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon clock">
              <Clock size={22} />
            </div>
            <div>
              <h4>Giờ mở cửa</h4>
              <p>{SHOP_CONFIG.hours}</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon mail">
              <Mail size={22} />
            </div>
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
