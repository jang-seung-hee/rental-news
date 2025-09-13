import React, { useState, useEffect, useCallback } from 'react';
import { Promotion } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import LazyImage from '../common/LazyImage';

import { renderPromotionContent, renderGreetingClosingContent } from '../../utils/promotionContentUtils';
import { getOtherProductsInfo } from '../../services/promotionService';
import { getSystemSettings } from '../../services/systemSettingsService';
import '../../utils/promotionContentStyles.css';
import PromotionSidebar from './PromotionSidebar';
import PromotionBottomSheet from './PromotionBottomSheet';
import PromotionBottomNavigation from './PromotionBottomNavigation';
import InactivePromotionNotice from '../common/InactivePromotionNotice';

interface CustomTagProps {
  promotion: Promotion;
  hideElements?: string | null;
  systemSettings?: any;
}

const CustomTag: React.FC<CustomTagProps> = ({ promotion, hideElements, systemSettings: propSystemSettings }) => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [otherProducts, setOtherProducts] = useState<{ [key: string]: { id: string; code: string; title: string } }>({});
  const [isLoadingOtherProducts, setIsLoadingOtherProducts] = useState(false);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [localSystemSettings, setLocalSystemSettings] = useState<any>(null);
  
  // props로 전달된 시스템 설정이 있으면 사용, 없으면 로컬에서 로드
  const systemSettings = propSystemSettings || localSystemSettings;

  // hideElements 파라미터 파싱
  const hiddenElements = hideElements ? hideElements.split(',').map(item => item.trim()) : [];

  // 시스템 설정 로드 (props로 전달되지 않은 경우에만)
  const loadSystemSettings = useCallback(async () => {
    if (propSystemSettings) return; // props로 전달된 경우 로드하지 않음
    
    try {
      const settings = await getSystemSettings();
      setLocalSystemSettings(settings);
    } catch (error) {
      console.error('시스템 설정을 불러올 수 없습니다:', error);
    }
  }, [propSystemSettings]);

  // 다른제품 정보 로드
  useEffect(() => {
    const loadOtherProducts = async () => {
      const otherProductIds = [
        promotion.otherProduct1,
        promotion.otherProduct2,
        promotion.otherProduct3,
        promotion.otherProduct4
      ];

      // 다른제품이 하나라도 있는 경우에만 로드
      if (otherProductIds.some(id => id)) {
        setIsLoadingOtherProducts(true);
        try {
          const result = await getOtherProductsInfo(otherProductIds);
          if (result.success && result.data) {
            setOtherProducts(result.data);
          }
        } catch (error) {
          // 다른제품 정보 로드 실패 시 무시하고 진행
        } finally {
          setIsLoadingOtherProducts(false);
        }
      }
    };

    loadOtherProducts();
    loadSystemSettings();
  }, [promotion, loadSystemSettings]);





  const formatMonth = (month: string) => {
    if (!month) return '-';
    try {
      const [year, monthNum] = month.split('-');
      return `${year}년 ${parseInt(monthNum)}월`;
    } catch (error) {
      return month;
    }
  };

  // 다른제품 링크 클릭 핸들러
  const handleOtherProductClick = (productCode: string) => {
    setSelectedProductCode(productCode);
    setIsSlidePanelOpen(true);
  };

  // 슬라이드 패널 닫기 핸들러
  const handleCloseSlidePanel = () => {
    setIsSlidePanelOpen(false);
    setSelectedProductCode(null);
  };

  // 다른제품이 있는지 확인
  const hasOtherProducts = Object.keys(otherProducts).length > 0;

  return (
    <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen pb-32">
      {/* 헤더 섹션 */}
      {!hiddenElements.includes('title') && (
        <div className="relative overflow-hidden rounded-b-4xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12"></div>
          
          {/* 하단 오른쪽 이미지 추가 */}
          <div className="absolute bottom-0 right-0 z-0">
            <img 
              src={promotion.isActive ? "/promotionViewTitle_resize.png" : "/ClosePromotionViewTitle_resize.png"} 
              alt="프로모션 뷰 타이틀" 
              className="w-auto h-36 object-contain"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm badge badge-secondary">
                {formatMonth(promotion.month)}
              </Badge>
              <Badge variant={promotion.isActive ? "default" : "secondary"} 
                     className={promotion.isActive ? "bg-green-400 text-white shadow-lg badge badge-default" : "bg-gray-400 text-white shadow-lg badge badge-secondary"}>
                {promotion.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-3 leading-tight whitespace-pre-line">
              {promotion.title}
            </h1>
            
            <div className="flex items-center gap-3">
              <p className="text-blue-100 text-base font-mono bg-white/10 px-3 py-1 rounded-lg inline-block">
                {promotion.code}
              </p>
              <p className="text-blue-100 text-base bg-white/10 px-3 py-1 rounded-md inline-block">
                렌탈톡톡만의 혜택
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 콘텐츠 섹션 */}
      <div className="px-0 space-y-8">
        {/* 타겟 고객그룹 */}
        {!hiddenElements.includes('target') && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl card">
            <CardContent className="p-6 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  타겟 고객그룹
                </h3>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border-l-4 border-indigo-400">
                <p className="text-lg font-semibold text-gray-900">{promotion.target}</p>
              </div>
            </CardContent>
          </Card>
        )}

                 {/* 인사말 */}
         {!hiddenElements.includes('greeting') && promotion.isActive && (
           <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl card">
             <CardContent className="p-6 card-content">
               <div className="flex items-center mb-4">
                 <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                 <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   인사말
                 </h3>
               </div>
               <div 
                 className="prose prose-lg max-w-none text-gray-900 leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: renderGreetingClosingContent(promotion.greeting) }}
               />
             </CardContent>
           </Card>
         )}

        {/* 프로모션 내용 */}
        {promotion.isActive && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl card">
            <CardContent className="p-6 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  프로모션 내용
                </h3>
              </div>
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderPromotionContent(promotion.content) }}
              />
            </CardContent>
          </Card>
        )}

        {/* 다른제품 혜택 보기 */}
        {hasOtherProducts && !hiddenElements.includes('otherProducts') && promotion.isActive && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl card">
            <CardContent className="p-6 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  다른제품 혜택 더 보기
                </h3>
              </div>
              <div className="space-y-3">
                {isLoadingOtherProducts ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-gray-600">다른제품 정보를 불러오는 중...</span>
                  </div>
                ) : (
                  Object.values(otherProducts).map((product) => (
                    <div key={product.id} className="group">
                      <button
                        onClick={() => handleOtherProductClick(product.id)}
                        className="w-full text-left p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 hover:border-teal-300 hover:from-teal-100 hover:to-cyan-100 transition-all duration-200 group-hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-sm text-gray-600 font-mono mt-1">
                              {product.code}
                            </p>
                          </div>
                          <div className="flex items-center text-teal-600 group-hover:text-teal-700 transition-colors">
                            <span className="text-sm font-medium mr-2">보기</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 매듭말 */}
        {!hiddenElements.includes('closing') && promotion.isActive && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl relative overflow-hidden card">
            {/* 배경 이미지 추가 */}
            <div className="absolute top-8 right-0 z-0">
              <img 
                src="/byebye_resize.png" 
                alt="매듭말 배경" 
                className="w-auto h-24 object-contain opacity-100"
              />
            </div>
            <CardContent className="p-6 relative z-10 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  매듭말
                </h3>
              </div>
              <div 
                className="prose prose-lg max-w-none text-gray-900 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderGreetingClosingContent(promotion.closing) }}
              />
            </CardContent>
          </Card>
        )}

        {/* 프로모션 종료 안내 */}
        {!promotion.isActive && (
          <InactivePromotionNotice systemSettings={systemSettings} />
        )}

        {/* 연락처 */}
        {!hiddenElements.includes('contact') && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 backdrop-blur-sm rounded-2xl relative overflow-hidden card">
            {/* 배경 이미지 추가 */}
            <div className="absolute top-0 right-0 z-0">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-30 transform translate-x-16 -translate-y-16"></div>
              <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-40"></div>
              <div className="absolute top-16 right-4 w-8 h-8 bg-gradient-to-br from-orange-200 to-red-300 rounded-full opacity-50"></div>
              
              {/* 추가 배경 패턴 - 더 넓게 펼쳐서 배치 */}
              <div className="absolute top-1 left-1 w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-25"></div>
              <div className="absolute bottom-1 left-1 w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full opacity-20"></div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br from-red-300 to-orange-400 rounded-full opacity-35"></div>
              <div className="absolute top-4 left-4 w-5 h-5 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full opacity-30"></div>
              
              {/* 왼쪽 아래쪽 추가 패턴 */}
              <div className="absolute bottom-8 left-8 w-14 h-14 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-25"></div>
              <div className="absolute bottom-12 left-4 w-8 h-8 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-30"></div>
              <div className="absolute bottom-6 left-12 w-6 h-6 bg-gradient-to-br from-red-200 to-orange-300 rounded-full opacity-35"></div>
            </div>
            <CardContent className="p-6 relative z-10 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  연락처
                </h3>
              </div>
                           <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                 {promotion.contact.split('\n').map((line, index) => {
                   const trimmedLine = line.trim();
                   if (!trimmedLine) return null;
                   
                   // URL 패턴을 더 정확하게 감지
                   const urlPattern = /(https?:\/\/[^\s]+)/g;
                   const hasUrl = urlPattern.test(trimmedLine);
                   
                   if (hasUrl) {
                     // URL을 추출하고 링크로 변환
                     const parts = trimmedLine.split(urlPattern);
                     return (
                       <div key={index} className="mb-2">
                         {parts.map((part, partIndex) => {
                           if (urlPattern.test(part)) {
                             return (
                               <a 
                                 key={partIndex}
                                 href={part} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="promotion-link"
                                 onClick={(e) => {
                                   e.preventDefault();
                                   window.open(part, '_blank', 'noopener,noreferrer');
                                 }}
                               >
                                 {part}
                               </a>
                             );
                           }
                           return part;
                         })}
                       </div>
                     );
                   }
                   
                   return (
                     <div key={index} className="mb-2">
                       {trimmedLine}
                     </div>
                   );
                 })}
               </div>
            </CardContent>
          </Card>
        )}

        {/* 이미지 */}
        {promotion.imageUrl && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden card">
            <CardContent className="p-6 card-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  첨부 이미지
                </h3>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <LazyImage 
                  src={promotion.imageUrl} 
                  alt="프로모션 이미지"
                  className="w-full h-64 object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 분리된 컴포넌트들 */}
      <PromotionBottomNavigation
        onMenuClick={(menuId: string) => {
          setSelectedMenu(menuId);
          setIsDialogOpen(true);
        }}
      />
      
      <PromotionBottomSheet 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          // selectedMenu 상태는 유지하여 스크롤 위치 보존
        }}
        selectedMenu={selectedMenu}
      />
      
      <PromotionSidebar
        isOpen={isSlidePanelOpen}
        onClose={handleCloseSlidePanel}
        selectedProductCode={selectedProductCode}
      />
    </div>
  );
};



export default CustomTag; 