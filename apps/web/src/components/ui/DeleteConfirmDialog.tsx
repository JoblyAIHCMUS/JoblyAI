'use client';

import React, { useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

interface DeleteConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteConfirmDialog({
    open,
    title = 'Delete item',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    loading = false,
    onOpenChange,
    onCancel,
    onConfirm,
}: DeleteConfirmDialogProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            cancelButtonRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const active = document.activeElement;

            if (
                e.key === 'Enter' &&
                open &&
                !loading &&
                active?.tagName !== 'INPUT' &&
                active?.tagName !== 'TEXTAREA'
            ) {
                onConfirm();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, loading]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-6 outline-none">
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-7 w-7 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="M12 8v4m0 4h.01"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        {title}
                    </DialogTitle>

                    {/* Description */}
                    <DialogDescription className="mt-2 text-sm text-gray-500">
                        {description}
                    </DialogDescription>

                    {/* Actions */}
                    <div className="mt-6 flex w-full gap-2">
                        <button
                            ref={cancelButtonRef}
                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                            onClick={onCancel}
                            disabled={loading}
                            type="button"
                        >
                            {cancelLabel}
                        </button>

                        <button
                            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700 
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                                        disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onConfirm}
                            disabled={loading}
                            type="button"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="opacity-25"
                                        />
                                        <path
                                            d="M22 12a10 10 0 00-10-10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="opacity-75"
                                        />
                                    </svg>
                                    Deleting...
                                </span>
                            ) : (
                                confirmLabel
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}