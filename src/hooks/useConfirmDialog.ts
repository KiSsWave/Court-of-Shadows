import { useState, useCallback } from 'react';

interface ConfirmOptions {
  icon?: string;
  title?: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  confirmClass?: string;
}

interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
  infoOnly?: boolean;
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      setDialog({ ...options, resolve });
    });
  }, []);

  const info = useCallback((options: Omit<ConfirmOptions, 'cancelText' | 'confirmClass'>): Promise<void> => {
    return new Promise<void>(resolve => {
      setDialog({
        ...options,
        resolve: () => resolve(),
        infoOnly: true,
        confirmText: options.confirmText ?? 'OK',
      } as DialogState);
    });
  }, []);

  const onConfirm = useCallback(() => {
    if (dialog) {
      dialog.resolve(true);
      setDialog(null);
    }
  }, [dialog]);

  const onCancel = useCallback(() => {
    if (dialog) {
      dialog.resolve(false);
      setDialog(null);
    }
  }, [dialog]);

  return { dialog, confirm, info, onConfirm, onCancel };
}
