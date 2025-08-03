import React from 'react';

interface BottomSheetContentProps {
  selectedMenu: string | null;
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ selectedMenu }) => {
  const renderApplicationContent = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">신청 방법 안내</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">온라인 신청</p>
              <p className="text-sm text-gray-600 mt-1">고객센터 홈페이지에서 신청서를 작성해주세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">필수 서류 제출</p>
              <p className="text-sm text-gray-600 mt-1">신분증 사본, 소득증빙서류를 첨부해주세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">심사 및 승인</p>
              <p className="text-sm text-gray-600 mt-1">제출된 서류 검토 후 3-5일 내 승인 여부를 알려드립니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <p className="font-medium">혜택 적용</p>
              <p className="text-sm text-gray-600 mt-1">승인 완료 후 즉시 혜택이 적용됩니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h4 className="text-md font-semibold text-yellow-900 mb-2">주의사항</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 신청서 작성 시 모든 항목을 정확히 기재해주세요</li>
          <li>• 서류 제출 후 추가 요청사항이 있을 수 있습니다</li>
          <li>• 신청 조건에 맞지 않는 경우 승인이 거절될 수 있습니다</li>
          <li>• 문의사항은 고객센터로 연락해주세요</li>
        </ul>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h4 className="text-md font-semibold text-green-900 mb-2">연락처</h4>
        <div className="text-sm text-gray-700">
          <p><strong>고객센터:</strong> 1588-1234</p>
          <p><strong>운영시간:</strong> 평일 09:00-18:00</p>
          <p><strong>이메일:</strong> support@example.com</p>
        </div>
      </div>
    </div>
  );

  const renderCardBenefitsContent = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">준비중</p>
      <p className="text-gray-600">제휴카드혜택 정보는 현재 개발 중입니다.</p>
    </div>
  );

  const renderExistingCancelContent = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">기존 제품 해지 안내</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">해지 신청</p>
              <p className="text-sm text-gray-600 mt-1">기존 제품 해지를 원하시면 고객센터로 연락해주세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">서류 확인</p>
              <p className="text-sm text-gray-600 mt-1">신분증과 기존 계약서를 준비해주세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">해지 처리</p>
              <p className="text-sm text-gray-600 mt-1">신청 후 3-5일 내 해지 처리가 완료됩니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
        <h4 className="text-md font-semibold text-red-900 mb-2">주의사항</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 해지 시 위약금이 발생할 수 있습니다</li>
          <li>• 해지 후 재가입 시 제한이 있을 수 있습니다</li>
          <li>• 해지 전 혜택 사용 여부를 확인해주세요</li>
        </ul>
      </div>
    </div>
  );

  const renderGiftPaymentContent = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h3 className="text-lg font-semibold text-green-900 mb-3">사은금 지급 안내</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">지급 조건</p>
              <p className="text-sm text-gray-600 mt-1">신규 가입 후 3개월 이상 유지 시 지급됩니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">지급 금액</p>
              <p className="text-sm text-gray-600 mt-1">가입 상품에 따라 10만원~50만원까지 지급됩니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">지급 방법</p>
              <p className="text-sm text-gray-600 mt-1">등록된 계좌로 자동 이체됩니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h4 className="text-md font-semibold text-blue-900 mb-2">지급 일정</h4>
        <div className="text-sm text-gray-700">
          <p><strong>신규 가입:</strong> 가입 후 3개월</p>
          <p><strong>기존 고객:</strong> 프로모션 신청 후 1개월</p>
          <p><strong>지급일:</strong> 매월 15일</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'application':
        return renderApplicationContent();
      case 'existing-cancel':
        return renderExistingCancelContent();
      case 'gift-payment':
        return renderGiftPaymentContent();
      case 'card-benefits':
        return renderCardBenefitsContent();
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      {renderContent()}
    </div>
  );
};

export default BottomSheetContent; 