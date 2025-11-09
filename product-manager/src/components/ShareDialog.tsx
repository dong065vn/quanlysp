import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Eye, DollarSign, Box, FileText, Tag, Link as LinkIcon } from 'lucide-react';
import type { Product, ShareableLink, ShareSettings } from '../types/product';
import { shareableLinkService } from '../services/shareableLinkService';
import { toast } from './Toast';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function ShareDialog({ isOpen, onClose, product }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<ShareSettings>({
    allowProductLinks: true,
    showPrice: true,
    showStock: true,
    showDescription: true,
    showImages: true,
    showTags: true,
  });

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    const shareableLink = shareableLinkService.createShareableLink(product.id, settings);
    const url = shareableLinkService.getShareableURL(shareableLink.token);

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('✅ Đã copy link chia sẻ!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('❌ Không thể copy link');
    });
  };

  const handlePreview = () => {
    const shareableLink = shareableLinkService.createShareableLink(product.id, settings);
    const url = shareableLinkService.getShareableURL(shareableLink.token);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ExternalLink size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chia sẻ sản phẩm</h2>
              <p className="text-sm text-white/80">Tùy chỉnh thông tin hiển thị</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-95"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Product Info */}
          <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 font-mono">SKU: {product.sku}</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye size={18} className="text-primary-600" />
              Tùy chọn hiển thị
            </h3>

            <ToggleOption
              icon={<DollarSign size={16} />}
              label="Hiển thị giá"
              description="Cho phép người xem thấy giá sản phẩm"
              checked={settings.showPrice}
              onChange={(checked) => setSettings({ ...settings, showPrice: checked })}
            />

            <ToggleOption
              icon={<Box size={16} />}
              label="Hiển thị tồn kho"
              description="Cho phép người xem thấy số lượng tồn kho"
              checked={settings.showStock}
              onChange={(checked) => setSettings({ ...settings, showStock: checked })}
            />

            <ToggleOption
              icon={<FileText size={16} />}
              label="Hiển thị mô tả"
              description="Cho phép người xem thấy mô tả chi tiết"
              checked={settings.showDescription}
              onChange={(checked) => setSettings({ ...settings, showDescription: checked })}
            />

            <ToggleOption
              icon={<Tag size={16} />}
              label="Hiển thị tags"
              description="Cho phép người xem thấy các tag sản phẩm"
              checked={settings.showTags}
              onChange={(checked) => setSettings({ ...settings, showTags: checked })}
            />

            <ToggleOption
              icon={<LinkIcon size={16} />}
              label="Cho phép click vào links"
              description="Người xem có thể click vào các liên kết sản phẩm"
              checked={settings.allowProductLinks}
              onChange={(checked) => setSettings({ ...settings, allowProductLinks: checked })}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePreview}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold active:scale-95"
            >
              <Eye size={18} />
              <span>Xem trước</span>
            </button>
            <button
              onClick={handleGenerateLink}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Đã copy!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ icon, label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer group">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center text-primary-600 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-200">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm mb-0.5">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="flex-shrink-0">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
            checked ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
              checked ? 'translate-x-6' : 'translate-x-0'
            }`}></div>
          </div>
        </div>
      </div>
    </label>
  );
}
