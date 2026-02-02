'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            cancelRef.current?.focus();
          }}
          aria-describedby={description ? 'confirm-dialog-description' : undefined}
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {description && (
            <Dialog.Description id="confirm-dialog-description" className="mt-2 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-6 flex flex-wrap gap-2 justify-end">
            <Dialog.Close asChild>
              <button
                ref={cancelRef}
                type="button"
                className={cn(
                  'min-h-[44px] min-w-[44px] rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                disabled={loading}
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                'min-h-[44px] min-w-[44px] rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
                variant === 'danger'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  Aguarde...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
