import React from 'react';
import { Promotion } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '../../hooks/use-toast';

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  onView: (promotion: Promotion) => void;
  isLoading?: boolean;
}

const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  const { toast } = useToast();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'yyyy-MM-dd', { locale: ko });
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

  const copyToClipboard = async (promotionId: string) => {
    try {
      const url = `${window.location.origin}/view/${promotionId}`;
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
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-40">코드</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">제목</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-30">월</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-65">타겟</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-30">생성일</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-25">상태</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">보기</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-24">링크복사</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">삭제</th>
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
                    <div className="max-w-xs">
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
                    <Badge
                      variant={promotion.isActive ? "default" : "secondary"}
                      className={promotion.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {promotion.isActive ? '활성' : '비활성'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/view/${promotion.id}`, '_blank')}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      보기
                    </Button>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(promotion.id)}
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
                  <div 
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => window.location.href = `/promotions/${promotion.id}/edit`}
                  >
                    {promotion.title}
                  </div>
                  <div className="text-sm text-gray-500 font-mono">{promotion.code}</div>
                </div>
                <Badge
                  variant={promotion.isActive ? "default" : "secondary"}
                  className={promotion.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {promotion.isActive ? '활성' : '비활성'}
                </Badge>
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
                  onClick={() => window.open(`/view/${promotion.id}`, '_blank')}
                  className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  보기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(promotion.id)}
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  링크복사
                </Button>
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
  );
};

export default PromotionTable; 