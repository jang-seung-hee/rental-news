import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';

interface ShortUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shortUrl: string) => void;
  currentShortUrl?: string;
  promotionTitle: string;
}

const ShortUrlDialog: React.FC<ShortUrlDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentShortUrl = '',
  promotionTitle
}) => {
  const [shortUrl, setShortUrl] = useState(currentShortUrl);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!shortUrl.trim()) {
      toast({
        title: "입력 오류",
        description: "단축 URL을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // URL 형식 검증
    try {
      new URL(shortUrl);
    } catch {
      toast({
        title: "URL 형식 오류",
        description: "올바른 URL 형식으로 입력해주세요. (예: https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(shortUrl.trim());
      toast({
        title: "저장 완료",
        description: "단축 URL이 성공적으로 저장되었습니다.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "단축 URL 저장에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShortUrl(currentShortUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>단축 URL 등록</DialogTitle>
          <DialogDescription>
            프로모션 "{promotionTitle}"의 단축 URL을 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shortUrl" className="text-right">
              단축 URL
            </Label>
            <Input
              id="shortUrl"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="https://example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShortUrlDialog; 