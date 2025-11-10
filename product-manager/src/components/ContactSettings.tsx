import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Phone, Mail, MapPin, Building2, X } from 'lucide-react';
import type { ContactInfo, SocialLink } from '../types/product';
import { storageService } from '../services/storage';
import { toast } from './Toast';

interface ContactSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_CONFIG = {
  facebook: { icon: '📘', label: 'Facebook', color: 'bg-blue-600', placeholder: 'https://facebook.com/...' },
  zalo: { icon: '💬', label: 'Zalo', color: 'bg-blue-500', placeholder: 'https://zalo.me/...' },
  tiktok: { icon: '🎵', label: 'TikTok', color: 'bg-gray-900', placeholder: 'https://tiktok.com/@...' },
  instagram: { icon: '📷', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', placeholder: 'https://instagram.com/...' },
  youtube: { icon: '▶️', label: 'YouTube', color: 'bg-red-600', placeholder: 'https://youtube.com/@...' },
  twitter: { icon: '🐦', label: 'Twitter', color: 'bg-sky-500', placeholder: 'https://twitter.com/...' },
  telegram: { icon: '✈️', label: 'Telegram', color: 'bg-sky-400', placeholder: 'https://t.me/...' },
  whatsapp: { icon: '📱', label: 'WhatsApp', color: 'bg-green-500', placeholder: 'https://wa.me/...' },
  line: { icon: '💚', label: 'LINE', color: 'bg-green-600', placeholder: 'https://line.me/...' },
  linkedin: { icon: '💼', label: 'LinkedIn', color: 'bg-blue-700', placeholder: 'https://linkedin.com/...' },
  website: { icon: '🌐', label: 'Website', color: 'bg-gray-600', placeholder: 'https://...' },
  email: { icon: '📧', label: 'Email', color: 'bg-red-500', placeholder: 'email@example.com' },
  phone: { icon: '☎️', label: 'Số điện thoại', color: 'bg-green-600', placeholder: '+84...' },
};

export function ContactSettings({ isOpen, onClose }: ContactSettingsProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(storageService.getContactInfo());
  const [newLink, setNewLink] = useState<{ platform: SocialLink['platform']; url: string; label: string }>({
    platform: 'facebook',
    url: '',
    label: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Reload contact info when modal opens
      setContactInfo(storageService.getContactInfo());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (!newLink.url.trim()) {
      toast.warning('Vui lòng nhập URL/thông tin liên hệ');
      return;
    }

    const link: SocialLink = {
      id: Date.now().toString(),
      platform: newLink.platform,
      url: newLink.url.trim(),
      label: newLink.label.trim() || PLATFORM_CONFIG[newLink.platform].label,
      isActive: true,
    };

    setContactInfo({
      ...contactInfo,
      socialLinks: [...contactInfo.socialLinks, link],
    });
    setNewLink({ platform: 'facebook', url: '', label: '' });
  };

  const handleRemoveLink = (linkId: string) => {
    setContactInfo({
      ...contactInfo,
      socialLinks: contactInfo.socialLinks.filter(l => l.id !== linkId),
    });
  };

  const handleToggleLink = (linkId: string) => {
    setContactInfo({
      ...contactInfo,
      socialLinks: contactInfo.socialLinks.map(l =>
        l.id === linkId ? { ...l, isActive: !l.isActive } : l
      ),
    });
  };

  const handleSave = () => {
    const updatedContactInfo: ContactInfo = {
      ...contactInfo,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveContactInfo(updatedContactInfo);
    setContactInfo(updatedContactInfo);
    toast.success('Đã lưu thông tin liên hệ!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">📞 Thông tin liên hệ</h2>
            <p className="text-sm text-gray-500">
              Thông tin này sẽ hiển thị khi khách hàng xem sản phẩm qua link chia sẻ
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

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-primary-600" />
                Tên doanh nghiệp
              </label>
              <input
                type="text"
                value={contactInfo.businessName || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, businessName: e.target.value })}
                className="input hover:border-primary-300 transition-all"
                placeholder="VD: Cửa hàng điện thoại XYZ"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-green-600" />
                Số điện thoại
              </label>
              <input
                type="text"
                value={contactInfo.phone || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="input hover:border-primary-300 transition-all"
                placeholder="VD: 0901234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-blue-600" />
                Email
              </label>
              <input
                type="email"
                value={contactInfo.email || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="input hover:border-primary-300 transition-all"
                placeholder="VD: shop@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-red-600" />
                Địa chỉ
              </label>
              <input
                type="text"
                value={contactInfo.address || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="input hover:border-primary-300 transition-all"
                placeholder="VD: 123 Nguyễn Văn A, Q1, TP.HCM"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🌐 Mạng xã hội & liên kết
            </label>

            {/* Existing Links */}
            {contactInfo.socialLinks.length > 0 && (
              <div className="mb-4 space-y-2">
                {contactInfo.socialLinks.map((link) => {
                  const config = PLATFORM_CONFIG[link.platform];
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        link.isActive
                          ? 'bg-gradient-to-r from-white to-gray-50 border-gray-300'
                          : 'bg-gray-100 border-gray-200 opacity-60'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">
                          {link.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{link.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLink(link.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            link.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {link.isActive ? '✓ Hiện' : '✕ Ẩn'}
                        </button>
                        <button
                          onClick={() => handleRemoveLink(link.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Link */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:border-primary-300 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value as SocialLink['platform'] })}
                  className="input text-sm"
                >
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Tên hiển thị (tùy chọn)"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  className="input text-sm"
                />
                <input
                  type="text"
                  placeholder={PLATFORM_CONFIG[newLink.platform].placeholder}
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="input text-sm sm:col-span-3"
                />
              </div>
              <button
                onClick={handleAddLink}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all active:scale-95"
              >
                <Plus size={18} />
                Thêm liên kết
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Save size={18} />
            Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
}
