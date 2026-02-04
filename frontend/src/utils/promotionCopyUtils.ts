import { Promotion, CreatePromotionRequest } from '../types';

/**
 * 2자리 랜덤 대문자 알파벳 생성 (기존 접두사와 다르게 생성)
 */
export const generateRandomAlphabet = (exclude?: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  // 무한 루프 방지를 위해 최대 시도 횟수 설정
  for (let attempt = 0; attempt < 100; attempt++) {
    result = chars.charAt(Math.floor(Math.random() * chars.length)) +
      chars.charAt(Math.floor(Math.random() * chars.length));

    if (result !== exclude) break;
  }

  return result;
};

/**
 * 프로모션 복사를 위해 데이터 변환
 * 규칙:
 * 1. month: 대상 월로 변경
 * 2. code: 앞 6자리(YYYYMM)를 대상 월에 맞춰 변경 (예: 202401-5.1 -> 202402-5.1)
 * 3. slug: [랜덤2][월2][식별코드].[프로젝트명] (예: AA0151.신규탱크형 -> BK0251.신규탱크형)
 * 4. isActive: false로 설정
 * 5. 기타: shortUrl 제거, 타임스탬프는 생략(생성 시 자동 추가)
 */
export const transformPromotionForCopy = (
  promotion: Promotion,
  targetMonth: string,
  randomPrefix: string
): CreatePromotionRequest => {
  const [year, month] = targetMonth.split('-');
  const yearMonthStr = `${year}${month}`; // 202602
  const monthStr = month; // 02

  // 1. 코드 변환
  // 기존 코드가 YYYYMM- 형식인지 확인하고 변환, 아니면 그냥 앞에 붙임
  let newCode = promotion.code;
  if (/^\d{6}-/.test(promotion.code)) {
    newCode = `${yearMonthStr}${promotion.code.substring(6)}`;
  } else {
    // 형식이 다르면 강제 변환 규칙 적용 (예외 처리)
    newCode = `${yearMonthStr}-${promotion.code}`;
  }

  // 2. 슬러그 변환
  // 규칙: [알파벳2][월2][코드2].[프로젝트한글명]

  // 2-1. 프로모션 코드에서 숫자만 2자리 추출 (예: 5.1 -> 51, 4.2 -> 42)
  const codeSuffix = promotion.code.split('-')[1] || '';
  const codeDigits = codeSuffix.replace(/[^0-9]/g, '').substring(0, 2).padEnd(2, '0');

  // 2-2. 기존 슬러그에서 프로젝트명(한글 파트) 추출
  let projectName = '';
  const dotIndex = promotion.slug.indexOf('.');
  if (dotIndex !== -1) {
    // 점 이후의 문자열에서 한글이 시작되는 지점 찾기
    const afterDot = promotion.slug.substring(dotIndex + 1);
    const hangulMatch = afterDot.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣].*/);
    projectName = hangulMatch ? hangulMatch[0] : afterDot;
  } else {
    // 점이 없는 경우 한글 파트만 추출
    const hangulMatch = promotion.slug.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣].*/);
    projectName = hangulMatch ? hangulMatch[0] : promotion.slug;
  }

  // 만약 프로젝트명을 못 찾았다면 기본값 설정
  if (!projectName) projectName = '프로모션';

  const newSlug = `${randomPrefix}${monthStr}${codeDigits}.${projectName}`;

  return {
    code: newCode,
    month: targetMonth,
    target: promotion.target,
    title: promotion.title,
    slug: newSlug,
    greeting: promotion.greeting,
    content: promotion.content,
    closing: promotion.closing,
    otherProduct1: promotion.otherProduct1,
    otherProduct2: promotion.otherProduct2,
    otherProduct3: promotion.otherProduct3,
    otherProduct4: promotion.otherProduct4,
    contact: promotion.contact,
    imageUrl: promotion.imageUrl,
    isActive: false, // 항상 비활성 상태로 생성
    shortUrl: '' // 단축 URL은 항상 초기화
  };
};
