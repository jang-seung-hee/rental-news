import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Promotion } from '../types';
import { getPromotionBySlugOrId } from '../services/promotionService';
import { getSystemSettings } from '../services/systemSettingsService';
import { recordPromotionView } from '../services/promotionStatsService';
import CustomTag from '../components/admin/CustomTag';
import { Alert, AlertDescription } from '../components/ui/alert';
import '../utils/promotionViewLightMode.css';
import linkErrorImage from '../assets/linkError_resize.png';

const PromotionViewPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [searchParams] = useSearchParams();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const viewRecordedRef = useRef<string | null>(null); // 조회 기록 중복 방지

  // 프로모션 데이터 로드 (slug 또는 ID 기반)
  const loadPromotion = useCallback(async () => {
    if (!identifier) {
      setError('프로모션을 찾을 수 없습니다.\n링크가 완전하지 않은 것 같으니, 문자를 받으셨다면 "모두보기"를 클릭하여 전체 링크가 나온 상태에서 클릭을 다시 해보세요');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getPromotionBySlugOrId(identifier);
      
      if (result.success && result.data) {
        setPromotion(result.data);
        
        // 중복 기록 방지: 같은 프로모션 ID에 대해 한 번만 기록
        if (viewRecordedRef.current !== result.data.id) {
          viewRecordedRef.current = result.data.id;
          
          console.log('🎯 조회수 기록 시작 - 프로모션 ID:', result.data.id);
          console.log('🎯 현재 환경:', {
            userAgent: navigator.userAgent,
            isMobile: /Mobi|Android/i.test(navigator.userAgent),
            isKakao: /KAKAOTALK/i.test(navigator.userAgent),
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            href: window.location.href
          });
          
          // 프로모션 조회 기록 (비동기적으로 처리하여 페이지 로딩에 영향 없음)
          recordPromotionView(result.data.id)
            .then(result => {
              console.log('🎉 조회수 기록 성공:', result);
            })
            .catch(error => {
              console.error('❌ 프로모션 조회 기록 실패:', error);
              console.error('❌ 에러 상세:', {
                message: error.message,
                code: error.code,
                stack: error.stack
              });
            });
        } else {
          console.log('🔄 이미 기록된 프로모션:', result.data.id);
        }
      } else {
        setError(result.error || '프로모션을 찾을 수 없습니다.\n링크가 완전하지 않은 것 같으니, 문자를 받으셨다면 "모두보기"를 클릭하여 전체 링크가 나온 상태에서 클릭을 다시 해보세요');
      }
    } catch (err) {
      setError('프로모션을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [identifier]);

  // 시스템 설정 로드
  const loadSystemSettings = useCallback(async () => {
    try {
      const settings = await getSystemSettings();
      setSystemSettings(settings);
    } catch (err) {
      console.error('시스템 설정을 불러올 수 없습니다:', err);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadPromotion();
    loadSystemSettings();
  }, [identifier, loadPromotion, loadSystemSettings]);

  // 메타태그 직접 설정 (React Helmet 보완용)
  useEffect(() => {
    if (promotion && systemSettings) {
      const title = systemSettings?.defaultTitle || `${promotion.title} - ${systemSettings?.siteName || '렌탈톡톡'}`;
      const description = systemSettings?.defaultDescription || promotion.content.replace(/<[^>]*>/g, '').substring(0, 160);
      
      console.log('🔧 직접 메타태그 설정 중...');
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Favicon URL:', systemSettings.faviconUrl);
      
      document.title = title;
      
      // 기존 description 메타태그 찾아서 업데이트
      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', description);
      } else {
        // 없으면 새로 생성
        descriptionMeta = document.createElement('meta');
        descriptionMeta.setAttribute('name', 'description');
        descriptionMeta.setAttribute('content', description);
        document.head.appendChild(descriptionMeta);
      }
      
      // 파비콘 직접 설정
      if (systemSettings.faviconUrl) {
        console.log('🔧 파비콘 직접 설정:', systemSettings.faviconUrl);
        
        // 기존 파비콘 제거
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        existingFavicons.forEach(link => link.remove());
        
        // 새 파비콘 추가
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = systemSettings.faviconUrl;
        document.head.appendChild(favicon);
        
        // Apple Touch Icon도 추가
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = systemSettings.faviconUrl;
        document.head.appendChild(appleTouchIcon);
        
        console.log('✅ 파비콘 설정 완료');
      }
    }
  }, [promotion, systemSettings]);

  // 메타태그 생성
  const generateMetaTags = () => {
    if (!promotion) return null;

    // 시스템 설정의 defaultTitle을 우선적으로 사용하고, 없으면 프로모션 제목 + 사이트명 사용
    const title = systemSettings?.defaultTitle || `${promotion.title} - ${systemSettings?.siteName || '렌탈톡톡'}`;
    const description = systemSettings?.defaultDescription || promotion.content.replace(/<[^>]*>/g, '').substring(0, 160);
    const imageUrl = promotion.imageUrl || systemSettings?.defaultImageUrl || '/promotionViewTitle_resize.png';
    const url = `${window.location.origin}/view/${promotion.slug || promotion.id}`;
    const siteName = systemSettings?.siteName || '렌탈톡톡';

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
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter Card 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* 추가 메타태그 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content={siteName} />
        <link rel="canonical" href={url} />
        
        {/* 파비콘 */}
        {systemSettings?.faviconUrl && (
          <link rel="icon" href={systemSettings.faviconUrl} />
        )}
        {systemSettings?.faviconUrl && (
          <link rel="apple-touch-icon" href={systemSettings.faviconUrl} />
        )}
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
            <div className="text-center mb-4">
              <img 
                src={linkErrorImage}
                alt="링크 오류" 
                className="mx-auto mb-4 max-w-[70%] h-auto"
              />
            </div>
            <Alert variant="destructive">
              <AlertDescription className="text-lg">
                {error || '프로모션을 찾을 수 없습니다.\n링크가 완전하지 않은 것 같으니, 문자를 받으셨다면 "모두보기"를 클릭하여 전체 링크가 나온 상태에서 클릭을 다시 해보세요'}
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
        <CustomTag promotion={promotion} hideElements={hideElements} systemSettings={systemSettings} />
      </div>
    </>
  );
};

export default PromotionViewPage; 