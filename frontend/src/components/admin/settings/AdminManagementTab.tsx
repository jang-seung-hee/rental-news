import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '../../ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { 
  PlusIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { getAdmins, createAdmin, deleteAdmin } from '../../../services/adminService';
import { AdminUser } from '../../../types/auth';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useConfirm } from '../../../hooks/useConfirm';

const AdminManagementTab: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 새 관리자 추가 관련 상태
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { user } = useAdminAuth();
  const { confirm, ConfirmComponent } = useConfirm();

  // 관리자 목록 로드
  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminList = await getAdmins();
      setAdmins(adminList);
    } catch (err: any) {
      setError(err.message || '관리자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // 새 관리자 추가
  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (!user) {
      setError('현재 사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      setSuccess(null);

      const result = await createAdmin(newAdminEmail, newAdminPassword, user.uid);
      
      if (result.success) {
        setSuccess('새 관리자가 성공적으로 추가되었습니다.');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setIsAddDialogOpen(false);
        await loadAdmins(); // 목록 새로고침
      } else {
        setError(result.error || '관리자 추가에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '관리자 추가 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // 관리자 삭제
  const handleDeleteAdmin = async (adminToDelete: AdminUser) => {
    if (!user) {
      setError('현재 사용자 정보를 찾을 수 없습니다.');
      return;
    }

    // 자기 자신 삭제 방지
    if (adminToDelete.uid === user.uid) {
      setError('자기 자신은 삭제할 수 없습니다.');
      return;
    }

    const confirmed = await confirm({
      title: '관리자 삭제',
      message: `정말로 "${adminToDelete.email}" 관리자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소'
    });

    if (!confirmed) return;

    try {
      setError(null);
      setSuccess(null);

      const result = await deleteAdmin(adminToDelete.uid, user.uid);
      
      if (result.success) {
        setSuccess('관리자가 성공적으로 삭제되었습니다.');
        await loadAdmins(); // 목록 새로고침
      } else {
        setError(result.error || '관리자 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    return timestamp.toDate ? timestamp.toDate().toLocaleString('ko-KR') : 
           new Date(timestamp).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">관리자 계정 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            시스템 관리자 계정을 추가하거나 삭제할 수 있습니다.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              관리자 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                새 관리자 추가
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">이메일</Label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="새 관리자 이메일"
                    className="pl-10"
                    disabled={isCreating}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="비밀번호 (최소 6자)"
                  disabled={isCreating}
                />
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                새로 생성된 관리자는 즉시 시스템에 접근할 수 있습니다.
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isCreating}
              >
                취소
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={isCreating || !newAdminEmail || !newAdminPassword}
              >
                {isCreating ? '생성 중...' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 관리자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            관리자 목록 ({admins.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 관리자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>생성일시</TableHead>
                    <TableHead>생성자</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{admin.email}</div>
                            {admin.uid === user?.uid && (
                              <div className="text-xs text-blue-600">현재 사용자</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(admin.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {admin.createdBy === admin.uid ? '시스템' : admin.createdBy}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin)}
                          disabled={admin.uid === user?.uid}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 주의사항 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-amber-800 mb-2">주의사항</h4>
              <ul className="text-amber-700 space-y-1">
                <li>• 관리자 계정은 시스템의 모든 기능에 접근할 수 있습니다.</li>
                <li>• 삭제된 관리자는 즉시 시스템 접근이 차단됩니다.</li>
                <li>• 자기 자신의 계정은 삭제할 수 없습니다.</li>
                <li>• 관리자 추가/삭제 작업은 로그로 기록됩니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 확인 다이얼로그 */}
      <ConfirmComponent />
    </div>
  );
};

export default AdminManagementTab;
