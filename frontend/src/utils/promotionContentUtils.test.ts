/**
 * 프로모션 내용 처리 유틸리티 테스트
 */

import { 
  parsePromotionContent, 
  renderPromotionContent, 
  getContentGroupCount, 
  getContentGroup,
  ContentGroup 
} from './promotionContentUtils';

// 모듈 선언을 위한 빈 export
export {};

describe('프로모션 내용 처리 유틸리티', () => {
  describe('parsePromotionContent', () => {
    it('빈 문자열을 처리할 수 있어야 한다', () => {
      const result = parsePromotionContent('');
      expect(result).toEqual([]);
    });

    it('null 값을 처리할 수 있어야 한다', () => {
      const result = parsePromotionContent(null as any);
      expect(result).toEqual([]);
    });

    it('단일 그룹을 처리할 수 있어야 한다', () => {
      const content = '이것은 단일 그룹입니다.';
      const result = parsePromotionContent(content);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'group-1',
        content: '이것은 단일 그룹입니다.',
        type: 'text'
      });
    });

    it('"---"로 구분된 여러 그룹을 처리할 수 있어야 한다', () => {
      const content = '첫 번째 그룹---두 번째 그룹---세 번째 그룹';
      const result = parsePromotionContent(content);
      
      expect(result).toHaveLength(5); // 3개 그룹 + 2개 구분자
      expect(result[0]).toEqual({
        id: 'group-1',
        content: '첫 번째 그룹',
        type: 'text'
      });
      expect(result[1]).toEqual({
        id: 'separator-1',
        content: '',
        type: 'separator'
      });
      expect(result[2]).toEqual({
        id: 'group-2',
        content: '두 번째 그룹',
        type: 'text'
      });
      expect(result[3]).toEqual({
        id: 'separator-2',
        content: '',
        type: 'separator'
      });
      expect(result[4]).toEqual({
        id: 'group-3',
        content: '세 번째 그룹',
        type: 'text'
      });
    });

    it('가로선을 포함한 내용을 처리할 수 있어야 한다', () => {
      const content = '첫 번째 내용\n---\n두 번째 내용\n***\n세 번째 내용';
      const result = parsePromotionContent(content);
      
      expect(result).toHaveLength(5);
      expect(result[0].content).toContain('horizontal-separator');
      expect(result[2].content).toContain('horizontal-separator');
    });

    it('링크를 포함한 내용을 처리할 수 있어야 한다', () => {
      const content = '첫 번째 내용\nhttps://example.com\n두 번째 내용';
      const result = parsePromotionContent(content);
      
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain('promotion-link');
      expect(result[0].content).toContain('https://example.com');
    });

    it('HTML 태그 내부의 링크는 처리하지 않아야 한다', () => {
      const content = '텍스트 링크: https://example.com\n<img src="https://image.com/photo.jpg" alt="이미지">\n<a href="https://link.com">링크</a>';
      const result = parsePromotionContent(content);
      
      expect(result).toHaveLength(1);
      // 텍스트 링크는 처리되어야 함
      expect(result[0].content).toContain('promotion-link');
      expect(result[0].content).toContain('https://example.com');
      // HTML 태그 내부의 링크는 그대로 보존되어야 함
      expect(result[0].content).toContain('<img src="https://image.com/photo.jpg" alt="이미지">');
      expect(result[0].content).toContain('<a href="https://link.com">링크</a>');
    });
  });

  describe('renderPromotionContent', () => {
    it('빈 내용에 대해 기본 메시지를 반환해야 한다', () => {
      const result = renderPromotionContent('');
      expect(result).toContain('내용이 없습니다');
    });

    it('단일 그룹을 HTML로 렌더링할 수 있어야 한다', () => {
      const content = '테스트 내용';
      const result = renderPromotionContent(content);
      
      expect(result).toContain('promotion-content-container');
      expect(result).toContain('content-group');
      expect(result).toContain('테스트 내용');
    });

    it('여러 그룹을 HTML로 렌더링할 수 있어야 한다', () => {
      const content = '그룹1---그룹2---그룹3';
      const result = renderPromotionContent(content);
      
      expect(result).toContain('content-separator');
      expect(result).toContain('구분선');
      expect(result).toContain('그룹1');
      expect(result).toContain('그룹2');
      expect(result).toContain('그룹3');
    });

    it('링크가 포함된 내용을 HTML로 렌더링할 수 있어야 한다', () => {
      const content = '테스트 내용 https://example.com 추가 내용';
      const result = renderPromotionContent(content);
      
      expect(result).toContain('promotion-link');
      expect(result).toContain('https://example.com');
      expect(result).toContain('font-weight: bold');
      expect(result).toContain('text-decoration: underline');
    });

    it('HTML 태그와 텍스트 링크가 혼재된 내용을 올바르게 렌더링할 수 있어야 한다', () => {
      const content = '텍스트 링크: https://example.com\n<img src="https://image.com/photo.jpg" alt="이미지">\n<a href="https://link.com">링크</a>';
      const result = renderPromotionContent(content);
      
      // 텍스트 링크는 promotion-link 클래스가 적용되어야 함
      expect(result).toContain('class="promotion-link"');
      expect(result).toContain('https://example.com');
      // HTML 태그는 그대로 보존되어야 함
      expect(result).toContain('<img src="https://image.com/photo.jpg" alt="이미지">');
      expect(result).toContain('<a href="https://link.com">링크</a>');
    });
  });

  describe('getContentGroupCount', () => {
    it('빈 내용의 그룹 수는 0이어야 한다', () => {
      const result = getContentGroupCount('');
      expect(result).toBe(0);
    });

    it('단일 그룹의 그룹 수는 1이어야 한다', () => {
      const result = getContentGroupCount('단일 그룹');
      expect(result).toBe(1);
    });

    it('여러 그룹의 그룹 수를 정확히 계산해야 한다', () => {
      const result = getContentGroupCount('그룹1---그룹2---그룹3');
      expect(result).toBe(3);
    });
  });

  describe('getContentGroup', () => {
    it('존재하지 않는 그룹 인덱스에 대해 null을 반환해야 한다', () => {
      const result = getContentGroup('내용', 999);
      expect(result).toBeNull();
    });

    it('음수 인덱스에 대해 null을 반환해야 한다', () => {
      const result = getContentGroup('내용', -1);
      expect(result).toBeNull();
    });

    it('특정 그룹의 내용을 추출할 수 있어야 한다', () => {
      const content = '첫 번째---두 번째---세 번째';
      const result = getContentGroup(content, 1);
      expect(result).toBe('두 번째');
    });

    it('첫 번째 그룹을 추출할 수 있어야 한다', () => {
      const content = '첫 번째---두 번째';
      const result = getContentGroup(content, 0);
      expect(result).toBe('첫 번째');
    });
  });
});

// 실제 사용 예시 테스트
describe('실제 사용 시나리오', () => {
  it('복잡한 프로모션 내용을 처리할 수 있어야 한다', () => {
    const complexContent = `
      안녕하세요! 특별한 혜택을 준비했습니다.
      
      ---
      
      🎉 신규 고객 특별 할인
      - 20% 할인 혜택
      - 무료 배송
      
      ***
      
      📞 문의: 02-1234-5678
      웹사이트: https://example.com
    `;
    
    const result = renderPromotionContent(complexContent);
    
    expect(result).toContain('promotion-content-container');
    expect(result).toContain('content-group');
         expect(result).toContain('content-separator');
     expect(result).toContain('horizontal-separator');
     expect(result).toContain('신규 고객 특별 할인');
     expect(result).toContain('문의: 02-1234-5678');
     expect(result).toContain('promotion-link');
     expect(result).toContain('https://example.com');
  });
}); 