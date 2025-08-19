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

/**
 * 제목을 기반으로 SEO 친화적인 slug를 생성합니다.
 * @param title - 프로모션 제목
 * @returns 생성된 slug
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
};

/**
 * slug가 고유한지 확인하고 필요시 숫자를 추가합니다.
 * @param baseSlug - 기본 slug
 * @param existingSlugs - 기존 slug 목록
 * @returns 고유한 slug
 */
export const ensureUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}; 