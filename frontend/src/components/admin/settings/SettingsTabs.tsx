import React from 'react';
import { cn } from '../../../lib/utils';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'site-basic',
      label: '사이트 기본 정보',
      description: '사이트명 등 기본 정보'
    },
    {
      id: 'sharing-info',
      label: '공유시 나타나는 정보',
      description: '메타 정보, 기본 이미지, 파비콘'
    },
    {
      id: 'inactive-promotion',
      label: '비활성화된 프로모션 표시 정보',
      description: '안내 메시지 설정'
    },
    {
      id: 'admin-management',
      label: '관리자 계정 관리',
      description: '관리자 추가/삭제'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
      <nav className="flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 whitespace-nowrap py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 relative',
              activeTab === tab.id
                ? 'bg-blue-800 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            <div className="text-center">
              <div className="font-semibold">{tab.label}</div>
              <div className={cn(
                "text-xs mt-1",
                activeTab === tab.id ? "text-blue-50" : "text-gray-500"
              )}>
                {tab.description}
              </div>
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-800 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsTabs;
