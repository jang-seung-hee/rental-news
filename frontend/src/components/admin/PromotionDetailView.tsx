import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import LazyImage from '../common/LazyImage';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { renderPromotionContent } from '../../utils/promotionContentUtils';
import { getPromotionById } from '../../services/promotionService';
import { copyToClipboard } from '../../utils/clipboardUtils';
import '../../utils/promotionContentStyles.css';

interface PromotionDetailViewProps {
  promotion: Promotion;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const PromotionDetailView: React.FC<PromotionDetailViewProps> = ({
  promotion,
  onEdit,
  onDelete,
  onBack
}) => {
  const [otherProducts, setOtherProducts] = useState<{
    [key: string]: { code: string; title: string } | null;
  }>({});

  // 다른제품 정보 조회
  useEffect(() => {
    const fetchOtherProducts = async () => {
      const productIds = [
        promotion.otherProduct1,
        promotion.otherProduct2,
        promotion.otherProduct3,
        promotion.otherProduct4
      ].filter(Boolean);

      const products: { [key: string]: { code: string; title: string } | null } = {};

      for (const id of productIds) {
        if (id) {
          try {
            const result = await getPromotionById(id);
            if (result.success && result.data) {
              products[id] = {
                code: result.data.code,
                title: result.data.title
              };
            } else {
              products[id] = null;
            }
          } catch (error) {
            // 다른제품 정보 조회 실패 시 무시하고 진행
          }
        }
      }

      setOtherProducts(products);
    };

    fetchOtherProducts();
  }, [promotion]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      return '-';
    }
  };

  const formatMonth = (month: string) => {
    if (!month) return '-';
    try {
      const [year, monthNum] = month.split('-');
      return `${year}년 ${parseInt(monthNum)}월`;
    } catch (error) {
      return month;
    }
  };

  const getOtherProductInfo = (productId?: string) => {
    if (!productId) return null;
    return otherProducts[productId];
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          ← 뒤로가기
        </Button>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            수정
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const deleteTrigger = document.getElementById('delete-trigger');
              if (deleteTrigger) {
                deleteTrigger.click();
              }
            }} 
            variant="destructive"
          >
            삭제
          </Button>
        </div>
      </div>

      {/* 프로모션 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{promotion.title}</CardTitle>
            <Badge variant={promotion.isActive ? "default" : "secondary"}>
              {promotion.isActive ? '활성' : '비활성'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            프로모션 코드: {promotion.code}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">프로모션 월</h3>
              <p className="text-lg">{formatMonth(promotion.month)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">타겟 고객그룹</h3>
              <p className="text-lg">{promotion.target}</p>
            </div>
          </div>

          {/* 인사말 */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">인사말</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg leading-relaxed">{promotion.greeting}</p>
            </div>
          </div>

          {/* 프로모션 내용 */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">프로모션 내용</h3>
            <div className="p-4 bg-muted rounded-lg">
              <div 
                className="prose prose-normal max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPromotionContent(promotion.content) }}
              />
            </div>
          </div>

          {/* 매듭말 */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">매듭말</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg leading-relaxed">{promotion.closing}</p>
            </div>
          </div>

          {/* 다른제품 정보 */}
          {(promotion.otherProduct1 || promotion.otherProduct2 || promotion.otherProduct3 || promotion.otherProduct4) && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">다른제품</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotion.otherProduct1 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">다른제품 1</h4>
                    {getOtherProductInfo(promotion.otherProduct1) ? (
                      <p className="text-sm">
                        {getOtherProductInfo(promotion.otherProduct1)?.code} - {getOtherProductInfo(promotion.otherProduct1)?.title}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">제품 정보를 찾을 수 없습니다</p>
                    )}
                  </div>
                )}

                {promotion.otherProduct2 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">다른제품 2</h4>
                    {getOtherProductInfo(promotion.otherProduct2) ? (
                      <p className="text-sm">
                        {getOtherProductInfo(promotion.otherProduct2)?.code} - {getOtherProductInfo(promotion.otherProduct2)?.title}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">제품 정보를 찾을 수 없습니다</p>
                    )}
                  </div>
                )}

                {promotion.otherProduct3 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">다른제품 3</h4>
                    {getOtherProductInfo(promotion.otherProduct3) ? (
                      <p className="text-sm">
                        {getOtherProductInfo(promotion.otherProduct3)?.code} - {getOtherProductInfo(promotion.otherProduct3)?.title}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">제품 정보를 찾을 수 없습니다</p>
                    )}
                  </div>
                )}

                {promotion.otherProduct4 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">다른제품 4</h4>
                    {getOtherProductInfo(promotion.otherProduct4) ? (
                      <p className="text-sm">
                        {getOtherProductInfo(promotion.otherProduct4)?.code} - {getOtherProductInfo(promotion.otherProduct4)?.title}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">제품 정보를 찾을 수 없습니다</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 연락처 */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">연락처</h3>
            <p className="text-lg">{promotion.contact}</p>
          </div>

          {/* 단축 URL */}
          {promotion.shortUrl && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">단축 URL</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={promotion.shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {promotion.shortUrl}
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyToClipboard(promotion.shortUrl!);
                  }}
                  className="text-xs"
                >
                  복사
                </Button>
              </div>
            </div>
          )}

          {/* 이미지 */}
          {promotion.imageUrl && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">첨부 이미지</h3>
              <div className="p-4 bg-muted rounded-lg">
                <LazyImage 
                  src={promotion.imageUrl} 
                  alt="프로모션 이미지"
                  className="max-w-full h-auto rounded-lg max-h-96"
                />
              </div>
            </div>
          )}

          {/* 생성/수정 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">생성일시</h3>
              <p className="text-sm">{formatDate(promotion.createdAt)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">수정일시</h3>
              <p className="text-sm">{formatDate(promotion.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionDetailView; 