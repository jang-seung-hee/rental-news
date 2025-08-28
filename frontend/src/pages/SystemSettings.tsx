import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  getSystemSettings, 
  upsertSystemSettings, 
  initializeDefaultSystemSettings 
} from '../services/systemSettingsService';
import { SystemSettings, UpdateSystemSettingsRequest } from '../types/systemSettings';
import { uploadImage } from '../services/firebaseUtils';
import SettingsTabs from '../components/admin/settings/SettingsTabs';
import SiteBasicInfoTab from '../components/admin/settings/SiteBasicInfoTab';
import SharingInfoTab from '../components/admin/settings/SharingInfoTab';
import InactivePromotionTab from '../components/admin/settings/InactivePromotionTab';

// 폼 유효성 검사 스키마
const systemSettingsSchema = z.object({
  siteName: z.string().min(1, '사이트명을 입력하세요'),
  defaultTitle: z.string().min(1, '기본 제목을 입력하세요'),
  defaultDescription: z.string().min(1, '기본 설명을 입력하세요'),
  defaultImageUrl: z.string().min(1, '기본 이미지 URL을 입력하세요'),
  faviconUrl: z.string().min(1, '파비콘 URL을 입력하세요'),
  // 프로모션 비활성화 시 안내 메시지 설정
  inactivePromotionTitle: z.string().min(1, '안내 제목을 입력하세요'),
  inactivePromotionMessage: z.string().min(1, '메인 메시지를 입력하세요'),
  inactivePromotionGuide: z.string().min(1, '안내 가이드를 입력하세요'),
  inactivePromotionButtonText: z.string().min(1, '버튼 텍스트를 입력하세요')
});

type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

const SystemSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState('site-basic');

  const methods = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema)
  });

  const { handleSubmit, setValue, reset, formState: { isDirty } } = methods;

  // 시스템 설정 로드
  const loadSystemSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let settings = await getSystemSettings();
      
      if (!settings) {
        // 기본 설정이 없으면 초기화
        const initResult = await initializeDefaultSystemSettings();
        if (initResult.success) {
          settings = await getSystemSettings();
        } else {
          setError('기본 설정 초기화에 실패했습니다.');
          return;
        }
      }
      
      if (settings) {
        setSystemSettings(settings);
        setValue('siteName', settings.siteName);
        setValue('defaultTitle', settings.defaultTitle);
        setValue('defaultDescription', settings.defaultDescription);
        setValue('defaultImageUrl', settings.defaultImageUrl);
        setValue('faviconUrl', settings.faviconUrl);
        // 프로모션 비활성화 시 안내 메시지 설정
        setValue('inactivePromotionTitle', settings.inactivePromotionTitle);
        setValue('inactivePromotionMessage', settings.inactivePromotionMessage);
        setValue('inactivePromotionGuide', settings.inactivePromotionGuide);
        setValue('inactivePromotionButtonText', settings.inactivePromotionButtonText);
      }
    } catch (err) {
      setError('시스템 설정을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadSystemSettings();
  }, []);

  // systemSettings가 변경될 때마다 폼 값 동기화
  useEffect(() => {
    if (systemSettings) {
      setValue('siteName', systemSettings.siteName);
      setValue('defaultTitle', systemSettings.defaultTitle);
      setValue('defaultDescription', systemSettings.defaultDescription);
      setValue('defaultImageUrl', systemSettings.defaultImageUrl);
      setValue('faviconUrl', systemSettings.faviconUrl);
      // 프로모션 비활성화 시 안내 메시지 설정
      setValue('inactivePromotionTitle', systemSettings.inactivePromotionTitle);
      setValue('inactivePromotionMessage', systemSettings.inactivePromotionMessage);
      setValue('inactivePromotionGuide', systemSettings.inactivePromotionGuide);
      setValue('inactivePromotionButtonText', systemSettings.inactivePromotionButtonText);
    }
  }, [systemSettings, setValue]);

  // 이미지 업로드 처리
  const handleImageUpload = async (type: 'default' | 'favicon', file: File): Promise<void> => {
    try {
      const imageUrl = await uploadImage(file, 'system-settings');
      
      // 폼 값 업데이트
      if (type === 'default') {
        setValue('defaultImageUrl', imageUrl);
      } else {
        setValue('faviconUrl', imageUrl);
      }
      
      // 시스템 설정 상태 업데이트
      if (systemSettings) {
        setSystemSettings({
          ...systemSettings,
          [type === 'default' ? 'defaultImageUrl' : 'faviconUrl']: imageUrl
        });
      }
    } catch (error) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  // 폼 제출 처리
  const onSubmit = async (data: SystemSettingsFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      console.log('폼 제출 데이터:', data); // 디버깅 로그

      const result = await upsertSystemSettings(data);
      
      if (result.success) {
        setSuccess('시스템 설정이 성공적으로 저장되었습니다.');
        console.log('저장 성공, 설정 다시 로드 중...'); // 디버깅 로그
        
        await loadSystemSettings(); // 설정 다시 로드
        
        // 폼 상태 초기화 및 저장된 데이터로 다시 설정
        if (systemSettings) {
          console.log('폼 상태 초기화 중...', systemSettings); // 디버깅 로그
          reset({
            siteName: systemSettings.siteName,
            defaultTitle: systemSettings.defaultTitle,
            defaultDescription: systemSettings.defaultDescription,
            defaultImageUrl: systemSettings.defaultImageUrl,
            faviconUrl: systemSettings.faviconUrl,
            inactivePromotionTitle: systemSettings.inactivePromotionTitle,
            inactivePromotionMessage: systemSettings.inactivePromotionMessage,
            inactivePromotionGuide: systemSettings.inactivePromotionGuide,
            inactivePromotionButtonText: systemSettings.inactivePromotionButtonText
          });
        }
      } else {
        setError(result.error || '저장에 실패했습니다.');
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
          <p className="text-gray-600 mt-1">
            프로모션 공유 시 나타나는 메타 정보와 사이트 기본 설정을 관리합니다.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 탭 네비게이션 */}
          <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* 탭 컨텐츠 */}
          <div className="min-h-[500px]">
            {activeTab === 'site-basic' && <SiteBasicInfoTab />}
            {activeTab === 'sharing-info' && (
              <SharingInfoTab 
                systemSettings={systemSettings}
                onImageUpload={handleImageUpload}
              />
            )}
            {activeTab === 'inactive-promotion' && <InactivePromotionTab />}
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="min-w-[120px]"
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* 설정 정보 */}
      {systemSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">설정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">생성일시:</span>
                <span className="ml-2 text-gray-900">
                  {systemSettings.createdAt.toLocaleString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">수정일시:</span>
                <span className="ml-2 text-gray-900">
                  {systemSettings.updatedAt.toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemSettingsPage;
