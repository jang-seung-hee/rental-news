import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import BottomSheetContent from './BottomSheetContent';

interface PromotionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMenu: string | null;
}

const PromotionBottomSheet: React.FC<PromotionBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedMenu
}) => {
  const menuItems = [
    { id: 'application', title: '신청방법?' },
    { id: 'existing-cancel', title: '기존제품해지?' },
    { id: 'gift-payment', title: '사은금은?' },
    { id: 'card-benefits', title: '제휴카드는?' }
  ];

  const [currentSelectedMenu, setCurrentSelectedMenu] = useState<string | null>(selectedMenu);
  // 각 메뉴별 스크롤 위치를 저장할 상태 추가
  const [scrollPositions, setScrollPositions] = useState<{[key: string]: number}>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false); // 스크롤 복원 중인지 추적
  const lastScrollPosition = useRef<number>(0); // 마지막 스크롤 위치 추적

  // selectedMenu가 변경될 때 currentSelectedMenu 업데이트
  useEffect(() => {
    setCurrentSelectedMenu(selectedMenu);
  }, [selectedMenu]);

  // 바텀 시트 닫기 핸들러 - 스크롤 위치 저장 로직 추가
  const handleCloseBottomSheet = useCallback(() => {
    // 현재 메뉴의 스크롤 위치를 저장
    if (currentSelectedMenu && scrollRef.current) {
      setScrollPositions(prev => ({
        ...prev,
        [currentSelectedMenu]: scrollRef.current!.scrollTop
      }));
    }
    onClose();
    // selectedMenu 상태를 null로 초기화하지 않음 - 스크롤 위치 유지를 위해
  }, [onClose, currentSelectedMenu]);

  // 바텀시트가 열릴 때 저장된 스크롤 위치 복원
  useEffect(() => {
    if (isOpen && currentSelectedMenu && scrollRef.current) {
      const savedPosition = scrollPositions[currentSelectedMenu] || 0;
      // 스크롤 복원 중임을 표시
      isRestoringScroll.current = true;
      lastScrollPosition.current = savedPosition;
      
      // 애니메이션 완료 후 스크롤 위치 복원
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = savedPosition;
          // 복원 완료 후 플래그 해제
          setTimeout(() => {
            isRestoringScroll.current = false;
          }, 100);
        }
      }, 150);
    }
  }, [isOpen, currentSelectedMenu]); // scrollPositions 의존성 제거

  // 바텀시트가 완전히 닫힐 때만 selectedMenu 초기화
  useEffect(() => {
    if (!isOpen) {
      // 바텀시트가 완전히 닫힌 후 약간의 지연을 두고 selectedMenu 초기화
      const timer = setTimeout(() => {
        setCurrentSelectedMenu(null);
      }, 300); // 애니메이션 완료 후 초기화
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 스크롤 이벤트로 실시간 위치 업데이트 - 무한 루프 방지
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (currentSelectedMenu && !isRestoringScroll.current) {
      const scrollTop = event.currentTarget.scrollTop;
      // 스크롤 위치가 실제로 변경되었을 때만 저장
      if (Math.abs(scrollTop - lastScrollPosition.current) > 5) {
        lastScrollPosition.current = scrollTop;
        setScrollPositions(prev => ({
          ...prev,
          [currentSelectedMenu]: scrollTop
        }));
      }
    }
  }, [currentSelectedMenu]);

  // 모바일 뒤로가기 버튼 처리
  useEffect(() => {
    if (isOpen) {
      // 바텀시트가 열릴 때 history에 상태 추가
      const handlePopState = (event: PopStateEvent) => {
        // 뒤로가기 버튼이 눌렸을 때 바텀시트가 열려있으면 닫기
        if (isOpen) {
          event.preventDefault();
          handleCloseBottomSheet();
          // history에 다시 추가하여 뒤로가기 상태 유지
          window.history.pushState(null, '', window.location.href);
        }
      };

      // 바텀시트가 열릴 때 history에 상태 추가
      window.history.pushState(null, '', window.location.href);
      
      // popstate 이벤트 리스너 추가
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleCloseBottomSheet]);

  const getMenuTitle = (menuId: string) => {
    const menu = menuItems.find(item => item.id === menuId);
    return menu ? menu.title : '';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto sheet-content">
        <SheetHeader className="pb-4 border-b border-gray-200 sheet-header">
          <SheetTitle className="text-2xl font-bold text-gray-900 sheet-title">
            {getMenuTitle(currentSelectedMenu || '')}
          </SheetTitle>
          <SheetDescription className="text-lg text-gray-600 sheet-description">
            상세 정보를 확인하세요
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            onScroll={handleScroll}
          >
            <BottomSheetContent selectedMenu={currentSelectedMenu} />
          </div>
          {/* 하단 닫기 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-200 pb-4">
            <Button
              onClick={handleCloseBottomSheet}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-lg py-3 rounded-lg transition-colors btn-close"
            >
              닫기
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PromotionBottomSheet; 