import React, { useState } from 'react';
import SettingsTabs from '../components/admin/settings/SettingsTabs';
import SiteBasicInfoTab from '../components/admin/settings/SiteBasicInfoTab';
import SharingInfoTab from '../components/admin/settings/SharingInfoTab';
import InactivePromotionTab from '../components/admin/settings/InactivePromotionTab';
import AdminManagementTab from '../components/admin/settings/AdminManagementTab';

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('site-basic');

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="admin-page-title">시스템 설정</h1>
          <p className="admin-description mt-1">
            프로모션 공유 시 나타나는 메타 정보와 사이트 기본 설정을 관리합니다.
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 탭 컨텐츠 - 각 탭이 독립적으로 관리됩니다 */}
      <div className="min-h-[500px]">
        {activeTab === 'site-basic' && <SiteBasicInfoTab />}
        {activeTab === 'sharing-info' && <SharingInfoTab />}
        {activeTab === 'inactive-promotion' && <InactivePromotionTab />}
        {activeTab === 'admin-management' && <AdminManagementTab />}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
