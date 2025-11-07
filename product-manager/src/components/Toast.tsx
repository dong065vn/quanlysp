import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ message, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = message.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full
        ${getBackgroundColor()}
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
          {message.title}
        </h4>
        {message.message && (
          <p className="text-sm text-gray-600">{message.message}</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {messages.map((message) => (
          <Toast key={message.id} message={message} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

// Toast manager class for programmatic usage
class ToastManager {
  private listeners: Set<(messages: ToastMessage[]) => void> = new Set();
  private messages: ToastMessage[] = [];

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.messages]));
  }

  show(type: ToastType, title: string, message?: string, duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, type, title, message, duration };
    this.messages.push(toast);
    this.notify();
    return id;
  }

  success(title: string, message?: string, duration?: number) {
    return this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number) {
    return this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration?: number) {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number) {
    return this.show('info', title, message, duration);
  }

  remove(id: string) {
    this.messages = this.messages.filter(m => m.id !== id);
    this.notify();
  }

  clear() {
    this.messages = [];
    this.notify();
  }
}

export const toast = new ToastManager();
