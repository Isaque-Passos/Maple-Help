'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  // Focus trap: auto-focus o modal ao abrir
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 id="confirm-modal-title" className="text-lg font-bold text-zinc-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#E31837] hover:bg-red-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
