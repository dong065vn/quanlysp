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
    <div className="space-y-3 sm:space-y-4">
      {/* Basic Info - Mobile Optimized */}
      {hasBasicInfo && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 border-2 border-gray-200">
          {contactInfo.businessName && (
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3 last:mb-0">
              <Building2 size={18} className="sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Doanh nghiệp</div>
                <div className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                  {contactInfo.businessName}
                </div>
              </div>
            </div>
          )}
          {contactInfo.phone && (
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3 last:mb-0">
              <Phone size={18} className="sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Điện thoại</div>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="font-semibold text-sm sm:text-base text-green-600 hover:text-green-700 active:text-green-800 hover:underline touch-manipulation"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          )}
          {contactInfo.email && (
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3 last:mb-0">
              <Mail size={18} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Email</div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="font-semibold text-sm sm:text-base text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline break-all touch-manipulation"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          )}
          {contactInfo.address && (
            <div className="flex items-start gap-2 sm:gap-3 last:mb-0">
              <MapPin size={18} className="sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] xs:text-xs text-gray-500 mb-0.5">Địa chỉ</div>
                <div className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                  {contactInfo.address}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Links - Mobile Optimized */}
      {activeLinks.length > 0 && (
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
            <span>🌐</span>
            <span>Kết nối với chúng tôi</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {activeLinks.map((link) => {
              const config = PLATFORM_CONFIG[link.platform];
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.url, link.platform)}
                  className={`group relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r ${config.color} text-white rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 active:scale-95 overflow-hidden touch-manipulation`}
                  aria-label={`Liên hệ qua ${link.label}`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>

                  {/* Content - Mobile Centered, Desktop Left */}
                  <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full z-10">
                    <span className="text-3xl sm:text-2xl flex-shrink-0 transform group-hover:scale-110 group-active:scale-100 transition-transform">
                      {config.icon}
                    </span>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="font-bold text-xs sm:text-sm truncate">{link.label}</div>
                      <div className="text-[10px] sm:text-xs opacity-90 flex items-center justify-center sm:justify-start gap-1">
                        <span className="hidden xs:inline">Kết nối</span>
                        <ExternalLink size={10} className="hidden sm:inline" />
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 group-active:opacity-20 transition-opacity pointer-events-none"></div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden animate-scale-in">
        {/* Header - Mobile Optimized */}
        <div className="flex justify-between items-start sm:items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
          <div className="pr-3 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 leading-tight">
              📞 Liên hệ với chúng tôi
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Chọn kênh liên hệ phù hợp
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-200 flex-shrink-0 touch-manipulation"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={20} className="sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Content - Mobile Optimized Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <ContactButtons contactInfo={contactInfo} />
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 pb-safe">
          <p className="text-center text-[10px] xs:text-xs sm:text-xs text-gray-500 leading-relaxed">
            Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi! 💙
          </p>
        </div>
      </div>
    </div>
  );
}
