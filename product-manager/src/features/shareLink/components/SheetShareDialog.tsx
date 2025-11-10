import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Eye, DollarSign, Box, FileText, Tag, Link as LinkIcon, MessageSquare, Edit, Table } from 'lucide-react';
import type { ShareableLinkSettings, SharePermission } from '../../../types/product';
import { shareableLinkService } from '../../../services/shareableLinkService';
import { toast } from '../../../components/Toast';

interface SheetShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCount: number;
}

export function SheetShareDialog({ isOpen, onClose, productCount }: SheetShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<ShareableLinkSettings>({
    permission: 'view',
    allowProductLinks: true,
    showPrice: true,
    showStock: true,
    showDescription: true,
    showImages: true,
    showTags: true,
  });

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    const shareableLink = shareableLinkService.createSheetShareableLink(settings);
    const url = shareableLinkService.getShareableURL(shareableLink.token);

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('✅ Đã copy link chia sẻ sheet!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('❌ Không thể copy link');
    });
  };

  const handlePreview = () => {
    const shareableLink = shareableLinkService.createSheetShareableLink(settings);
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
              <Table size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chia sẻ Sheet</h2>
              <p className="text-sm text-white/80">Chia sẻ toàn bộ danh sách {productCount} sản phẩm</p>
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
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Table size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Chia sẻ toàn bộ danh sách sản phẩm</h3>
                <p className="text-sm text-blue-700">
                  Người nhận link sẽ xem được tất cả {productCount} sản phẩm trong danh sách với các quyền bạn chọn bên dưới
                </p>
              </div>
            </div>
          </div>

          {/* Permission Level */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink size={18} className="text-primary-600" />
              Quyền truy cập
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PermissionOption
                icon={<Eye size={20} />}
                label="Chỉ xem"
                description="Người xem chỉ có thể đọc thông tin"
                value="view"
                selected={settings.permission === 'view'}
                onSelect={() => setSettings({ ...settings, permission: 'view' })}
                color="blue"
              />
              <PermissionOption
                icon={<MessageSquare size={20} />}
                label="Nhận xét"
                description="Có thể xem và thêm nhận xét"
                value="comment"
                selected={settings.permission === 'comment'}
                onSelect={() => setSettings({ ...settings, permission: 'comment' })}
                color="green"
              />
              <PermissionOption
                icon={<Edit size={20} />}
                label="Chỉnh sửa"
                description="Có thể chỉnh sửa sản phẩm"
                value="edit"
                selected={settings.permission === 'edit'}
                onSelect={() => setSettings({ ...settings, permission: 'edit' })}
                color="orange"
              />
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

interface PermissionOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: SharePermission;
  selected: boolean;
  onSelect: () => void;
  color: 'blue' | 'green' | 'orange';
}

function PermissionOption({ icon, label, description, selected, onSelect, color }: PermissionOptionProps) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      border: 'border-blue-500',
      text: 'text-blue-600',
      bgLight: 'from-blue-50 to-blue-100',
      bgHover: 'hover:from-blue-100 hover:to-blue-200',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      border: 'border-green-500',
      text: 'text-green-600',
      bgLight: 'from-green-50 to-green-100',
      bgHover: 'hover:from-green-100 hover:to-green-200',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      border: 'border-orange-500',
      text: 'text-orange-600',
      bgLight: 'from-orange-50 to-orange-100',
      bgHover: 'hover:from-orange-100 hover:to-orange-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
        selected
          ? `${colors.border} bg-gradient-to-br ${colors.bgLight} shadow-md`
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${colors.bgLight} ${colors.text} ${colors.bgHover} transition-all duration-200`}>
        {icon}
      </div>
      <div className="font-bold text-gray-900 mb-1">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
      {selected && (
        <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${colors.text}`}>
          <Check size={16} />
          <span>Đã chọn</span>
        </div>
      )}
    </button>
  );
}
