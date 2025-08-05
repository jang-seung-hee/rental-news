import React from 'react';
import { Button } from '../ui/button';

interface PromotionBottomNavigationProps {
  onMenuClick: (menuId: string) => void;
}

const PromotionBottomNavigation: React.FC<PromotionBottomNavigationProps> = ({ onMenuClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 bottom-navigation">
      <div className="max-w-lg mx-auto">
        <div className="hidden md:flex md:max-w-[800px] md:mx-auto">
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('application')}
            >
              신청방법?
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('existing-cancel')}
            >
              기존제품해지?
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('gift-payment')}
            >
              사은금은?
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('card-benefits')}
            >
              제휴카드는?
            </Button>
          </div>
        </div>
        <div className="md:hidden">
          <div className="grid grid-cols-4">
            <Button
              variant="ghost"
              className="h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('application')}
            >
              신청방법?
            </Button>
            <Button
              variant="ghost"
              className="h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('existing-cancel')}
            >
              기존제품해지?
            </Button>
            <Button
              variant="ghost"
              className="h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('gift-payment')}
            >
              사은금은?
            </Button>
            <Button
              variant="ghost"
              className="h-16 text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onMenuClick('card-benefits')}
            >
              제휴카드는?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBottomNavigation; 