import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import PromotionDetailView from '../components/admin/PromotionDetailView';
import PromotionForm from '../components/admin/PromotionForm';
import { Promotion } from '../types';
import { getPromotionById, deletePromotion } from '../services/promotionService';

interface PromotionDetailProps {
  onBackToList: () => void;
}

const PromotionDetail: React.FC<PromotionDetailProps> = ({ onBackToList }) => {
  const { id } = useParams<{ id: string }>();
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 프로모션 데이터 로드
  const loadPromotion = useCallback(async () => {
    if (!id) {
      setError('프로모션 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getPromotionById(id);
      
      if (result.success && result.data) {
        setPromotion(result.data);
      } else {
        setError(result.error || '프로모션을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Load promotion error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 초기 로드
  useEffect(() => {
    loadPromotion();
  }, [id, loadPromotion]);

  // 편집 모드 전환
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // 편집 완료
  const handleEditSuccess = (promotionId: string) => {
    setIsEditMode(false);
    // 수정된 데이터 다시 로드
    loadPromotion();
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!promotion) return;

    try {
      setIsDeleting(true);
      setError(null);

      const result = await deletePromotion(promotion.id);
      
      if (result.success) {
        // 삭제 성공 시 목록으로 이동
        onBackToList();
      } else {
        setError(result.error || '프로모션 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Delete promotion error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      onBackToList();
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로모션 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로모션 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={handleBack} variant="outline">
              뒤로가기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 프로모션이 없는 경우
  if (!promotion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로모션 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>프로모션을 찾을 수 없습니다.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={handleBack} variant="outline">
              뒤로가기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 편집 모드
  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            className="flex items-center gap-2"
          >
            ← 편집 취소
          </Button>
          <h1 className="text-2xl font-bold">프로모션 수정</h1>
        </div>
        
        <PromotionForm
          promotion={promotion}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  // 읽기 전용 모드
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">프로모션 상세</h1>
      </div>

      <PromotionDetailView
        promotion={promotion}
        onEdit={handleEdit}
        onDelete={() => {}} // AlertDialog에서 처리
        onBack={handleBack}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            className="hidden"
            id="delete-trigger"
          >
            삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로모션 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 프로모션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              <br />
              <strong>제목: {promotion.title}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromotionDetail; 