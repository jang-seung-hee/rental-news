import React, { useState, useEffect } from 'react';
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

  const getMenuTitle = (menuId: string) => {
    const menu = menuItems.find(item => item.id === menuId);
    return menu ? menu.title : '';
  };

  // 바텀 시트 닫기 핸들러
  const handleCloseBottomSheet = () => {
    onClose();
    setCurrentSelectedMenu(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto sheet-content">
        <SheetHeader className="pb-4 border-b border-gray-200 sheet-header">
          <SheetTitle className="text-xl font-bold text-gray-900 sheet-title">
            {getMenuTitle(currentSelectedMenu || '')}
          </SheetTitle>
          <SheetDescription className="text-gray-600 sheet-description">
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors btn-close"
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