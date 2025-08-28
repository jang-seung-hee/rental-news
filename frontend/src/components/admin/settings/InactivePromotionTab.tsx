import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';

const InactivePromotionTab: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">안내 메시지</Badge>
          비활성화된 프로모션 표시 내용
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="inactivePromotionTitle">안내 제목 *</Label>
          <Input
            id="inactivePromotionTitle"
            {...register('inactivePromotionTitle')}
            placeholder="프로모션 종료"
            className="mt-1"
          />
          {errors.inactivePromotionTitle && (
            <p className="text-sm text-red-600 mt-1">
              {typeof errors.inactivePromotionTitle.message === 'string' ? errors.inactivePromotionTitle.message : '안내 제목을 입력하세요'}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            비활성화된 프로모션을 볼 때 표시되는 제목입니다.
          </p>
        </div>

        <div>
          <Label htmlFor="inactivePromotionMessage">메인 메시지 *</Label>
          <Textarea
            id="inactivePromotionMessage"
            {...register('inactivePromotionMessage')}
            placeholder="죄송합니다. 해당 프로모션은 종료되었습니다."
            className="mt-1"
            rows={4}
          />
          {errors.inactivePromotionMessage && (
            <p className="text-sm text-red-600 mt-1">
              {typeof errors.inactivePromotionMessage.message === 'string' ? errors.inactivePromotionMessage.message : '메인 메시지를 입력하세요'}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            비활성화된 프로모션을 볼 때 표시되는 주요 안내 메시지입니다.
          </p>
        </div>

        <div>
          <Label htmlFor="inactivePromotionGuide">안내 가이드 *</Label>
          <Textarea
            id="inactivePromotionGuide"
            {...register('inactivePromotionGuide')}
            placeholder="허준 팀장에게 현재 진행중인 프로모션으로 새로 안내해 달라고 하세요."
            className="mt-1"
            rows={4}
          />
          {errors.inactivePromotionGuide && (
            <p className="text-sm text-red-600 mt-1">
              {typeof errors.inactivePromotionGuide.message === 'string' ? errors.inactivePromotionGuide.message : '안내 가이드를 입력하세요'}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            사용자에게 다음 행동을 안내하는 메시지입니다.
          </p>
        </div>

        <div>
          <Label htmlFor="inactivePromotionButtonText">버튼 텍스트 *</Label>
          <Input
            id="inactivePromotionButtonText"
            {...register('inactivePromotionButtonText')}
            placeholder="돌아가기"
            className="mt-1"
          />
          {errors.inactivePromotionButtonText && (
            <p className="text-sm text-red-600 mt-1">
              {typeof errors.inactivePromotionButtonText.message === 'string' ? errors.inactivePromotionButtonText.message : '버튼 텍스트를 입력하세요'}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            돌아가기 버튼에 표시되는 텍스트입니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactivePromotionTab;
