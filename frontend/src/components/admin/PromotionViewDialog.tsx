import React from 'react';
import { Promotion } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import PromotionView from './PromotionView';

interface PromotionViewDialogProps {
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromotionViewDialog: React.FC<PromotionViewDialogProps> = ({
  promotion,
  isOpen,
  onClose
}) => {
  if (!promotion) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            프로모션 뷰
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <PromotionView promotion={promotion} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionViewDialog; 