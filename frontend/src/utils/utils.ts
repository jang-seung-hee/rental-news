/**
 * 현재 이번달을 YYYY-MM 형식으로 반환
 * @returns {string} 이번달 (예: "2024-01")
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}; 