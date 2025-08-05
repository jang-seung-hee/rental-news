import React, { useState, useEffect, useCallback } from 'react';
import { Promotion } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { renderPromotionContent } from '../../utils/promotionContentUtils';
import { getPromotionById } from '../../services/promotionService';
import '../../utils/promotionSidebarLightMode.css';

interface PromotionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductCode: string | null;
}

const PromotionSidebar: React.FC<PromotionSidebarProps> = ({
  isOpen,
  onClose,
  selectedProductCode
}) => {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isLoadingSelectedPromotion, setIsLoadingSelectedPromotion] = useState(false);

  // 선택된 프로모션 로드
  useEffect(() => {
    const loadSelectedPromotion = async () => {
      if (!selectedProductCode) return;

      setIsLoadingSelectedPromotion(true);
      try {
        // Document ID를 사용하여 프로모션 조회
        const result = await getPromotionById(selectedProductCode);
        if (result.success && result.data) {
          setSelectedPromotion(result.data);
        }
      } catch (error) {
        console.error('선택된 프로모션 로드 실패:', error);
      } finally {
        setIsLoadingSelectedPromotion(false);
      }
    };

    loadSelectedPromotion();
  }, [selectedProductCode]);

  // 사이드바 닫기 핸들러
  const handleCloseSidebar = useCallback(() => {
    onClose();
    setSelectedPromotion(null);
  }, [onClose]);

  // 모바일 뒤로가기 버튼 처리
  useEffect(() => {
    if (isOpen) {
      // 사이드바가 열릴 때 history에 상태 추가
      const handlePopState = (event: PopStateEvent) => {
        // 뒤로가기 버튼이 눌렸을 때 사이드바가 열려있으면 닫기
        if (isOpen) {
          event.preventDefault();
          handleCloseSidebar();
          // history에 다시 추가하여 뒤로가기 상태 유지
          window.history.pushState(null, '', window.location.href);
        }
      };

      // 사이드바가 열릴 때 history에 상태 추가
      window.history.pushState(null, '', window.location.href);
      
      // popstate 이벤트 리스너 추가
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleCloseSidebar]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full max-w-2xl overflow-y-auto [&>button]:hidden !p-0 sheet-content promotion-sidebar-light-mode"
        style={{
          backgroundColor: 'white !important',
          color: '#1f2937 !important'
        }}
      >
        <SheetHeader className="pb-4 border-b border-gray-200 px-4 pt-4 sheet-header">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900 sheet-title">
              다른 제품 혜택
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseSidebar}
              className="h-8 w-8 p-0"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <SheetDescription className="text-gray-600 break-words sheet-description">
            {selectedPromotion ? selectedPromotion.title.replace(/\n/g, ' ') : '프로모션 제목입니다'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-1 flex flex-col h-full px-3 promotion-sidebar-content">
          {isLoadingSelectedPromotion ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : selectedPromotion ? (
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm rounded-lg card promotion-sidebar-card">
              <CardContent className="p-2 card-content">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-2"></div>
                  <h3 className="text-base font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    프로모션 내용
                  </h3>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed promotion-sidebar-prose"
                  dangerouslySetInnerHTML={{ __html: renderPromotionContent(selectedPromotion.content) }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-2 text-gray-500">
              프로모션 정보를 불러올 수 없습니다.
            </div>
          )}
          
          {/* 하단 닫기 버튼 */}
          <div className="mt-2 pt-2 border-t border-gray-200 pb-2">
            <Button
              onClick={handleCloseSidebar}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors btn-close"
            >
              닫기
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PromotionSidebar; 