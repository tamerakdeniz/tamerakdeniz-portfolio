'use client';

import { useState, useCallback, useEffect } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  exiting?: boolean;
}

let addToastFn: ((message: string, type?: ToastItem['type'], duration?: number) => void) | null = null;

export function showToast(message: string, type: ToastItem['type'] = 'info', duration = 4000) {
  addToastFn?.(message, type, duration);
}

const icons: Record<string, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const colors: Record<string, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

const iconBg: Record<string, string> = {
  success: 'bg-green-500/10 text-green-500',
  error: 'bg-red-500/10 text-red-500',
  warning: 'bg-amber-500/10 text-amber-500',
  info: 'bg-blue-500/10 text-blue-500',
};

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastItem['type'] = 'info', duration = 4000) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);
    },
    []
  );

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] max-w-[400px] p-4 bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-white/10 flex items-center gap-3 pointer-events-auto border-l-4 ${colors[toast.type]} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
        >
          <span
            className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm ${iconBg[toast.type]}`}
          >
            <span className="material-symbols-outlined text-base">
              {icons[toast.type]}
            </span>
          </span>
          <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
            {toast.message}
          </span>
          <button
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
