import { useState, useEffect } from 'react';
import { X, Copy, Check, Link2, Users, Globe, Lock, Trash2, ChevronDown, Store } from 'lucide-react';
import type { StoreShareSettings, SharedUser, LinkShareAccess, ShareAccess } from '../types/product';
import { storageService } from '../services/storage';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareStoreModal({ isOpen, onClose }: ShareStoreModalProps) {
  const [settings, setSettings] = useState<StoreShareSettings | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newAccess, setNewAccess] = useState<ShareAccess>('view');
  const [copied, setCopied] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      let storeShare = storageService.getStoreShare();
      if (!storeShare) {
        storeShare = storageService.createStoreShare('My Product Store');
      }
      setSettings(storeShare);
    }
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const shareUrl = `${window.location.origin}/store/${settings.storeId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    if (settings.sharedUsers.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
      alert('Email này đã được thêm');
      return;
    }

    const newUser: SharedUser = {
      id: Date.now().toString(),
      email: newEmail,
      access: newAccess,
      addedAt: new Date().toISOString(),
    };

    const updated = {
      ...settings,
      sharedUsers: [...settings.sharedUsers, newUser],
    };
    setSettings(updated);
    storageService.saveStoreShare(updated);
    setNewEmail('');
  };

  const handleRemoveUser = (userId: string) => {
    const updated = {
      ...settings,
      sharedUsers: settings.sharedUsers.filter(u => u.id !== userId),
    };
    setSettings(updated);
    storageService.saveStoreShare(updated);
  };

  const handleUpdateUserAccess = (userId: string, access: ShareAccess) => {
    const updated = {
      ...settings,
      sharedUsers: settings.sharedUsers.map(u =>
        u.id === userId ? { ...u, access } : u
      ),
    };
    setSettings(updated);
    storageService.saveStoreShare(updated);
    setShowAccessDropdown(null);
  };

  const handleLinkAccessChange = (access: LinkShareAccess) => {
    const updated = { ...settings, linkAccess: access };
    setSettings(updated);
    storageService.saveStoreShare(updated);
  };

  const handleStoreNameChange = (name: string) => {
    const updated = { ...settings, storeName: name };
    setSettings(updated);
    storageService.saveStoreShare(updated);
  };

  const accessLabels: Record<ShareAccess, string> = {
    view: 'Có thể xem',
    edit: 'Có thể chỉnh sửa',
    admin: 'Quản trị viên',
  };

  const linkAccessConfig: Record<LinkShareAccess, { label: string; icon: typeof Globe; desc: string }> = {
    off: { label: 'Hạn chế', icon: Lock, desc: 'Chỉ người được thêm mới xem được' },
    view: { label: 'Ai có link - Xem', icon: Globe, desc: 'Ai có link đều xem được toàn bộ store' },
    edit: { label: 'Ai có link - Sửa', icon: Globe, desc: 'Ai có link đều chỉnh sửa được' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center gap-3 text-white">
            <Store size={24} />
            <div>
              <h2 className="text-lg font-semibold">Chia sẻ Store</h2>
              <p className="text-sm text-green-100">Chia sẻ toàn bộ cửa hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Store</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tên cửa hàng của bạn"
            />
          </div>

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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={newAccess}
                onChange={(e) => setNewAccess(e.target.value as ShareAccess)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="view">Xem</option>
                <option value="edit">Sửa</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Shared Users List */}
          {settings.sharedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Người có quyền truy cập</p>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {settings.sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Thêm {new Date(user.addedAt).toLocaleDateString('vi-VN')}</p>
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
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${user.access === access ? 'bg-green-50 text-green-600' : ''}`}
                              >
                                {accessLabels[access]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleRemoveUser(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
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
            <div className="space-y-2 mb-4">
              {(['off', 'view', 'edit'] as LinkShareAccess[]).map((access) => {
                const config = linkAccessConfig[access];
                const Icon = config.icon;
                return (
                  <label
                    key={access}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      settings.linkAccess === access ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkAccess"
                      checked={settings.linkAccess === access}
                      onChange={() => handleLinkAccessChange(access)}
                      className="sr-only"
                    />
                    <Icon size={20} className={settings.linkAccess === access ? 'text-green-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-medium ${settings.linkAccess === access ? 'text-green-600' : 'text-gray-900'}`}>
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-500">{config.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Copy Link */}
            {settings.linkAccess !== 'off' && (
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
                    copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
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
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
