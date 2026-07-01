'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  zIndex?: number;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    { isOpen, onClose, children, className, overlayClassName, zIndex = 50 },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!isOpen) return;

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
      <>
        {/* Backdrop Overlay */}
        <div
          className={cn(
            'fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity',
            overlayClassName
          )}
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
          role="presentation"
        />

        {/* Modal Container */}
        <div
          ref={ref}
          className={cn(
            'fixed left-1/2 top-1/2 max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white shadow-2xl',
            'transform transition-all duration-200 ease-out',
            'animate-in fade-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]',
            'max-w-xl',
            className
          )}
          style={{ zIndex }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader = ({ onClose }: ModalHeaderProps) => (
  <div className="flex items-end justify-end p-6 pb-0">
    <button
      onClick={onClose}
      className="text-slate-600 transition-colors hover:text-slate-900 focus:outline-none"
      aria-label="Close modal"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn('px-6 pb-6 pt-4', className)}>{children}</div>;
