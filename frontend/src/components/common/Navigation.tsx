import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const location = useLocation();
  const { isAdmin, signOut } = useAdminAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/',
      label: '대시보드',
      icon: HomeIcon,
      description: '프로모션 관리 대시보드'
    },
    {
      path: '/promotions',
      label: '프로모션 목록',
      icon: DocumentTextIcon,
      description: '프로모션 조회 및 관리'
    },

    {
      path: '/settings',
      label: '설정',
      icon: Cog6ToothIcon,
      description: '시스템 설정'
    }
  ];

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto py-3 px-4 ${
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">{item.description}</span>
                  </div>
                </Button>
              </Link>
            );
          })}
        </nav>
        
        {/* 관리자 로그아웃 버튼 */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start gap-3 h-auto py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">관리자 로그아웃</span>
                <span className="text-xs opacity-70">관리자 권한 해제</span>
              </div>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Navigation; 