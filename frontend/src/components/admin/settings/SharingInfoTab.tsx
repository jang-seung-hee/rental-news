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
import { Separator } from '../../ui/separator';
import { useToast } from '../../../hooks/use-toast';
import { saveSharingInfo, getCurrentSettings } from '../../../services/systemSettingsTabService';
import { SharingInfo } from '../../../types/systemSettingsTabs';
import { uploadImage } from '../../../services/firebaseUtils';

// 폼 유효성 검사 스키마
const sharingInfoSchema = z.object({
  defaultTitle: z.string().min(1, '기본 제목을 입력하세요'),
  defaultDescription: z.string().min(1, '기본 설명을 입력하세요'),
  defaultImageUrl: z.string().min(1, '기본 이미지 URL을 입력하세요'),
  faviconUrl: z.string().min(1, '파비콘 URL을 입력하세요')
});

const SharingInfoTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultImageFile, setDefaultImageFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [currentSettings, setCurrentSettings] = useState<any>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<SharingInfo>({
    resolver: zodResolver(sharingInfoSchema)
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const settings = await getCurrentSettings();
        if (settings) {
          setCurrentSettings(settings);
          const formData = {
            defaultTitle: settings.defaultTitle || '',
            defaultDescription: settings.defaultDescription || '',
            defaultImageUrl: settings.defaultImageUrl || '',
            faviconUrl: settings.faviconUrl || ''
          };
          
          Object.entries(formData).forEach(([key, value]) => {
            setValue(key as keyof SharingInfo, value);
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

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'default' | 'favicon') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'default') {
        setDefaultImageFile(file);
      } else {
        setFaviconFile(file);
      }
    }
  };

  const handleUpload = async (type: 'default' | 'favicon') => {
    const file = type === 'default' ? defaultImageFile : faviconFile;
    if (file) {
      try {
        const imageUrl = await uploadImage(file, 'system-settings');
        
        // 폼 값 업데이트
        if (type === 'default') {
          setValue('defaultImageUrl', imageUrl, { shouldDirty: true });
          setDefaultImageFile(null);
        } else {
          setValue('faviconUrl', imageUrl, { shouldDirty: true });
          setFaviconFile(null);
        }
        
        toast({
          title: "이미지 업로드 완료",
          description: "이미지가 업로드되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "업로드 실패",
          description: "이미지 업로드에 실패했습니다.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  // 폼 제출 처리
  const onSubmit = async (data: SharingInfo) => {
    try {
      setIsSaving(true);
      setError(null);

      const result = await saveSharingInfo(data);
      
      if (result.success) {
        toast({
          title: "저장 완료",
          description: "공유 정보가 성공적으로 저장되었습니다.",
          duration: 3000,
        });
        
        // 폼 상태 초기화 (저장된 데이터로)
        reset(data);
        // 현재 설정 업데이트
        setCurrentSettings({ ...currentSettings, ...data });
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
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="admin-error">{error}</AlertDescription>
        </Alert>
      )}
      
      {/* 메타 정보 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="admin-card-title flex items-center gap-2">
            <Badge variant="secondary">메타 정보</Badge>
            공유 시 나타나는 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultTitle" className="admin-label">기본 제목 *</Label>
            <Input
              id="defaultTitle"
              {...register('defaultTitle')}
              placeholder="렌탈톡톡 월간 소식"
              className="mt-1 admin-body-text"
            />
            {errors.defaultTitle && (
              <p className="admin-error mt-1">
                {typeof errors.defaultTitle.message === 'string' ? errors.defaultTitle.message : '기본 제목을 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              프로모션에 이미지가 없을 때 사용되는 기본 제목입니다.
            </p>
          </div>

          <div>
            <Label htmlFor="defaultDescription" className="admin-label">기본 설명 *</Label>
            <Textarea
              id="defaultDescription"
              {...register('defaultDescription')}
              placeholder="최신 렌탈 정보와 프로모션을 확인하세요"
              className="mt-1 admin-body-text"
              rows={4}
            />
            {errors.defaultDescription && (
              <p className="admin-error mt-1">
                {typeof errors.defaultDescription.message === 'string' ? errors.defaultDescription.message : '기본 설명을 입력하세요'}
              </p>
            )}
            <p className="admin-caption mt-1">
              프로모션에 이미지가 없을 때 사용되는 기본 설명입니다. (최대 160자 권장)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="admin-card-title flex items-center gap-2">
            <Badge variant="secondary">이미지</Badge>
            기본 이미지 및 파비콘
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 이미지 */}
          <div>
            <Label htmlFor="defaultImageUrl" className="admin-label">기본 이미지 URL *</Label>
            <Input
              id="defaultImageUrl"
              {...register('defaultImageUrl')}
              placeholder="/promotionViewTitle_resize.png"
              className="mt-1 admin-body-text"
            />
            {errors.defaultImageUrl && (
              <p className="admin-error mt-1">
                {typeof errors.defaultImageUrl.message === 'string' ? errors.defaultImageUrl.message : '기본 이미지 URL을 입력하세요'}
              </p>
            )}
            
            <div className="mt-3">
              <Label htmlFor="defaultImageFile" className="admin-label">
                새 이미지 업로드 (선택사항)
              </Label>
              <Input
                id="defaultImageFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileSelect(e, 'default')}
                className="mt-1"
              />
              {defaultImageFile && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="admin-caption text-blue-600">
                    선택된 파일: {defaultImageFile.name}
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleUpload('default')}
                    size="sm"
                    className="admin-button-text"
                  >
                    업로드
                  </Button>
                </div>
              )}
            </div>

            {currentSettings?.defaultImageUrl && (
              <div className="mt-3">
                <Label className="admin-label">현재 이미지 미리보기</Label>
                <div className="mt-2">
                  <img
                    src={currentSettings.defaultImageUrl}
                    alt="현재 기본 이미지"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* 파비콘 */}
          <div>
            <Label htmlFor="faviconUrl" className="admin-label">파비콘 URL *</Label>
            <Input
              id="faviconUrl"
              {...register('faviconUrl')}
              placeholder="/promotionViewTitle_resize.png"
              className="mt-1 admin-body-text"
            />
            {errors.faviconUrl && (
              <p className="admin-error mt-1">
                {typeof errors.faviconUrl.message === 'string' ? errors.faviconUrl.message : '파비콘 URL을 입력하세요'}
              </p>
            )}
            
            <div className="mt-3">
              <Label htmlFor="faviconFile" className="admin-label">
                새 파비콘 업로드 (선택사항)
              </Label>
              <Input
                id="faviconFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileSelect(e, 'favicon')}
                className="mt-1"
              />
              {faviconFile && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="admin-caption text-blue-600">
                    선택된 파일: {faviconFile.name}
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleUpload('favicon')}
                    size="sm"
                    className="admin-button-text"
                  >
                    업로드
                  </Button>
                </div>
              )}
            </div>

            {currentSettings?.faviconUrl && (
              <div className="mt-3">
                <Label className="admin-label">현재 파비콘 미리보기</Label>
                <div className="mt-2">
                  <img
                    src={currentSettings.faviconUrl}
                    alt="현재 파비콘"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}
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

export default SharingInfoTab;
