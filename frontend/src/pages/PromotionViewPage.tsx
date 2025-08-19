import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Promotion } from '../types';
import { getPromotionBySlugOrId } from '../services/promotionService';
import CustomTag from '../components/admin/CustomTag';
import { Alert, AlertDescription } from '../components/ui/alert';
import '../utils/promotionViewLightMode.css';

const PromotionViewPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [searchParams] = useSearchParams();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로모션 데이터 로드 (slug 또는 ID 기반)
  const loadPromotion = useCallback(async () => {
    if (!identifier) {
      setError('프로모션 식별자가 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getPromotionBySlugOrId(identifier);
      
      if (result.success && result.data) {
        setPromotion(result.data);
      } else {
        setError(result.error || '프로모션을 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('프로모션을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [identifier]);

  // 초기 로드
  useEffect(() => {
    loadPromotion();
  }, [identifier, loadPromotion]);

  // 메타태그 생성
  const generateMetaTags = () => {
    if (!promotion) return null;

    const title = `${promotion.title} - 렌탈톡톡`;
    const description = promotion.content.replace(/<[^>]*>/g, '').substring(0, 160);
    const imageUrl = promotion.imageUrl || '/default-promotion-image.jpg';
    const url = `${window.location.origin}/view/${promotion.slug || promotion.id}`;

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`${promotion.target}, ${promotion.month}, 렌탈, 프로모션`} />
        
        {/* Open Graph 태그 */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="렌탈톡톡" />
        
        {/* Twitter Card 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* 추가 메타태그 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="렌탈톡톡" />
        <link rel="canonical" href={url} />
      </Helmet>
    );
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>로딩 중... - 렌탈톡톡</title>
        </Helmet>
        <div className="promotion-view-light-mode min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 loading-text">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !promotion) {
    return (
      <>
        <Helmet>
          <title>프로모션을 찾을 수 없습니다 - 렌탈톡톡</title>
        </Helmet>
        <div className="promotion-view-light-mode min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertDescription>
                {error || '프로모션을 찾을 수 없습니다.'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  // URL 파라미터에서 hideElements 값을 가져옴
  const hideElements = searchParams.get('hideElements');

  return (
    <>
      {generateMetaTags()}
      <div className="promotion-view-light-mode min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 promotion-view-bg">
        <CustomTag promotion={promotion} hideElements={hideElements} />
      </div>
    </>
  );
};

export default PromotionViewPage; 