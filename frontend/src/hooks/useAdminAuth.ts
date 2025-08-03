import { useState, useEffect } from 'react';

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isPasswordDialogOpen: boolean;
  openPasswordDialog: () => void;
  closePasswordDialog: () => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // 인증 상태 확인 (24시간 유효)
  const checkAuthStatus = (): boolean => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    const authTimestamp = localStorage.getItem('adminAuthTimestamp');
    
    if (!authStatus || !authTimestamp) {
      return false;
    }

    const timestamp = parseInt(authTimestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24시간

    // 24시간이 지났으면 인증 만료
    if (now - timestamp > twentyFourHours) {
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminAuthTimestamp');
      return false;
    }

    return authStatus === 'true';
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);
  }, []);

  const openPasswordDialog = () => {
    setIsPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setIsPasswordDialogOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminAuthTimestamp');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isPasswordDialogOpen,
    openPasswordDialog,
    closePasswordDialog,
    logout,
    checkAuthStatus
  };
}; 