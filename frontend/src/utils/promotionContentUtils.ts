/**
 * 프로모션 내용 처리 유틸리티
 * - "---" 문자로 그룹을 분리
 * - 가로선에 상하 분리 효과 추가
 * - 특정 키워드에 효과 적용
 */

export interface ContentGroup {
  id: string;
  content: string;
  type: 'text' | 'separator';
}

/**
 * 프로모션 내용을 그룹으로 분리하는 함수
 * @param content 원본 프로모션 내용
 * @returns 분리된 콘텐츠 그룹 배열
 */
export function parsePromotionContent(content: string): ContentGroup[] {
  if (!content) return [];

  // "---" 문자로 내용을 분리
  const parts = content.split('---').map(part => part.trim()).filter(part => part.length > 0);
  
  const groups: ContentGroup[] = [];
  
  parts.forEach((part, index) => {
    // 각 그룹에 고유 ID 부여
    const groupId = `group-${index + 1}`;
    
    // 가로선이 포함된 경우 상하 분리 효과 추가
    const processedContent = processHorizontalLines(part);
    
    groups.push({
      id: groupId,
      content: processedContent,
      type: 'text'
    });
    
    // 마지막 그룹이 아닌 경우 구분자 추가
    if (index < parts.length - 1) {
      groups.push({
        id: `separator-${index + 1}`,
        content: '',
        type: 'separator'
      });
    }
  });
  
  return groups;
}

/**
 * 특정 키워드에 효과를 적용하는 함수
 * @param content 원본 콘텐츠
 * @returns 키워드 효과가 적용된 콘텐츠
 */
function applyKeywordEffects(content: string): string {
  if (!content) return content;

  // HTML 태그를 임시로 보호
  const tagPlaceholders: string[] = [];
  let tagIndex = 0;
  
  // HTML 태그를 임시로 대체
  let processedContent = content.replace(/<[^>]*>/g, (match) => {
    const placeholder = `__TAG_PLACEHOLDER_${tagIndex}__`;
    tagPlaceholders[tagIndex] = match;
    tagIndex++;
    return placeholder;
  });

  // 키워드 효과 적용
  const keywordEffects = [
    {
      keyword: '타사보상',
      className: 'keyword-green-neon'
    },
    {
      keyword: '면제',
      className: 'keyword-yellow'
    },
    {
      keyword: '반값',
      className: 'keyword-yellow'
    },
    {
      keyword: '무료',
      className: 'keyword-yellow'
    },
    {
      keyword: '추천',
      className: 'keyword-pink-neon'
    },
    {
      keyword: 'NEW',
      className: 'keyword-yellow'
    }
  ];

  // 각 키워드에 대해 효과 적용
  keywordEffects.forEach(({ keyword, className }) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    processedContent = processedContent.replace(regex, `<span class="${className}">$1</span>`);
  });

  // HTML 태그 복원
  tagPlaceholders.forEach((tag, index) => {
    processedContent = processedContent.replace(`__TAG_PLACEHOLDER_${index}__`, tag);
  });

  return processedContent;
}

/**
 * 가로선에 상하 분리 효과를 추가하는 함수
 * @param content 원본 콘텐츠
 * @returns 가로선이 처리된 콘텐츠
 */
function processHorizontalLines(content: string): string {
  if (!content) return content;
  
  // 다양한 가로선 패턴을 처리
  const horizontalLinePatterns = [
    /^[-=_*]{3,}$/gm,           // ---, ===, ___, ***
    /^[-=_*]{2,}$/gm,           // --, ==, __, **
    /<hr\s*\/?>/gi,             // <hr> 태그
    /<hr\s+[^>]*\/?>/gi,        // <hr> 태그 (속성 포함)
  ];
  
  let processedContent = content;
  
  horizontalLinePatterns.forEach(pattern => {
    processedContent = processedContent.replace(pattern, (match) => {
      // 가로선을 상하 분리 효과가 있는 스타일로 교체 (라벨 제외)
      return `
        <div class="horizontal-separator">
          <div class="separator-line"></div>
          <div class="separator-line"></div>
        </div>
      `;
    });
  });
  
  // 링크 처리 추가
  processedContent = processLinks(processedContent);
  
  // 키워드 효과 적용
  processedContent = applyKeywordEffects(processedContent);
  
  return processedContent;
}

/**
 * 링크를 굵게 표시하고 밑줄을 추가하는 함수
 * @param content 원본 콘텐츠
 * @returns 링크가 처리된 콘텐츠
 */
function processLinks(content: string): string {
  if (!content) return content;
  
  // URL 패턴 (http/https로 시작하는 링크)
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  
  // HTML 태그 내부가 아닌 텍스트 링크만 처리
  let processedContent = content;
  
  // HTML 태그를 임시로 보호
  const tagPlaceholders: string[] = [];
  let tagIndex = 0;
  
  // HTML 태그를 임시로 대체
  processedContent = processedContent.replace(/<[^>]*>/g, (match) => {
    const placeholder = `__TAG_PLACEHOLDER_${tagIndex}__`;
    tagPlaceholders[tagIndex] = match;
    tagIndex++;
    return placeholder;
  });
  
  // 링크 처리 (HTML 태그가 보호된 상태에서)
  processedContent = processedContent.replace(urlPattern, (match) => {
    return `<span class="promotion-link" style="font-weight: bold; text-decoration: underline;">${match}</span>`;
  });
  
  // HTML 태그 복원
  tagPlaceholders.forEach((tag, index) => {
    processedContent = processedContent.replace(`__TAG_PLACEHOLDER_${index}__`, tag);
  });
  
  return processedContent;
}

/**
 * 프로모션 내용을 HTML로 렌더링하는 함수
 * @param content 원본 프로모션 내용
 * @returns 렌더링된 HTML 문자열
 */
export function renderPromotionContent(content: string): string {
  const groups = parsePromotionContent(content);
  
  if (groups.length === 0) {
    return '<p class="text-muted-foreground">내용이 없습니다.</p>';
  }
  
  const renderedGroups = groups.map(group => {
    if (group.type === 'separator') {
      return `
        <div class="content-separator">
          <div class="separator-line"></div>
          <div class="separator-line"></div>
        </div>
      `;
    } else {
      return `
        <div class="content-group" data-group-id="${group.id}">
          <div class="group-content">
            ${group.content}
          </div>
        </div>
      `;
    }
  });
  
  return `
    <div class="promotion-content-container">
      ${renderedGroups.join('')}
    </div>
  `;
}

/**
 * 프로모션 내용의 그룹 수를 반환하는 함수
 * @param content 원본 프로모션 내용
 * @returns 그룹 수
 */
export function getContentGroupCount(content: string): number {
  if (!content) return 0;
  const groups = parsePromotionContent(content);
  return groups.filter(group => group.type === 'text').length;
}

/**
 * 프로모션 내용에서 특정 그룹을 추출하는 함수
 * @param content 원본 프로모션 내용
 * @param groupIndex 그룹 인덱스 (0부터 시작)
 * @returns 해당 그룹의 내용, 없으면 null
 */
export function getContentGroup(content: string, groupIndex: number): string | null {
  const groups = parsePromotionContent(content);
  const textGroups = groups.filter(group => group.type === 'text');
  
  if (groupIndex >= 0 && groupIndex < textGroups.length) {
    return textGroups[groupIndex].content;
  }
  
  return null;
} 