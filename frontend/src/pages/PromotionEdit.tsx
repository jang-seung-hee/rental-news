import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

import { Alert, AlertDescription } from '../components/ui/alert';
import PromotionForm from '../components/admin/PromotionForm';
import { Promotion } from '../types';
import { getPromotionById, deletePromotion } from '../services/promotionService';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/use-toast';

const PromotionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, ConfirmComponent } = useConfirm();
  const { toast } = useToast();
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('프로모션을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 초기 로드
  useEffect(() => {
    loadPromotion();
  }, [id, loadPromotion]);

  // 편집 완료
  const handleEditSuccess = (promotionId: string) => {
    // 수정 완료 시 목록 페이지로 이동
    navigate('/promotions');
  };

  // 편집 취소
  const handleCancel = () => {
    // 취소 시 목록으로 이동
    navigate('/promotions');
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!promotion) return;

    const confirmed = await confirm({
      title: '프로모션 삭제',
      message: `정말로 "${promotion.title}" 프로모션을 삭제하시겠습니까?\n삭제된 프로모션은 복구할 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소'
    });

    if (!confirmed) {
      return;
    }

    try {
      const result = await deletePromotion(promotion.id);
      
      if (result.success) {
        toast({
          title: "삭제 완료",
          description: `"${promotion.title}" 프로모션이 삭제되었습니다.`,
        });
        navigate('/promotions');
      } else {
        toast({
          title: "삭제 실패",
          description: result.error || "프로모션 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "프로모션 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleCancel} variant="outline">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>프로모션을 찾을 수 없습니다.</AlertDescription>
        </Alert>
        <Button onClick={handleCancel} variant="outline">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로모션 수정</h1>
          <p className="text-gray-600 mt-2">프로모션 정보를 수정하세요</p>
        </div>
        <Button
          onClick={handleDelete}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          프로모션 삭제
        </Button>
      </div>

      <PromotionForm
        promotion={promotion}
        onSuccess={handleEditSuccess}
        onCancel={handleCancel}
      />

      {/* 커스텀 확인창 */}
      <ConfirmComponent />
    </div>
  );
};

export default PromotionEdit; 