# 프로모션 내용 처리 유틸리티

프로모션 내용을 처리하고 표시하기 위한 유틸리티 함수들을 제공합니다.

## 주요 기능

### 1. 그룹 분리 기능
- `"---"` 문자를 기준으로 프로모션 내용을 그룹으로 분리
- 각 그룹은 독립적인 섹션으로 표시
- 그룹 간 시각적 구분자 제공

### 2. 가로선 처리 기능
- 다양한 가로선 패턴 지원:
  - `---`, `===`, `___`, `***` (3개 이상)
  - `--`, `==`, `__`, `**` (2개 이상)
  - `<hr>` HTML 태그
- 가로선에 상하 분리 효과 적용
- 시각적으로 구분되는 스타일링

### 3. 링크 처리 기능
- 텍스트 링크 자동 감지 및 스타일링
- 굵은 글씨와 밑줄로 링크 강조
- HTML 태그 내부의 링크는 보존
- 다크 모드 지원

## 파일 구조

```
utils/
├── promotionContentUtils.ts      # 주요 유틸리티 함수들
├── promotionContentStyles.css    # 스타일 정의
├── promotionContentUtils.test.ts # 테스트 파일
└── README.md                     # 이 문서
```

## API 문서

### `parsePromotionContent(content: string): ContentGroup[]`

프로모션 내용을 그룹으로 분리합니다.

**매개변수:**
- `content`: 원본 프로모션 내용 문자열

**반환값:**
- `ContentGroup[]`: 분리된 콘텐츠 그룹 배열

**예시:**
```typescript
const content = "첫 번째 그룹---두 번째 그룹---세 번째 그룹";
const groups = parsePromotionContent(content);
// 결과: 5개 요소 (3개 그룹 + 2개 구분자)
```

### `renderPromotionContent(content: string): string`

프로모션 내용을 HTML로 렌더링합니다.

**매개변수:**
- `content`: 원본 프로모션 내용 문자열

**반환값:**
- `string`: 렌더링된 HTML 문자열

**예시:**
```typescript
const content = "프로모션 내용---구분선---추가 내용";
const html = renderPromotionContent(content);
// 결과: 스타일이 적용된 HTML 문자열
```

### `getContentGroupCount(content: string): number`

프로모션 내용의 그룹 수를 반환합니다.

**매개변수:**
- `content`: 원본 프로모션 내용 문자열

**반환값:**
- `number`: 그룹 수

**예시:**
```typescript
const content = "그룹1---그룹2---그룹3";
const count = getContentGroupCount(content);
// 결과: 3
```

### `getContentGroup(content: string, groupIndex: number): string | null`

특정 그룹의 내용을 추출합니다.

**매개변수:**
- `content`: 원본 프로모션 내용 문자열
- `groupIndex`: 그룹 인덱스 (0부터 시작)

**반환값:**
- `string | null`: 해당 그룹의 내용 또는 null

**예시:**
```typescript
const content = "첫 번째---두 번째---세 번째";
const secondGroup = getContentGroup(content, 1);
// 결과: "두 번째"
```

## 사용 방법

### 1. 컴포넌트에서 사용

```typescript
import { renderPromotionContent } from '../../utils/promotionContentUtils';
import '../../utils/promotionContentStyles.css';

// 컴포넌트 내부
<div 
  className="prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: renderPromotionContent(promotion.content) }}
/>
```

### 2. 프로모션 내용 작성 규칙

#### 그룹 분리
```
첫 번째 그룹 내용
---
두 번째 그룹 내용
---
세 번째 그룹 내용
```

#### 가로선 사용
```
일반 내용

---

구분된 내용

***

추가 내용
```

#### 링크 사용
```
일반 텍스트
https://example.com
추가 텍스트

HTML 태그 내부의 링크는 그대로 보존됩니다:
<a href="https://link.com">링크</a>
```

## 스타일링

### CSS 클래스

- `.promotion-content-container`: 전체 컨테이너
- `.content-group`: 개별 그룹
- `.content-separator`: 그룹 간 구분자
- `.horizontal-separator`: 가로선 분리 효과
- `.separator-line`: 구분선
- `.separator-content`: 구분자 내용
- `.separator-text`: 구분자 텍스트
- `.promotion-link`: 링크 스타일링

### 반응형 디자인

- 모바일 환경에서 최적화된 레이아웃
- 다크 모드 지원
- 부드러운 애니메이션 효과

## 테스트

테스트 파일을 통해 모든 기능이 정상적으로 작동하는지 확인할 수 있습니다.

```bash
npm test promotionContentUtils.test.ts
```

## 주의사항

1. **XSS 방지**: `dangerouslySetInnerHTML`을 사용하므로 신뢰할 수 있는 콘텐츠만 처리해야 합니다.
2. **성능**: 대용량 콘텐츠의 경우 렌더링 성능을 고려해야 합니다.
3. **접근성**: 스크린 리더 사용자를 위한 적절한 ARIA 속성 추가를 고려하세요.

## 업데이트 내역

- **v1.0.0**: 초기 버전 - 기본 그룹 분리 및 가로선 처리 기능
- 향후 버전에서 추가 기능 예정 