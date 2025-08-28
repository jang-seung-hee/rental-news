/**
 * 텍스트의 줄바꿈 문자(\n)를 HTML <br> 태그로 변환합니다.
 * @param text 변환할 텍스트
 * @returns HTML <br> 태그가 포함된 문자열
 */
export const convertLineBreaksToHtml = (text: string): string => {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
};

/**
 * 텍스트에 줄바꿈이 포함되어 있는지 확인합니다.
 * @param text 확인할 텍스트
 * @returns 줄바꿈 포함 여부
 */
export const hasLineBreaks = (text: string): boolean => {
  if (!text) return false;
  return text.includes('\n');
};
