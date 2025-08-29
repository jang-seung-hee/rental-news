import React, { useState, useCallback } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    options: { message: '' }
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const ConfirmComponent = () => (
    <ConfirmDialog
      isOpen={confirmState.isOpen}
      title={confirmState.options.title}
      message={confirmState.options.message}
      confirmText={confirmState.options.confirmText}
      cancelText={confirmState.options.cancelText}
      variant={confirmState.options.variant}
      onConfirm={confirmState.onConfirm || (() => {})}
      onCancel={confirmState.onCancel || (() => {})}
    />
  );

  return { confirm, ConfirmComponent };
};

export default useConfirm;
