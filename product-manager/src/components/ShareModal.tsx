import { useState, useEffect } from 'react';
import { X, Copy, Check, Link2, Users, Globe, Lock, Trash2, ChevronDown } from 'lucide-react';
import type { Product, ShareSettings, SharedUser, LinkShareAccess, ShareAccess } from '../types/product';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (shareSettings: ShareSettings) => void;
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function ShareModal({ isOpen, onClose, product, onSave }: ShareModalProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    linkAccess: 'off',
    shareId: '',
    sharedUsers: [],
    isPubliclyAccessible: false,
  });
  const [newEmail, setNewEmail] = useState('');
  const [newAccess, setNewAccess] = useState<ShareAccess>('view');
  const [copied, setCopied] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (product.shareSettings) {
      setShareSettings(product.shareSettings);
    } else {
      setShareSettings({
        linkAccess: 'off',
        shareId: generateShareId(),
        sharedUsers: [],
        isPubliclyAccessible: false,
      });
    }
  }, [product]);

  const shareUrl = `${window.location.origin}/share/${shareSettings.shareId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddUser = () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Vui lòng nhập email hợp lệ');
      return;
    }
    if (shareSettings.sharedUsers.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
      alert('Email này đã được thêm');
      return;
    }

    const newUser: SharedUser = {
      id: Date.now().toString(),
      email: newEmail,
      access: newAccess,
      addedAt: new Date().toISOString(),
    };

    setShareSettings({
      ...shareSettings,
      sharedUsers: [...shareSettings.sharedUsers, newUser],
    });
    setNewEmail('');
  };

  const handleRemoveUser = (userId: string) => {
    setShareSettings({
      ...shareSettings,
      sharedUsers: shareSettings.sharedUsers.filter(u => u.id !== userId),
    });
  };

  const handleUpdateUserAccess = (userId: string, access: ShareAccess) => {
    setShareSettings({
      ...shareSettings,
      sharedUsers: shareSettings.sharedUsers.map(u =>
        u.id === userId ? { ...u, access } : u
      ),
    });
    setShowAccessDropdown(null);
  };

  const handleLinkAccessChange = (access: LinkShareAccess) => {
    setShareSettings({
      ...shareSettings,
      linkAccess: access,
      isPubliclyAccessible: access !== 'off',
    });
  };

  const handleSave = () => {
    onSave(shareSettings);
    onClose();
  };

  if (!isOpen) return null;

  const accessLabels: Record<ShareAccess, string> = {
    view: 'Có thể xem',
    edit: 'Có thể chỉnh sửa',
    admin: 'Quản trị viên',
  };

  const linkAccessLabels: Record<LinkShareAccess, { label: string; icon: typeof Globe; desc: string }> = {
    off: { label: 'Tắt', icon: Lock, desc: 'Chỉ người được thêm mới xem được' },
    view: { label: 'Xem', icon: Globe, desc: 'Ai có link đều xem được' },
    edit: { label: 'Chỉnh sửa', icon: Globe, desc: 'Ai có link đều chỉnh sửa được' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chia sẻ "{product.name}"</h2>
            <p className="text-sm text-gray-500">Quản lý quyền truy cập</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Add People */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-2" />
              Thêm người
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newAccess}
                onChange={(e) => setNewAccess(e.target.value as ShareAccess)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">Xem</option>
                <option value="edit">Chỉnh sửa</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Shared Users List */}
          {shareSettings.sharedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Người có quyền truy cập</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {shareSettings.sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Thêm {new Date(user.addedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowAccessDropdown(showAccessDropdown === user.id ? null : user.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          {accessLabels[user.access]}
                          <ChevronDown size={14} />
                        </button>
                        {showAccessDropdown === user.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {(['view', 'edit', 'admin'] as ShareAccess[]).map((access) => (
                              <button
                                key={access}
                                onClick={() => handleUpdateUserAccess(user.id, access)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                  user.access === access ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                              >
                                {accessLabels[access]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link Sharing */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Link2 size={16} className="inline mr-2" />
              Chia sẻ qua link
            </label>

            {/* Link Access Options */}
            <div className="space-y-2 mb-4">
              {(['off', 'view', 'edit'] as LinkShareAccess[]).map((access) => {
                const config = linkAccessLabels[access];
                const Icon = config.icon;
                return (
                  <label
                    key={access}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      shareSettings.linkAccess === access
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkAccess"
                      checked={shareSettings.linkAccess === access}
                      onChange={() => handleLinkAccessChange(access)}
                      className="sr-only"
                    />
                    <Icon size={20} className={shareSettings.linkAccess === access ? 'text-blue-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-medium ${shareSettings.linkAccess === access ? 'text-blue-600' : 'text-gray-900'}`}>
                        {access === 'off' ? 'Hạn chế' : `Ai có link - ${config.label}`}
                      </p>
                      <p className="text-xs text-gray-500">{config.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Copy Link */}
            {shareSettings.linkAccess !== 'off' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Đã copy!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
