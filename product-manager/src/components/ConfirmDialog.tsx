import { useState } from 'react';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react';

export type DialogType = 'danger' | 'warning' | 'info' | 'question';

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  details?: string[];
}

export function ConfirmDialog({
  isOpen,
  type = 'warning',
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  details,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-orange-500" />;
      case 'info':
        return <Info className="w-12 h-12 text-blue-600" />;
      case 'question':
        return <HelpCircle className="w-12 h-12 text-gray-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'question':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ul className="space-y-2">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for programmatic usage
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    details?: string[];
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
  });

  const confirm = (options: {
    type?: DialogType;
    title: string;
    message: string;
    details?: string[];
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: options.type || 'warning',
        title: options.title,
        message: options.message,
        details: options.details,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (dialogState.onConfirm) {
      // Resolve with false if there's a pending confirmation
      Promise.resolve(false);
    }
  };

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
  };

  const DialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      type={dialogState.type}
      title={dialogState.title}
      message={dialogState.message}
      details={dialogState.details}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogComponent };
}
