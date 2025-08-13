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

  // "===" 문자로 내용을 분리
  const parts = content.split('===').map(part => part.trim()).filter(part => part.length > 0);
  
  const groups: ContentGroup[] = [];
  
  parts.forEach((part, index) => {
    // 각 그룹에 고유 ID 부여
    const groupId = `group-${index + 1}`;
    
    // 가로선이 포함된 경우 상하 분리 효과 추가
    let processedContent = processHorizontalLines(part);
    
    // !!문자!! 패턴 처리 (연한 분홍색 배경)
    processedContent = processLightPinkPattern(processedContent);
    
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
  // 키워드 효과 기능을 비활성화
  return content;
}

/**
 * [[문자]] 패턴을 회색 그룹박스로 변환하는 함수
 * @param content 원본 콘텐츠
 * @returns [[문자]] 패턴이 처리된 콘텐츠
 */
function processGrayBoxPattern(content: string): string {
  if (!content) return content;

  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // [[문자]] 패턴을 회색 그룹박스로 변환
  const grayBoxPattern = /\[\[([^\]]+)\]\]/g;
  processedContent = processedContent.replace(grayBoxPattern, (match, innerText) => {
    return `<span class="gray-group-box">${innerText}</span>`;
  });

  return processedContent;
}

/**
 * ""문자"" 패턴을 연한 파란색 배경으로 변환하는 함수
 * @param content 원본 콘텐츠
 * @returns ""문자"" 패턴이 처리된 콘텐츠
 */
function processPinkGradientPattern(content: string): string {
  if (!content) return content;

  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // ""문자"" 패턴을 연한 파란색 배경으로 변환
  const pinkGradientPattern = /""([^"]+)""/g;
  processedContent = processedContent.replace(pinkGradientPattern, (match, innerText) => {
    return `<span class="pink-gradient-bg">${innerText}</span>`;
  });

  return processedContent;
}

/**
 * <<문자>> 패턴을 파란색 소제목 타이틀로 변환하는 함수
 * @param content 원본 콘텐츠
 * @returns <<문자>> 패턴이 처리된 콘텐츠
 */
function processBlueTitlePattern(content: string): string {
  if (!content) return content;

  console.log('=== processBlueTitlePattern 시작 ===');
  console.log('원본 콘텐츠:', JSON.stringify(content));

  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  console.log('HTML 엔티티 디코딩 후:', JSON.stringify(processedContent));
  
  // <<문자>> 패턴을 파란색 소제목 타이틀로 변환
  const blueTitlePattern = /<<([^>]+)>>/g;
  processedContent = processedContent.replace(blueTitlePattern, (match, innerText) => {
    console.log(`파란색 타이틀 패턴 발견: "${match}" -> "${innerText}"`);
    return `<span class="blue-title-label">${innerText}</span>`;
  });
  
  console.log('패턴 처리 후:', JSON.stringify(processedContent));
  console.log('=== processBlueTitlePattern 완료 ===');

  return processedContent;
}

/**
 * !!문자!! 패턴을 연한 분홍색 배경으로 변환하는 함수
 * @param content 원본 콘텐츠
 * @returns !!문자!! 패턴이 처리된 콘텐츠
 */
function processLightPinkPattern(content: string): string {
  if (!content) return content;

  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // !!문자!! 패턴을 연한 분홍색 배경으로 변환
  const lightPinkPattern = /!!([^!]+)!!/g;
  processedContent = processedContent.replace(lightPinkPattern, (match, innerText) => {
    return `<span class="light-pink-bg">${innerText}</span>`;
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
  
  console.log('=== processHorizontalLines 시작 ===');
  console.log('원본 콘텐츠:', JSON.stringify(content));
  
  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  console.log('HTML 엔티티 디코딩 후:', JSON.stringify(processedContent));
  
  // 커스텀 패턴들을 먼저 처리 (HTML 태그 보호 전에)
  console.log('커스텀 패턴 처리 시작');
  
  // <<문자>> 패턴 처리 (파란색 소제목 타이틀)
  processedContent = processBlueTitlePattern(processedContent);
  
  // [[문자]] 패턴 처리 (회색 그룹박스)
  processedContent = processGrayBoxPattern(processedContent);
  
  // ""문자"" 패턴 처리 (분홍색 그라데이션 배경)
  processedContent = processPinkGradientPattern(processedContent);
  
  // !!문자!! 패턴 처리 (연한 분홍색 배경)
  processedContent = processLightPinkPattern(processedContent);
  
  console.log('커스텀 패턴 처리 후:', JSON.stringify(processedContent));
  
  // HTML 태그를 임시로 보호
  const tagPlaceholders: string[] = [];
  let tagIndex = 0;
  
  // HTML 태그를 임시로 대체 (URL 정규식과 시각적 출력에 간섭하지 않도록 HTML 주석 사용)
  processedContent = processedContent.replace(/<[^>]*>/g, (match) => {
    const placeholder = `<!--TAG_PLACEHOLDER_${tagIndex}-->`;
    tagPlaceholders[tagIndex] = match;
    tagIndex++;
    return placeholder;
  });
  
  console.log('HTML 태그 보호 후:', JSON.stringify(processedContent));
  
  // --- (두꺼운 가로선) 패턴 처리
  const thickLinePattern = /-{3,}/g;
  processedContent = processedContent.replace(thickLinePattern, (match) => {
    console.log(`두꺼운 가로선 패턴 발견: "${match}"`);
    return '<div class="thick-horizontal-line"></div>';
  });
  
  // === (구분자) 패턴 처리 - 인사말/매듭말에서도 동일하게 두꺼운 가로선으로 표현
  const tripleEqualPattern = /= {0,}={2,}|={3,}/g;
  processedContent = processedContent.replace(tripleEqualPattern, () => '<div class="thick-horizontal-line"></div>');
  
  // ... (점선) 패턴 처리
  const dottedLinePattern = /\.{3,}/g;
  processedContent = processedContent.replace(dottedLinePattern, (match) => {
    console.log(`점선 패턴 발견: "${match}"`);
    return '<div class="dotted-separator"></div>';
  });
  
  console.log('가로선 패턴 처리 후:', JSON.stringify(processedContent));
  
  // HTML 태그 복원
  tagPlaceholders.forEach((tag, index) => {
    processedContent = processedContent.replace(`<!--TAG_PLACEHOLDER_${index}-->`, tag);
  });
  
  console.log('HTML 태그 복원 후:', JSON.stringify(processedContent));
  
  // 링크 처리 추가
  processedContent = processLinks(processedContent);
  
  // 키워드 효과 적용 (비활성화됨)
  processedContent = applyKeywordEffects(processedContent);
  
  console.log('=== processHorizontalLines 완료 ===');
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
  
  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // HTML 태그를 임시로 보호
  const tagPlaceholders: string[] = [];
  let tagIndex = 0;
  
  // HTML 태그를 임시로 대체 (URL 정규식과 시각적 출력에 간섭하지 않도록 HTML 주석 사용)
  processedContent = processedContent.replace(/<[^>]*>/g, (match) => {
    const placeholder = `<!--TAG_PLACEHOLDER_${tagIndex}-->`;
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
    processedContent = processedContent.replace(`<!--TAG_PLACEHOLDER_${index}-->`, tag);
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
          ${group.content}
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

/**
 * 인사말과 매듭말을 위한 전용 렌더링 함수
 * @param content 원본 내용
 * @returns 렌더링된 HTML 문자열
 */
export function renderGreetingClosingContent(content: string): string {
  if (!content) {
    return '<p class="text-muted-foreground">내용이 없습니다.</p>';
  }
  
  // HTML 엔티티를 먼저 디코딩
  let processedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // 줄 바꿈을 <br> 태그로 변환
  processedContent = processedContent.replace(/\n/g, '<br>');
  
  // 커스텀 패턴들을 먼저 처리 (HTML 태그 보호 전에)
  console.log('renderGreetingClosingContent - 커스텀 패턴 처리 시작');
  
  // <<문자>> 패턴 처리 (파란색 소제목 타이틀)
  processedContent = processBlueTitlePattern(processedContent);
  
  // !!문자!! 패턴 처리 (연한 분홍색 배경)
  processedContent = processLightPinkPattern(processedContent);
  
  // [[문자]] 패턴 처리 (회색 그룹박스)
  processedContent = processGrayBoxPattern(processedContent);
  
  // ""문자"" 패턴 처리 (분홍색 그라데이션 배경)
  processedContent = processPinkGradientPattern(processedContent);
  
  // 가로선 패턴 처리 (---, ===, ...)
  processedContent = processHorizontalLines(processedContent);
  
  console.log('renderGreetingClosingContent - 커스텀 패턴 처리 후:', JSON.stringify(processedContent));
  
  // HTML 태그를 임시로 보호
  const tagPlaceholders: string[] = [];
  let tagIndex = 0;
  
  // HTML 태그를 임시로 대체 (URL 정규식과 시각적 출력에 간섭하지 않도록 HTML 주석 사용)
  processedContent = processedContent.replace(/<[^>]*>/g, (match) => {
    const placeholder = `<!--TAG_PLACEHOLDER_${tagIndex}-->`;
    tagPlaceholders[tagIndex] = match;
    tagIndex++;
    return placeholder;
  });
  
  // URL 패턴을 실제 클릭 가능한 링크로 변환
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  processedContent = processedContent.replace(urlPattern, (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer" class="greeting-closing-link">${match}</a>`;
  });
  
  // HTML 태그 복원
  tagPlaceholders.forEach((tag, index) => {
    processedContent = processedContent.replace(`<!--TAG_PLACEHOLDER_${index}-->`, tag);
  });
  
  return `
    <div class="greeting-closing-content">
      ${processedContent}
    </div>
  `;
} 

/**
 * 테스트용 함수 - <<문자>> 패턴 처리 확인
 * @param content 테스트할 내용
 * @returns 처리 결과
 */
export function testBlueTitlePattern(content: string): string {
  console.log('=== 테스트 시작 ===');
  console.log('원본:', content);
  
  const result = processBlueTitlePattern(content);
  console.log('결과:', result);
  console.log('=== 테스트 완료 ===');
  
  return result;
} 