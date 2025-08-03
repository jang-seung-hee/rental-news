import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

interface BreadcrumbNavItem {
  label: string;
  path?: string;
}

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbItems = (): BreadcrumbNavItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return [{ label: '대시보드' }];
    }

    const items: BreadcrumbNavItem[] = [
      { label: '대시보드', path: '/' }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      
      // 경로별 라벨 매핑
      switch (segment) {
        case 'promotions':
          label = '프로모션';
          break;
        case 'new':
          label = '등록';
          break;
        case 'settings':
          label = '설정';
          break;
        default:
          // ID인 경우 "상세"로 표시
          if (segment.length > 20) {
            label = '상세';
          }
          break;
      }

      if (index === pathSegments.length - 1) {
        // 마지막 항목은 링크가 아님
        items.push({ label });
      } else {
        items.push({ label, path: currentPath });
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.path ? (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav; 