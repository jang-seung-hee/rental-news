// useConfirm 훅 사용 예제
import React from 'react';
import { Button } from '../components/ui/button';
import { useConfirm } from '../hooks/useConfirm';

const ConfirmDialogExample: React.FC = () => {
  const { confirm, ConfirmComponent } = useConfirm();

  // 기본 확인창
  const handleDefaultConfirm = async () => {
    const confirmed = await confirm({
      title: '확인',
      message: '정말 실행하시겠습니까?',
      confirmText: '실행',
      cancelText: '취소'
    });

    if (confirmed) {
      alert('실행되었습니다!');
    }
  };

  // 위험 작업 확인창
  const handleDangerConfirm = async () => {
    const confirmed = await confirm({
      title: '삭제 확인',
      message: '이 작업은 되돌릴 수 없습니다.\n정말 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger'
    });

    if (confirmed) {
      alert('삭제되었습니다!');
    }
  };

  // 경고 확인창
  const handleWarningConfirm = async () => {
    const confirmed = await confirm({
      title: '주의',
      message: '이 작업은 시스템에 영향을 줄 수 있습니다.\n계속하시겠습니까?',
      confirmText: '계속',
      cancelText: '취소',
      variant: 'warning'
    });

    if (confirmed) {
      alert('작업이 진행됩니다!');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">확인창 사용 예제</h2>
      
      <div className="space-y-3">
        <Button onClick={handleDefaultConfirm} className="mr-3">
          기본 확인창
        </Button>
        
        <Button 
          onClick={handleDangerConfirm} 
          variant="destructive"
          className="mr-3"
        >
          위험 작업 확인창
        </Button>
        
        <Button 
          onClick={handleWarningConfirm}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          경고 확인창
        </Button>
      </div>

      {/* 확인창 컴포넌트 렌더링 */}
      <ConfirmComponent />
    </div>
  );
};

export default ConfirmDialogExample;
