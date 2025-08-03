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
import AdminPasswordDialog from './components/common/AdminPasswordDialog';

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
  const { isAuthenticated, isPasswordDialogOpen, openPasswordDialog, closePasswordDialog } = useAdminAuth();

  // 프로모션 뷰 페이지는 인증 없이 접근 가능
  if (isPromotionView) {
    return (
      <Routes>
        <Route path="/view/:id" element={<PromotionViewPage />} />
      </Routes>
    );
  }

  // 관리자 인증이 필요한 모든 페이지 (프로모션 뷰 제외)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">관리자 로그인</h2>
            <p className="text-gray-600 mb-6">
              렌탈톡톡 관리 시스템에 접근하려면 관리자 권한이 필요합니다.
            </p>
            <button
              onClick={openPasswordDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              관리자 로그인
            </button>
          </div>
        </div>
        
        <AdminPasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={closePasswordDialog}
          onSuccess={closePasswordDialog}
        />
      </div>
    );
  }

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
      
      <AdminPasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={closePasswordDialog}
        onSuccess={closePasswordDialog}
      />
    </div>
  );
};

export default App;
