import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';

const SiteBasicInfoTab: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">기본 정보</Badge>
          사이트 기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="siteName">사이트명 *</Label>
            <Input
              id="siteName"
              {...register('siteName')}
              placeholder="렌탈톡톡"
              className="mt-1"
            />
            {errors.siteName && (
              <p className="text-sm text-red-600 mt-1">
                {typeof errors.siteName.message === 'string' ? errors.siteName.message : '사이트명을 입력하세요'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteBasicInfoTab;
