import { useState, useEffect } from 'react';
import { X, Save, Phone, MessageCircle, Mail, MapPin, Clock, Store } from 'lucide-react';
import type { StoreContactInfo } from '../types/product';
import { storageService } from '../services/storage';

interface StoreContactSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoreContactSettings({ isOpen, onClose }: StoreContactSettingsProps) {
  const [contact, setContact] = useState<StoreContactInfo>({
    storeName: '',
    phone: '',
    zalo: '',
    facebook: '',
    email: '',
    address: '',
    workingHours: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = storageService.getStoreContact();
      setContact(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    storageService.saveStoreContact(contact);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Store className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin liên hệ Store</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <p className="text-sm text-gray-600">
            Thông tin này sẽ hiển thị trên trang sản phẩm khi chia sẻ
          </p>

          {/* Store Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Store size={16} />
              Tên cửa hàng
            </label>
            <input
              type="text"
              value={contact.storeName}
              onChange={(e) => setContact({ ...contact, storeName: e.target.value })}
              placeholder="VD: Shop ABC"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={contact.phone || ''}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="VD: 0901234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Zalo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MessageCircle size={16} />
              Zalo
            </label>
            <input
              type="text"
              value={contact.zalo || ''}
              onChange={(e) => setContact({ ...contact, zalo: e.target.value })}
              placeholder="VD: 0901234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </label>
            <input
              type="text"
              value={contact.facebook || ''}
              onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
              placeholder="VD: https://fb.com/shopxyz hoặc shopxyz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={contact.email || ''}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="VD: contact@shop.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} />
              Địa chỉ
            </label>
            <input
              type="text"
              value={contact.address || ''}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              placeholder="VD: 123 Nguyễn Văn A, Q.1, TP.HCM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Working Hours */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} />
              Giờ làm việc
            </label>
            <input
              type="text"
              value={contact.workingHours || ''}
              onChange={(e) => setContact({ ...contact, workingHours: e.target.value })}
              placeholder="VD: 8:00 - 22:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save size={16} />
            {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
