import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            페이지를 찾을 수 없습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                대시보드로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/promotions">
                프로모션 목록으로 이동
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound; 