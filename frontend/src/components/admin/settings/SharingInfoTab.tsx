import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { SystemSettings } from '../../../types/systemSettings';

interface SharingInfoTabProps {
  systemSettings: SystemSettings | null;
  onImageUpload: (type: 'default' | 'favicon', file: File) => Promise<void>;
}

const SharingInfoTab: React.FC<SharingInfoTabProps> = ({ 
  systemSettings, 
  onImageUpload 
}) => {
  const { register, formState: { errors } } = useFormContext();
  const [defaultImageFile, setDefaultImageFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

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
      await onImageUpload(type, file);
      if (type === 'default') {
        setDefaultImageFile(null);
      } else {
        setFaviconFile(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 메타 정보 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">메타 정보</Badge>
            공유 시 나타나는 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultTitle">기본 제목 *</Label>
            <Input
              id="defaultTitle"
              {...register('defaultTitle')}
              placeholder="렌탈톡톡 월간 소식"
              className="mt-1"
            />
            {errors.defaultTitle && (
              <p className="text-sm text-red-600 mt-1">
                {typeof errors.defaultTitle.message === 'string' ? errors.defaultTitle.message : '기본 제목을 입력하세요'}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              프로모션에 이미지가 없을 때 사용되는 기본 제목입니다.
            </p>
          </div>

          <div>
            <Label htmlFor="defaultDescription">기본 설명 *</Label>
            <Textarea
              id="defaultDescription"
              {...register('defaultDescription')}
              placeholder="최신 렌탈 정보와 프로모션을 확인하세요"
              className="mt-1"
              rows={4}
            />
            {errors.defaultDescription && (
              <p className="text-sm text-red-600 mt-1">
                {typeof errors.defaultDescription.message === 'string' ? errors.defaultDescription.message : '기본 설명을 입력하세요'}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              프로모션에 이미지가 없을 때 사용되는 기본 설명입니다. (최대 160자 권장)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">이미지</Badge>
            기본 이미지 및 파비콘
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 이미지 */}
          <div>
            <Label htmlFor="defaultImageUrl">기본 이미지 URL *</Label>
            <Input
              id="defaultImageUrl"
              {...register('defaultImageUrl')}
              placeholder="/promotionViewTitle_resize.png"
              className="mt-1"
            />
            {errors.defaultImageUrl && (
              <p className="text-sm text-red-600 mt-1">
                {typeof errors.defaultImageUrl.message === 'string' ? errors.defaultImageUrl.message : '기본 이미지 URL을 입력하세요'}
              </p>
            )}
            
            <div className="mt-3">
              <Label htmlFor="defaultImageFile" className="text-sm font-medium">
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
                  <p className="text-sm text-blue-600">
                    선택된 파일: {defaultImageFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUpload('default')}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    업로드
                  </button>
                </div>
              )}
            </div>

            {systemSettings?.defaultImageUrl && (
              <div className="mt-3">
                <Label className="text-sm font-medium">현재 이미지 미리보기</Label>
                <div className="mt-2">
                  <img
                    src={systemSettings.defaultImageUrl}
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
            <Label htmlFor="faviconUrl">파비콘 URL *</Label>
            <Input
              id="faviconUrl"
              {...register('faviconUrl')}
              placeholder="/promotionViewTitle_resize.png"
              className="mt-1"
            />
            {errors.faviconUrl && (
              <p className="text-sm text-red-600 mt-1">
                {typeof errors.faviconUrl.message === 'string' ? errors.faviconUrl.message : '파비콘 URL을 입력하세요'}
              </p>
            )}
            
            <div className="mt-3">
              <Label htmlFor="faviconFile" className="text-sm font-medium">
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
                  <p className="text-sm text-blue-600">
                    선택된 파일: {faviconFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUpload('favicon')}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    업로드
                  </button>
                </div>
              )}
            </div>

            {systemSettings?.faviconUrl && (
              <div className="mt-3">
                <Label className="text-sm font-medium">현재 파비콘 미리보기</Label>
                <div className="mt-2">
                  <img
                    src={systemSettings.faviconUrl}
                    alt="현재 파비콘"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharingInfoTab;
