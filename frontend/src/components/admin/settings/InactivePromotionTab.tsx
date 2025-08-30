import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { useToast } from '../../../hooks/use-toast';
import { saveInactivePromotionInfo, getCurrentSettings } from '../../../services/systemSettingsTabService';
import { InactivePromotionInfo } from '../../../types/systemSettingsTabs';

// 폼 유효성 검사 스키마
const inactivePromotionSchema = z.object({
  inactivePromotionTitle: z.string().min(1, '안내 제목을 입력하세요'),
  inactivePromotionMessage: z.string().min(1, '메인 메시지를 입력하세요'),
  inactivePromotionGuide: z.string().min(1, '안내 가이드를 입력하세요'),
  inactivePromotionButtonText: z.string().min(1, '버튼 텍스트를 입력하세요')
});

const InactivePromotionTab: React.FC = () => {
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
  } = useForm<InactivePromotionInfo>({
    resolver: zodResolver(inactivePromotionSchema)
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const settings = await getCurrentSettings();
        if (settings) {
          const formData = {
            inactivePromotionTitle: settings.inactivePromotionTitle || '',
            inactivePromotionMessage: settings.inactivePromotionMessage || '',
            inactivePromotionGuide: settings.inactivePromotionGuide || '',
            inactivePromotionButtonText: settings.inactivePromotionButtonText || ''
          };
          
          Object.entries(formData).forEach(([key, value]) => {
            setValue(key as keyof InactivePromotionInfo, value);
          });
          reset(formData);
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
  const onSubmit = async (data: InactivePromotionInfo) => {
    try {
      setIsSaving(true);
      setError(null);

      const result = await saveInactivePromotionInfo(data);
      
      if (result.success) {
        toast({
          title: "저장 완료",
          description: "비활성화 프로모션 설정이 성공적으로 저장되었습니다.",
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
            <Badge variant="secondary">안내 메시지</Badge>
            비활성화된 프로모션 표시 내용
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="admin-error">{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="inactivePromotionTitle" className="admin-label">안내 제목 *</Label>
            <Input
              id="inactivePromotionTitle"
              {...register('inactivePromotionTitle')}
              placeholder="프로모션 종료"
              className="mt-1 admin-body-text"
            />
            {errors.inactivePromotionTitle && (
              <p className="admin-error mt-1">
                {typeof errors.inactivePromotionTitle.message === 'string' ? errors.inactivePromotionTitle.message : '안내 제목을 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              비활성화된 프로모션을 볼 때 표시되는 제목입니다.
            </p>
          </div>

          <div>
            <Label htmlFor="inactivePromotionMessage" className="admin-label">메인 메시지 *</Label>
            <Textarea
              id="inactivePromotionMessage"
              {...register('inactivePromotionMessage')}
              placeholder="죄송합니다. 해당 프로모션은 종료되었습니다."
              className="mt-1 admin-body-text"
              rows={4}
            />
            {errors.inactivePromotionMessage && (
              <p className="admin-error mt-1">
                {typeof errors.inactivePromotionMessage.message === 'string' ? errors.inactivePromotionMessage.message : '메인 메시지를 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              비활성화된 프로모션을 볼 때 표시되는 주요 안내 메시지입니다.
            </p>
          </div>

          <div>
            <Label htmlFor="inactivePromotionGuide" className="admin-label">안내 가이드 *</Label>
            <Textarea
              id="inactivePromotionGuide"
              {...register('inactivePromotionGuide')}
              placeholder="허준 팀장에게 현재 진행중인 프로모션으로 새로 안내해 달라고 하세요."
              className="mt-1 admin-body-text"
              rows={4}
            />
            {errors.inactivePromotionGuide && (
              <p className="admin-error mt-1">
                {typeof errors.inactivePromotionGuide.message === 'string' ? errors.inactivePromotionGuide.message : '안내 가이드를 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              사용자에게 다음 행동을 안내하는 메시지입니다.
            </p>
          </div>

          <div>
            <Label htmlFor="inactivePromotionButtonText" className="admin-label">버튼 텍스트 *</Label>
            <Input
              id="inactivePromotionButtonText"
              {...register('inactivePromotionButtonText')}
              placeholder="돌아가기"
              className="mt-1 admin-body-text"
            />
            {errors.inactivePromotionButtonText && (
              <p className="admin-error mt-1">
                {typeof errors.inactivePromotionButtonText.message === 'string' ? errors.inactivePromotionButtonText.message : '버튼 텍스트를 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              돌아가기 버튼에 표시되는 텍스트입니다.
            </p>
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

export default InactivePromotionTab;
