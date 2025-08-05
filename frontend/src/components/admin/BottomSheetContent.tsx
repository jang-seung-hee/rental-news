import React from 'react';

interface BottomSheetContentProps {
  selectedMenu: string | null;
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ selectedMenu }) => {
  const renderApplicationContent = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h3 className="text-xl font-bold text-blue-900 mb-3">신청방법</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="text-lg font-semibold">제품 결정 및 연락</p>
              <p className="text-base text-gray-600 mt-1">제품 결정을 하시면 <span className="font-bold text-blue-700">저에게 톡이나, 문자등 연락을 먼저 주세요</span></p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="text-lg font-semibold">접수 안내 및 도움</p>
              <p className="text-base text-gray-600 mt-1">선택하신 제품에 따라, 회사에 따라 접수방법이 다르므로 제가 문자로 간단히 접수에 필요한 내용 안내드리고 접수 도와드리겠습니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h4 className="text-lg font-bold text-green-900 mb-2">연락 및 접수 안내</h4>
        <div className="text-base text-gray-700 space-y-3">
          <p>저에게 연락은 <span className="font-bold text-green-700">명의자분이 아니어도 상관 없습니다</span>. 배우자나 부모님을 대신해 접수에 필요한 인적사항 및 주소, 결재 정보등을 전달 해 주시면 되며,</p>
          <p>접수 후, <span className="font-bold text-green-700">모바일 인증 및 해피콜 등의 절차만 명의자분이 하시면 됩니다</span>.</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h4 className="text-lg font-bold text-yellow-900 mb-2">중요 주의사항</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p className="text-lg font-bold">제품 링크 사용 시 주의사항</p>
          <p>제품링크는 제품의 기능, 디자인으로 참고만 하시고, <span className="font-bold text-red-600">본사몰에서 신청하시면 사은금 받을 수 없으니 주의 하세요</span>.</p>
        </div>
      </div>
    </div>
  );

  const renderCardBenefitsContent = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h3 className="text-xl font-bold text-blue-900 mb-3">제휴카드 할인 제도</h3>
        <div className="space-y-4 text-gray-700">
          <p className="text-base">제휴카드 할인은 렌탈회사와 제휴된 신용카드로 요금 자동납부를 하면 카드사에서 렌탈 요금을 할인해 주는 제도입니다.</p>
          
          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
            <h4 className="text-lg font-bold text-yellow-900 mb-2">할인 조건</h4>
            <p className="text-base">월 신용카드를 <span className="font-bold text-yellow-700">30~40만원 정도 사용하신다면</span>, 카드사에서 렌탈요금을 청구시 할인을 해 주는 것입니다.</p>
            <p className="text-base mt-2">필수는 아니므로, 카드 쓰기 귀찮으시다면 안해도 되지만, 카드는 어짜피 쓰는 것이라면 부담이 적다면 좋은 제도입니다.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h4 className="text-lg font-bold text-green-900 mb-2">할인 금액 안내</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>일반적으로 제휴카드는 종류가 너무 많기 때문에 평균적으로 월 30~40만원 이용시에 대부분 <span className="font-bold text-green-700">15,000원 정도는 할인</span> 받고 계시므로 이를 기준으로 참고로 계산 드렸습니다.</p>
          <p className="text-lg font-semibold mt-3">제휴카드는 각 회사별로 5~8개로 다양하니 문의 주시면 카드사 요금 할인 정보를 바로 보내드리겠습니다.</p>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h4 className="text-lg font-bold text-green-900 mb-2">적용 시점 안내</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>제휴카드는 정수기 접수때는 없어도 관계 없습니다,</p>
          <p className="text-lg font-semibold">첫달 부터 적용하시려면 정수기 설치 받으시고 첫 요금 나오기 전까지만 발급받으셔서 요금이체 걸어두시면 첫달부터 할인됩니다 ^^</p>
        </div>
      </div>
    </div>
  );

  const renderExistingCancelContent = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
        <h3 className="text-xl font-bold text-orange-900 mb-3">타사보상 기존 제품 해지 안내</h3>
        <div className="space-y-4 text-gray-700">
          <p className="text-base">타사보상으로 접수 하시는 경우 기존 제품의 해지는 다음을 참고 하세요</p>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h4 className="text-lg font-bold text-blue-900 mb-2">코웨이, 엘지 타사변경</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>기존 정수기는 <span className="font-bold text-blue-700">설치날까지 반드시 가지고 있어야 합니다</span>. 설치날 기사가 증빙사진을 남겨야 타사보상으로 인정이 되니, 새 제품을 설치 받으시고 난 후 기존 회사에 연락해 해지 신청 하시고, 기존 회사로 반납 하세요 (설치때 떼어 드립니다)</p>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
        <h4 className="text-lg font-bold text-purple-900 mb-2">SK매직 타사변경</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p><span className="font-bold text-purple-700">SK매직 설치기사 방문 전에 기존 제품은 해지 후, 반납한 상태여야 SK매직 설치가 가능합니다</span>.</p>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h4 className="text-lg font-bold text-green-900 mb-2">기타 회사</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>그 밖에 회사는 편하실때로 하시면 되는데, <span className="font-bold text-green-700">권장드리는 방법은 설치 받고 해지하시는 것입니다</span>. 설치날 기존 정수기는 기사님이 철거는 해드리, 해지 신청 하시고 반납만 기존 회사로 하시면 됩니다.</p>
        </div>
      </div>
      
      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
        <h4 className="text-lg font-bold text-red-900 mb-2">중요 주의사항</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p><span className="font-bold text-red-700">5년 만기가 안되었고, 3년의무만 지난 제품은 꼭 원래 회사로 반납해야 합니다</span>. 다른회사 설치기사가 가지고 가면 분실료를 지불 해야 합니다.</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h4 className="text-lg font-bold text-yellow-900 mb-2">문의 안내</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>잘 모르시겠으면 저에게 꼭 물어 보세요~ 언제든지 질문 환영입니다.</p>
        </div>
      </div>
    </div>
  );

  const renderGiftPaymentContent = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
        <h3 className="text-xl font-bold text-green-900 mb-3">사은금 지급 안내</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="text-lg font-semibold">지급 방식</p>
              <p className="text-base text-gray-600 mt-1">사은금은 적어드린 금액 그대로 <span className="font-bold text-green-700">현금으로 송금</span>드리고 있습니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="text-lg font-semibold">지급 시점</p>
              <p className="text-base text-gray-600 mt-1"><span className="font-bold text-green-700">설치날 설치만 확인되면 지체 없이 전액 송금</span>드리고 있습니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="text-lg font-semibold">송금 계좌</p>
              <p className="text-base text-gray-600 mt-1">사은금은 고객님께서 원하시는 계좌로 송금드리고 있으니 <span className="font-bold text-green-700">명의자 통장이 아니어도 관계 없습니다</span>.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
        <h4 className="text-lg font-bold text-blue-900 mb-2">사은금 지급 원리</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>사은금은 저희 계약 수당을 고객님께 페이백 드리는 것으로 <span className="font-bold text-blue-700">계약수당이 나오지 않는 건은 사은금이 지급되지 않으니 주의 하세요</span></p>
        </div>
      </div>
      
      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
        <h4 className="text-lg font-bold text-red-900 mb-2">변칙 영업 판단 기준</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>본사가 변칙 영업으로 판단하는 경우 수당은 0원이 되고, 사은금이 나오지 않는 대표적 경우입니다.</p>
          <div className="space-y-1 mt-3">
            <p className="text-base font-semibold">1. 같은 명의로 렌탈한 같은회사 제품이 있고, 9개월 이전에 해지한 건이 있는 경우</p>
            <p className="text-base font-semibold">2. 같은 명의로 렌탈한 같은 회사 제품이 있고, 9개월 이후에 해지하는 건이 발생하는 경우</p>
            <p className="text-base font-semibold">3. 해당 렌탈 제품을 12개월 이내에 해지하는 경우</p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h4 className="text-lg font-bold text-yellow-900 mb-2">안전한 제품 안내</h4>
        <div className="text-base text-gray-700 space-y-2">
          <p>이런 경우에 있다면 저에게 꼭 해당 회사를 알려주세요, <span className="font-bold text-yellow-700">문제가 될 회사는 피해서 안전한 제품들로 안내</span>드리겠습니다!</p>
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