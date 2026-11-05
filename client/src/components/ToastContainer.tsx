import React from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { ToastItem, ToastType } from '../contexts/ToastContext';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <X className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-900/20';
      case 'error':
        return 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-900/20';
      case 'warning':
        return 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-900/20';
      case 'info':
      default:
        return 'bg-slate-900/95 text-white border-sky-500/40 shadow-sky-900/20';
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-[9999] space-y-2 max-w-[calc(100vw-32px)] w-[360px] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-slide-in ${getToastClasses(
            toast.type
          )}`}
        >
          <div className="flex items-center space-x-2.5 pr-2 truncate">
            <div className="p-1 rounded-lg bg-slate-800/80 border border-slate-700/50 shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <span className="text-xs font-semibold tracking-wide truncate">{toast.message}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 ml-2"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
