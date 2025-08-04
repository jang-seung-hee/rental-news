import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import './globals.css';

// Pages
import Dashboard from './pages/Dashboard';
import PromotionList from './pages/PromotionList';
import PromotionDetail from './pages/PromotionDetail';
import PromotionNew from './pages/PromotionNew';
import PromotionEdit from './pages/PromotionEdit';
import PromotionViewPage from './pages/PromotionViewPage';
import CustomerList from './pages/CustomerList';
import NotFound from './pages/NotFound';

// Components
import Navigation from './components/common/Navigation';
import BreadcrumbNav from './components/common/BreadcrumbNav';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminLoginForm from './components/common/AdminLoginForm';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Toaster } from './components/ui/toaster';

// Hooks
import { useAdminAuth } from './hooks/useAdminAuth';

// Wrapper Components
const PromotionListWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleEdit = (promotion: any) => {
    navigate(`/promotions/${promotion.id}`);
  };
  
  const handleView = (promotion: any) => {
    navigate(`/promotions/${promotion.id}`);
  };
  
  const handleAdd = () => {
    navigate('/promotions/new');
  };
  
  return (
    <PromotionList 
      onEdit={handleEdit} 
      onView={handleView} 
      onAdd={handleAdd} 
    />
  );
};

const PromotionDetailWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBackToList = () => {
    navigate('/promotions');
  };
  
  return (
    <PromotionDetail onBackToList={handleBackToList} />
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPromotionView = location.pathname.startsWith('/view/');
  const { user, isAdmin, loading } = useAdminAuth();

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 프로모션 뷰 페이지는 인증 없이 접근 가능
  if (isPromotionView) {
    return (
      <>
        <Routes>
          <Route path="/view/:id" element={<PromotionViewPage />} />
        </Routes>
        <Toaster />
      </>
    );
  }

  // 관리자 권한이 없는 경우 로그인 폼 표시
  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }

  // 관리자 권한이 있는 경우 메인 레이아웃 표시
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* 사이드바 네비게이션 */}
        <div className="w-full lg:w-64 bg-white shadow-sm border-b lg:border-b-0 lg:border-r border-gray-200 min-h-screen">
          <div className="p-4 lg:p-6">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">
              렌탈톡톡
            </h1>
            <Navigation />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 헤더 */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 lg:px-6 py-3 lg:py-4">
              <BreadcrumbNav />
            </div>
          </header>

          {/* 페이지 콘텐츠 */}
          <main className="p-4 lg:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/promotions" element={<PromotionListWrapper />} />
              <Route path="/promotions/new" element={<PromotionNew />} />
              <Route path="/promotions/:id" element={<PromotionDetailWrapper />} />
              <Route path="/promotions/:id/edit" element={<PromotionEdit />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/settings" element={<div className="text-center py-8">설정 페이지 (구현 예정)</div>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
