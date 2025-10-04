import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { useToast } from '../../../hooks/use-toast';
import { saveSiteBasicInfo, getCurrentSettings } from '../../../services/systemSettingsTabService';
import { SiteBasicInfo } from '../../../types/systemSettingsTabs';
import { updateHistory } from '../../../data/updateHistory';

// 폼 유효성 검사 스키마
const siteBasicInfoSchema = z.object({
  siteName: z.string().min(1, '사이트명을 입력하세요')
});

const SiteBasicInfoTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<SiteBasicInfo>({
    resolver: zodResolver(siteBasicInfoSchema)
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const settings = await getCurrentSettings();
        if (settings) {
          setValue('siteName', settings.siteName || '');
          reset({ siteName: settings.siteName || '' });
        }
      } catch (err) {
        setError('설정을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setValue, reset]);

  // 폼 제출 처리
  const onSubmit = async (data: SiteBasicInfo) => {
    try {
      setIsSaving(true);
      setError(null);

      const result = await saveSiteBasicInfo(data);
      
      if (result.success) {
        toast({
          title: "저장 완료",
          description: "사이트 기본 정보가 성공적으로 저장되었습니다.",
          duration: 3000,
        });
        
        // 폼 상태 초기화 (저장된 데이터로)
        reset(data);
      } else {
        setError(result.error || '저장에 실패했습니다.');
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 admin-loading">로딩 중...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="admin-card-title flex items-center gap-2">
            <Badge variant="secondary">기본 정보</Badge>
            사이트 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="admin-error">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName" className="admin-label">사이트명 *</Label>
              <Input
                id="siteName"
                {...register('siteName')}
                placeholder="렌탈톡톡"
                className="mt-1 admin-body-text"
              />
              {errors.siteName && (
                <p className="admin-error mt-1">
                  {typeof errors.siteName.message === 'string' ? errors.siteName.message : '사이트명을 입력하세요'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 업데이트 기록 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="admin-card-title flex items-center gap-2">
            <Badge variant="secondary">기록</Badge>
            업데이트 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight: '300px' }}
          >
            {updateHistory.map((record, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap flex-shrink-0">
                  {record.date}
                </span>
                <p className="admin-body-text text-gray-700 text-sm">{record.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="min-w-[120px] admin-button-text"
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
};

export default SiteBasicInfoTab;
