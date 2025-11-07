import { X, Shield, Lock, Cloud, Database, RefreshCw } from 'lucide-react';

interface GoogleDrivePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function GoogleDrivePermissionsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: GoogleDrivePermissionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Cloud size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Kết nối Google Drive
              </h2>
              <p className="text-sm text-gray-500">
                Quản lý dữ liệu sản phẩm trên cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tại sao cần kết nối Google Drive?
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ứng dụng sẽ sử dụng Google Drive để lưu trữ và đồng bộ dữ liệu sản phẩm của bạn trên cloud.
              Điều này giúp bạn truy cập dữ liệu từ nhiều thiết bị và tránh mất dữ liệu.
            </p>
          </div>

          {/* Permissions List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Quyền truy cập cần thiết
            </h3>
            <div className="space-y-4">
              {/* Permission 1 */}
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Database size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Tạo và quản lý file dữ liệu
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ứng dụng sẽ tạo một thư mục riêng trên Google Drive của bạn để lưu trữ dữ liệu sản phẩm.
                    Chỉ có ứng dụng này mới có thể truy cập các file trong thư mục đó.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Quyền: drive.file
                  </p>
                </div>
              </div>

              {/* Permission 2 */}
              <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <RefreshCw size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Đồng bộ dữ liệu tự động
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ứng dụng sẽ tự động cập nhật dữ liệu lên Google Drive khi có thay đổi và
                    kiểm tra cập nhật từ các thiết bị khác.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Quyền: drive.appdata
                  </p>
                </div>
              </div>

              {/* Permission 3 */}
              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Lock size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Truy cập thông tin cơ bản
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ứng dụng sẽ hiển thị tên và email Google của bạn để xác nhận kết nối thành công.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Quyền: userinfo.profile, userinfo.email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <Shield size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Cam kết bảo mật
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Dữ liệu của bạn được mã hóa và lưu trữ an toàn trên Google Drive</li>
                  <li>✓ Ứng dụng chỉ truy cập vào các file do chính nó tạo ra</li>
                  <li>✓ Bạn có thể ngắt kết nối và xóa quyền truy cập bất cứ lúc nào</li>
                  <li>✓ Không có dữ liệu nào được chia sẻ với bên thứ ba</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Storage Info */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              📁 Vị trí lưu trữ
            </h4>
            <p className="text-sm text-gray-600">
              Dữ liệu sẽ được lưu trong thư mục: <span className="font-mono bg-white px-2 py-0.5 rounded">ProductManagerData/products.json</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Bạn có thể xem và quản lý file này trực tiếp từ Google Drive của mình.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Khi bạn nhấn "Đồng ý và kết nối", bạn sẽ được chuyển đến trang đăng nhập Google</p>
            <p>• Google sẽ yêu cầu bạn xác nhận các quyền truy cập</p>
            <p>• Sau khi xác nhận, bạn sẽ được đưa trở lại ứng dụng</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <Cloud size={18} />
                <span>Đồng ý và kết nối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
