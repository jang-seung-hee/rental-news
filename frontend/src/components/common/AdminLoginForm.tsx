import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LockClosedIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await signIn(email.trim(), password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // 에러는 useAdminAuth에서 처리됨
      console.error('로그인 에러:', error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <LockClosedIcon className="w-6 h-6 text-blue-600" />
            관리자 로그인
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            렌탈톡톡 관리 시스템에 접근하려면 관리자 권한이 필요합니다.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="관리자 이메일을 입력하세요"
                  className="w-full pl-10"
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          <div className="text-xs text-gray-500 text-center pt-4 border-t mt-6">
            관리자 권한이 필요한 작업입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginForm; 