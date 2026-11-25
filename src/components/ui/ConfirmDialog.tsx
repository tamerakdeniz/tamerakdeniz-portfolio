'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/components/portfolio/useDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const dialogRef = useDialog<HTMLDivElement>(isOpen, onCancel);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            className="bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6 max-w-[400px] w-[90%]"
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={id} className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                onClick={onCancel}
              >
                {cancelLabel ?? t('admin-cancel')}
              </button>
              <button
                className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-blue-700'
                }`}
                onClick={onConfirm}
              >
                {confirmLabel ?? t('admin-confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
