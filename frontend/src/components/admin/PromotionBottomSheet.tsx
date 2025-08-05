import React, { useState, useEffect, useCallback } from 'react';
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

  // selectedMenu가 변경될 때 currentSelectedMenu 업데이트
  useEffect(() => {
    setCurrentSelectedMenu(selectedMenu);
  }, [selectedMenu]);

  // 바텀 시트 닫기 핸들러
  const handleCloseBottomSheet = useCallback(() => {
    onClose();
    setCurrentSelectedMenu(null);
  }, [onClose]);

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
          <div className="flex-1 overflow-y-auto">
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