import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AdminPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPasswordDialog: React.FC<AdminPasswordDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 하드코딩된 비밀번호
  const ADMIN_PASSWORD = 'psa1125^^';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 비밀번호 검증
    if (password === ADMIN_PASSWORD) {
      // 성공 시 로컬 스토리지에 관리자 인증 상태 저장
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminAuthTimestamp', Date.now().toString());
      onSuccess();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <LockClosedIcon className="w-5 h-5 text-blue-600" />
            관리자 모드 진입
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              관리자 비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full"
              autoFocus
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? '확인 중...' : '진입'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          관리자 권한이 필요한 작업입니다.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordDialog; 