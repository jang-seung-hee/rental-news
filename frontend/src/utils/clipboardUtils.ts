/**
 * 클립보드 복사 유틸리티 함수
 * HTTPS와 HTTP 환경 모두에서 작동하는 클립보드 복사 기능을 제공합니다.
 */

/**
 * 텍스트를 클립보드에 복사합니다.
 * @param text 복사할 텍스트
 * @returns 복사 성공 여부
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // navigator.clipboard API 사용 (HTTPS 환경)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // fallback: document.execCommand 사용 (HTTP 환경)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
};

/**
 * 클립보드 복사 가능 여부를 확인합니다.
 * @returns 클립보드 API 사용 가능 여부
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
};

/**
 * 현재 환경이 보안 컨텍스트(HTTPS)인지 확인합니다.
 * @returns 보안 컨텍스트 여부
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext;
};
