import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Promotion } from '../types';
import { getPromotionById } from '../services/promotionService';
import CustomTag from '../components/admin/CustomTag';
import { Alert, AlertDescription } from '../components/ui/alert';

const PromotionViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
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
        setError(result.error || '프로모션을 찾을 수 없습니다.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>
              {error || '프로모션을 찾을 수 없습니다.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // URL 파라미터에서 hideElements 값을 가져옴
  const hideElements = searchParams.get('hideElements');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <CustomTag promotion={promotion} hideElements={hideElements} />
    </div>
  );
};

export default PromotionViewPage; 