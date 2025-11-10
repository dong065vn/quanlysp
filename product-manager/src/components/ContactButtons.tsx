import { useState } from 'react';
import { Phone, Mail, MapPin, Building2, ExternalLink, X } from 'lucide-react';
import type { ContactInfo } from '../types/product';

interface ContactButtonsProps {
  contactInfo: ContactInfo;
  onClose?: () => void;
}

const PLATFORM_CONFIG = {
  facebook: { icon: '📘', label: 'Facebook', color: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' },
  zalo: { icon: '💬', label: 'Zalo', color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
  tiktok: { icon: '🎵', label: 'TikTok', color: 'from-gray-900 to-black hover:from-black hover:to-gray-900' },
  instagram: { icon: '📷', label: 'Instagram', color: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' },
  youtube: { icon: '▶️', label: 'YouTube', color: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' },
  twitter: { icon: '🐦', label: 'Twitter', color: 'from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700' },
  telegram: { icon: '✈️', label: 'Telegram', color: 'from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600' },
  whatsapp: { icon: '📱', label: 'WhatsApp', color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' },
  line: { icon: '💚', label: 'LINE', color: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' },
  linkedin: { icon: '💼', label: 'LinkedIn', color: 'from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900' },
  website: { icon: '🌐', label: 'Website', color: 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800' },
  email: { icon: '📧', label: 'Email', color: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' },
  phone: { icon: '☎️', label: 'Gọi ngay', color: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' },
};

export function ContactButtons({ contactInfo, onClose }: ContactButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeLinks = contactInfo.socialLinks.filter(link => link.isActive);
  const hasBasicInfo = contactInfo.businessName || contactInfo.phone || contactInfo.email || contactInfo.address;
  const hasContent = hasBasicInfo || activeLinks.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Chưa có thông tin liên hệ</p>
      </div>
    );
  }

  const handleLinkClick = (url: string, platform: string) => {
    if (platform === 'email') {
      window.location.href = `mailto:${url}`;
    } else if (platform === 'phone') {
      window.location.href = `tel:${url}`;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      {hasBasicInfo && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200">
          {contactInfo.businessName && (
            <div className="flex items-start gap-3 mb-3">
              <Building2 size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Doanh nghiệp</div>
                <div className="font-semibold text-gray-900">{contactInfo.businessName}</div>
              </div>
            </div>
          )}
          {contactInfo.phone && (
            <div className="flex items-start gap-3 mb-3">
              <Phone size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Điện thoại</div>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          )}
          {contactInfo.email && (
            <div className="flex items-start gap-3 mb-3">
              <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Email</div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          )}
          {contactInfo.address && (
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Địa chỉ</div>
                <div className="font-semibold text-gray-900">{contactInfo.address}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Links */}
      {activeLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🌐</span>
            <span>Kết nối với chúng tôi</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activeLinks.map((link) => {
              const config = PLATFORM_CONFIG[link.platform];
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.url, link.platform)}
                  className={`group relative flex items-center gap-3 p-4 bg-gradient-to-r ${config.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 overflow-hidden`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative flex items-center gap-3 w-full">
                    <span className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
                      {config.icon}
                    </span>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-bold text-sm truncate">{link.label}</div>
                      <div className="text-xs opacity-90 flex items-center gap-1">
                        <span>Kết nối</span>
                        <ExternalLink size={10} />
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: ContactInfo;
}

export function ContactModal({ isOpen, onClose, contactInfo }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">📞 Liên hệ với chúng tôi</h2>
            <p className="text-sm text-gray-500">
              Chọn kênh liên hệ phù hợp với bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
            title="Đóng"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ContactButtons contactInfo={contactInfo} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi! 💙
          </p>
        </div>
      </div>
    </div>
  );
}
