import React from 'react';
import { Card, CardContent } from '../ui/card';
import { SystemSettings } from '../../types/systemSettings';

interface InactivePromotionNoticeProps {
  systemSettings?: SystemSettings | null;
}

const InactivePromotionNotice: React.FC<InactivePromotionNoticeProps> = ({ 
  systemSettings 
}) => {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl card">
      <CardContent className="p-6 card-content">
        <div className="flex items-center mb-5">
          <div className="w-1 h-8 bg-gray-600 rounded-full mr-4"></div>
          <h3 className="text-xl font-bold text-black">
            프로모션 종료 안내
          </h3>
        </div>
        
        <div className="space-y-5">
          {/* 프로모션 종료 박스 */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-5">
            <p className="text-lg font-semibold text-black mb-2">
              {systemSettings?.inactivePromotionTitle || '프로모션 종료'}
            </p>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {systemSettings?.inactivePromotionMessage || '죄송합니다. 해당 프로모션은 종료되었습니다.'}
            </p>
          </div>
          
          {/* 안내사항 박스 */}
          <div className="bg-white border border-gray-300 rounded-lg p-5">
            <p className="text-lg font-semibold text-black mb-2">
              안내사항
            </p>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {systemSettings?.inactivePromotionGuide || '해당 프로모션은 마감되었으므로 접수를 하실 수 없으니, 다시시 연락 주시면 진행중인 프로모션으로 링크 드리겠습니다. '}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactivePromotionNotice;
