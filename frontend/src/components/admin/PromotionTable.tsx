import React, { useState } from 'react';
import { Promotion } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '../../hooks/use-toast';
import ShortUrlDialog from '../common/ShortUrlDialog';
import { updateShortUrl, updatePromotionSlug } from '../../services/promotionService';

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  onView: (promotion: Promotion) => void;
  isLoading?: boolean;
  onPromotionUpdate?: () => void; // 프로모션 업데이트 후 목록 새로고침용
}

const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  onPromotionUpdate
}) => {
  const { toast } = useToast();
  const [shortUrlDialog, setShortUrlDialog] = useState<{
    isOpen: boolean;
    promotion: Promotion | null;
  }>({
    isOpen: false,
    promotion: null
  });

  const [slugUrlDialog, setSlugUrlDialog] = useState<{
    isOpen: boolean;
    promotion: Promotion | null;
    slugValue: string;
  }>({
    isOpen: false,
    promotion: null,
    slugValue: ''
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'yyMMdd-HH:mm', { locale: ko });
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

  const copyToClipboard = async (promotion: Promotion) => {
    try {
      const url = promotion.slug 
        ? `${window.location.origin}/view/${promotion.slug}`
        : `${window.location.origin}/view/${promotion.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "링크가 복사되었습니다",
        description: `클립보드에 프로모션 링크가 복사되었습니다.\n${url}`,
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "링크 복사에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const copyShortUrlToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast({
        title: "단축 URL이 복사되었습니다",
        description: `클립보드에 단축 URL이 복사되었습니다.\n${shortUrl}`,
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "단축 URL 복사에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleShortUrlSave = async (shortUrl: string) => {
    if (!shortUrlDialog.promotion) return;

    const result = await updateShortUrl(shortUrlDialog.promotion.id, shortUrl);
    
    if (result.success) {
      // 목록 새로고침
      if (onPromotionUpdate) {
        onPromotionUpdate();
      }
    } else {
      throw new Error(result.error);
    }
  };

  const openShortUrlDialog = (promotion: Promotion) => {
    setShortUrlDialog({
      isOpen: true,
      promotion
    });
  };

  const closeShortUrlDialog = () => {
    setShortUrlDialog({
      isOpen: false,
      promotion: null
    });
  };

  const openSlugUrlDialog = (promotion: Promotion) => {
    setSlugUrlDialog({
      isOpen: true,
      promotion,
      slugValue: promotion.slug || ''
    });
  };

  const closeSlugUrlDialog = () => {
    setSlugUrlDialog({
      isOpen: false,
      promotion: null,
      slugValue: ''
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로모션 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (promotions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프로모션 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            등록된 프로모션이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>프로모션 목록 ({promotions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-45">코드</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">활성</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-180">제목</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-30">월</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-70">타겟</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-40">생성일</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-50">슬러그URL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-35">링크복사</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">삭제</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600">
                        {promotion.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Badge
                          variant={promotion.isActive ? "default" : "secondary"}
                          className={`${promotion.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} text-xs px-1.5 py-0.5`}
                        >
                          {promotion.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-72">
                        <div 
                          className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => window.location.href = `/promotions/${promotion.id}/edit`}
                        >
                          {promotion.title}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {formatMonth(promotion.month)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {promotion.target}
                      </span>
                    </td>
                                         <td className="py-3 px-4">
                       <span className="text-sm text-gray-500">
                         {formatDate(promotion.createdAt)}
                       </span>
                     </td>
                     <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSlugUrlDialog(promotion)}
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs w-36 truncate"
                        title={`${window.location.origin}/view/${promotion.slug || promotion.id}`}
                      >
                        <span className="truncate block w-full text-left">
                          {promotion.slug || promotion.id}
                        </span>
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(promotion)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        링크복사
                      </Button>
                    </td>

                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(promotion.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="md:hidden space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={promotion.isActive ? "default" : "secondary"}
                        className={promotion.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {promotion.isActive ? '활성' : '비활성'}
                      </Badge>
                      <div 
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={() => window.location.href = `/promotions/${promotion.id}/edit`}
                      >
                        {promotion.title}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">{promotion.code}</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>월: {formatMonth(promotion.month)}</div>
                  <div>타겟: {promotion.target}</div>
                  <div>생성일: {formatDate(promotion.createdAt)}</div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(promotion)}
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    링크복사
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openShortUrlDialog(promotion)}
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    {promotion.shortUrl ? '단축URL 수정' : '단축URL 등록'}
                  </Button>
                  {promotion.shortUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyShortUrlToClipboard(promotion.shortUrl!)}
                      className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      단축URL 복사
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(promotion.id)}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 단축 URL 다이얼로그 */}
      {shortUrlDialog.isOpen && shortUrlDialog.promotion && (
        <ShortUrlDialog
          isOpen={shortUrlDialog.isOpen}
          onClose={closeShortUrlDialog}
          onSave={handleShortUrlSave}
          currentShortUrl={shortUrlDialog.promotion.shortUrl}
          promotionTitle={shortUrlDialog.promotion.title}
        />
      )}

      {/* 슬러그 URL 다이얼로그 */}
      {slugUrlDialog.isOpen && slugUrlDialog.promotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">슬러그 URL</h3>
              <button
                onClick={closeSlugUrlDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">프로모션 제목:</p>
              <p className="font-medium text-gray-900">{slugUrlDialog.promotion.title}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">프로모션 코드:</p>
              <p className="font-mono font-medium text-gray-900">{slugUrlDialog.promotion.code}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">문서 ID:</p>
              <p className="font-mono font-medium text-gray-900">{slugUrlDialog.promotion.id}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">슬러그:</p>
              <input
                type="text"
                value={slugUrlDialog.slugValue}
                onChange={(e) => setSlugUrlDialog(prev => ({ ...prev, slugValue: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="슬러그를 입력하세요"
              />
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">전체 URL:</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-mono text-sm text-gray-800 break-all">
                  {`${window.location.origin}/view/${slugUrlDialog.slugValue || slugUrlDialog.promotion.id}`}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (slugUrlDialog.promotion) {
                    const url = `${window.location.origin}/view/${slugUrlDialog.slugValue || slugUrlDialog.promotion.id}`;
                    navigator.clipboard.writeText(url);
                    toast({
                      title: "슬러그 URL이 복사되었습니다",
                      description: "클립보드에 슬러그 URL이 복사되었습니다.",
                    });
                  }
                }}
              >
                URL 복사
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (slugUrlDialog.promotion) {
                    const url = `${window.location.origin}/view/${slugUrlDialog.slugValue || slugUrlDialog.promotion.id}`;
                    window.open(url, '_blank');
                  }
                }}
              >
                새 창에서 열기
              </Button>
              <Button
                onClick={async () => {
                  if (slugUrlDialog.promotion && slugUrlDialog.slugValue !== slugUrlDialog.promotion.slug) {
                    try {
                      const result = await updatePromotionSlug(slugUrlDialog.promotion.id, slugUrlDialog.slugValue);
                      
                      if (result.success) {
                        toast({
                          title: "슬러그 업데이트",
                          description: result.warning 
                            ? `슬러그가 업데이트되었습니다. ${result.warning}`
                            : `슬러그가 "${slugUrlDialog.slugValue}"로 업데이트되었습니다.`,
                        });
                        closeSlugUrlDialog();
                        // 목록 새로고침
                        if (onPromotionUpdate) {
                          onPromotionUpdate();
                        }
                      } else {
                        toast({
                          title: "업데이트 실패",
                          description: result.error || "슬러그 업데이트에 실패했습니다.",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "업데이트 실패",
                        description: "슬러그 업데이트 중 오류가 발생했습니다.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    closeSlugUrlDialog();
                  }
                }}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromotionTable; 