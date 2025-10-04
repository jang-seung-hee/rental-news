import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import RichTextEditor from '../common/RichTextEditor';
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '../../types';
import { createPromotion, updatePromotion, getPromotionsByMonth, getOtherProductsInfo, getPromotionCodesByMonth, checkCodeDuplicate } from '../../services/promotionService';
import { getCurrentMonth } from '../../utils/utils';

// 폼 유효성 검사 스키마
const promotionSchema = z.object({
  code: z.string().min(1, '프로모션 코드를 입력하세요'),
  month: z.string().min(1, '프로모션 월을 선택하세요'),
  target: z.string().min(1, '타겟 고객그룹을 입력하세요'),
  title: z.string().min(1, '제목을 입력하세요'),
  slug: z.string().min(1, 'URL 슬러그는 필수입니다. 수동으로 입력하거나 기존 프로모션 복사로 설정하세요'),
  greeting: z.string().min(1, '인사말을 입력하세요'),
  content: z.string().min(1, '프로모션 내용을 입력하세요'),
  closing: z.string().min(1, '매듭말을 입력하세요'),
  otherProduct1: z.string().optional(),
  otherProduct2: z.string().optional(),
  otherProduct3: z.string().optional(),
  otherProduct4: z.string().optional(),
  contact: z.string().min(1, '연락처를 입력하세요'),
  shortUrl: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  promotion?: Promotion;
  onSuccess?: (promotionId: string) => void;
  onCancel?: () => void;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  promotion,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [monthPromotions, setMonthPromotions] = useState<Promotion[]>([]);
  const [otherProductInfo, setOtherProductInfo] = useState<{ [key: string]: { code: string; title: string } }>({});
  
  // 기존 프로모션 복사 관련 상태
  const [copyMonth, setCopyMonth] = useState<string>(getCurrentMonth());
  const [copyPromotionCodes, setCopyPromotionCodes] = useState<{ id: string; code: string; title: string }[]>([]);
  const [selectedCopyCode, setSelectedCopyCode] = useState<string>('');
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // slug 중복 확인 관련 상태
  const [slugConflict, setSlugConflict] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  
  // code 중복 확인 관련 상태
  const [codeConflict, setCodeConflict] = useState<string | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: promotion?.code || '',
      month: promotion?.month || getCurrentMonth(),
      target: promotion?.target || '',
      title: promotion?.title || '',
      slug: promotion?.slug || '',
      greeting: promotion?.greeting || '',
      content: promotion?.content || '',
      closing: promotion?.closing || '',
      otherProduct1: promotion?.otherProduct1 || '',
      otherProduct2: promotion?.otherProduct2 || '',
      otherProduct3: promotion?.otherProduct3 || '',
      otherProduct4: promotion?.otherProduct4 || '',
      contact: promotion?.contact || '',
      shortUrl: promotion?.shortUrl || '',
      imageUrl: promotion?.imageUrl || null,
      isActive: promotion?.isActive ?? true
    }
  });

  const watchedContent = watch('content');
  const watchedMonth = watch('month');
  const watchedCode = watch('code');

  // title 변경 시 자동 slug 생성 기능 제거
  // slug는 사용자가 수동으로 입력하거나 기존 프로모션 복사로만 설정 가능

  // code 중복 확인 함수
  const checkCodeConflictHandler = useCallback(async (code: string) => {
    if (!code || code.trim() === '') {
      setCodeConflict(null);
      return;
    }

    setIsCheckingCode(true);
    try {
      const result = await checkCodeDuplicate(code, promotion?.id);
      if (result.success) {
        if (result.data) {
          setCodeConflict(`"${code}"는 이미 사용 중인 프로모션 코드입니다.`);
        } else {
          setCodeConflict(null);
        }
      } else {
        console.error('코드 중복 확인 실패:', result.error);
      }
    } catch (error) {
      console.error('코드 중복 확인 실패:', error);
    } finally {
      setIsCheckingCode(false);
    }
  }, [promotion?.id]);

  // slug 중복 확인 함수
  const checkSlugConflict = useCallback(async (slug: string) => {
    if (!slug || slug.trim() === '') {
      setSlugConflict(null);
      return;
    }

    // 현재 편집 중인 프로모션의 slug는 제외
    const currentSlug = promotion?.slug;
    
    try {
      setIsCheckingSlug(true);
      const { getPromotions } = await import('../../services/promotionService');
      const result = await getPromotions(undefined, undefined, 1000);
      
      if (result.success && result.data) {
        const existingSlugs = result.data.promotions
          .map(p => p.slug)
          .filter(Boolean)
          .filter(s => s !== currentSlug); // 현재 프로모션의 slug는 제외
        
        if (existingSlugs.includes(slug)) {
          setSlugConflict(`이 slug "${slug}"는 이미 사용 중입니다.`);
        } else {
          setSlugConflict(null);
        }
      }
    } catch (error) {
      console.error('Slug 중복 확인 실패:', error);
    } finally {
      setIsCheckingSlug(false);
    }
  }, [promotion?.slug]);

  // 다른제품 정보 로드
  useEffect(() => {
    const loadOtherProductInfo = async () => {
      if (promotion) {
        const otherProductIds = [
          promotion.otherProduct1,
          promotion.otherProduct2,
          promotion.otherProduct3,
          promotion.otherProduct4
        ].filter(Boolean);

        if (otherProductIds.length > 0) {
          try {
            const result = await getOtherProductsInfo(otherProductIds);
            if (result.success && result.data) {
              setOtherProductInfo(result.data);
            }
          } catch (error) {
            // 다른제품 정보 로드 실패 시 무시하고 진행
          }
        }
      }
    };

    loadOtherProductInfo();
  }, [promotion]);

  // code 변경 감지 및 중복 검사
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedCode && watchedCode.trim() !== '') {
        checkCodeConflictHandler(watchedCode);
      }
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [watchedCode, checkCodeConflictHandler]);

  // 월별 프로모션 조회
  useEffect(() => {
    const fetchMonthPromotions = async () => {
      // 새 프로모션 등록 중이고 월이 선택되지 않은 경우
      if (!promotion && !watchedMonth) {
        setMonthPromotions([]);
        return;
      }

      // 프로모션 수정 중이거나 새 프로모션 등록 중에 월이 선택된 경우
      const targetMonth = watchedMonth || promotion?.month;
      if (targetMonth) {
        try {
          const result = await getPromotionsByMonth(targetMonth, promotion?.id);
          if (result.success && result.data) {
            setMonthPromotions(result.data);
          } else {
            setMonthPromotions([]);
          }
        } catch (error) {
          // 월별 프로모션 조회 실패 시 무시하고 진행
          setMonthPromotions([]);
        }
      } else {
        setMonthPromotions([]);
      }
    };

    fetchMonthPromotions();
  }, [watchedMonth, promotion?.id, promotion]); // promotion 의존성 추가

  // 다른제품 드롭다운 옵션 렌더링 함수
  const renderOtherProductOptions = () => {
    // 새 프로모션 등록 중이고 월이 선택되지 않은 경우
    if (!promotion && !watchedMonth) {
      return <option value="" disabled>프로모션 월을 지정하지 않았습니다.</option>;
    }

    // 프로모션 수정 중이거나 새 프로모션 등록 중에 월이 선택된 경우
    const targetMonth = watchedMonth || promotion?.month;
    if (!targetMonth) {
      return <option value="" disabled>프로모션 월을 지정하지 않았습니다.</option>;
    }

    // 로딩 중이고 프로모션 수정 모드인 경우 기존 선택 유지
    if (monthPromotions.length === 0 && promotion) {
      return <option value="" disabled>다른제품 정보를 불러오는 중...</option>;
    }

    if (monthPromotions.length === 0) {
      return <option value="" disabled>해당 월에 다른 프로모션이 없습니다.</option>;
    }

    return monthPromotions.map((promo) => (
      <option key={promo.id} value={promo.id}>
        {promo.code} - {promo.title}
      </option>
    ));
  };

  // 월 옵션 생성 (현재 년도부터 2년 후까지)
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year <= currentYear + 2; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const value = `${year}-${monthStr}`;
        const label = `${year}년 ${month}월`;
        options.push({ value, label });
      }
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  // 기존 프로모션 복사 관련 함수들
  const handleCopyMonthChange = async (month: string) => {
    setCopyMonth(month);
    setSelectedCopyCode('');
    
    if (month) {
      try {
        const result = await getPromotionCodesByMonth(month);
        if (result.success && result.data) {
          setCopyPromotionCodes(result.data);
        } else {
          setCopyPromotionCodes([]);
        }
      } catch (error) {
        // 프로모션 코드 조회 실패 시 무시하고 진행
        setCopyPromotionCodes([]);
      }
    } else {
      setCopyPromotionCodes([]);
    }
  };

  const handleApplyCopy = async () => {
    if (!selectedCopyCode) return;

    setIsCopyLoading(true);
    try {
      // 선택된 프로모션의 전체 정보를 가져오기 위해 getPromotionById 사용
      const { getPromotionById } = await import('../../services/promotionService');
      const result = await getPromotionById(selectedCopyCode);
      
      if (result.success && result.data) {
        const selectedPromotion = result.data;
        setValue('code', `${selectedPromotion.code}(copy)`);
        setValue('target', selectedPromotion.target);
        setValue('title', selectedPromotion.title);
        setValue('slug', selectedPromotion.slug || ''); // slug 추가
        setValue('greeting', selectedPromotion.greeting);
        setValue('content', selectedPromotion.content);
        setValue('closing', selectedPromotion.closing);
        setValue('otherProduct1', selectedPromotion.otherProduct1 || '');
        setValue('otherProduct2', selectedPromotion.otherProduct2 || '');
        setValue('otherProduct3', selectedPromotion.otherProduct3 || '');
        setValue('otherProduct4', selectedPromotion.otherProduct4 || '');
        setValue('contact', selectedPromotion.contact);
        setValue('imageUrl', selectedPromotion.imageUrl);
        setValue('isActive', selectedPromotion.isActive ?? true);
      } else {
        setError('선택한 프로모션을 찾을 수 없습니다.');
      }
    } catch (error) {
      // 프로모션 복사 중 오류 발생 시 무시하고 진행
      setError('프로모션 복사 중 오류가 발생했습니다.');
    } finally {
      setIsCopyLoading(false);
    }
  };

  // 전체화면 모드 토글 핸들러
  const handleFullscreenToggle = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  };

  // 랜덤 문자 생성 함수 (대소문자 알파벳만)
  const generateRandomChars = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars.charAt(Math.floor(Math.random() * chars.length)) + 
           chars.charAt(Math.floor(Math.random() * chars.length));
  };

  // 랜덤 문자 버튼 클릭 핸들러
  const handleRandomSlug = () => {
    const currentSlug = watch('slug') || '';
    const randomChars = generateRandomChars();
    
    // 기존 슬러그가 있으면 첫 두 글자만 랜덤으로 교체, 없으면 랜덤 두 글자 생성
    if (currentSlug.length >= 2) {
      const newSlug = randomChars + currentSlug.slice(2);
      setValue('slug', newSlug);
    } else {
      setValue('slug', randomChars + currentSlug);
    }
    
    // 변경된 슬러그로 중복 확인
    const newSlug = currentSlug.length >= 2 ? randomChars + currentSlug.slice(2) : randomChars + currentSlug;
    checkSlugConflict(newSlug);
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: PromotionFormData) => {
    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      if (promotion) {
        // 수정 모드
        const updateData: UpdatePromotionRequest = {
          id: promotion.id,
          ...data
        };
        
        const result = await updatePromotion(promotion.id, updateData);
        if (result.success) {
          if (result.warning) {
            setWarning(result.warning);
          }
          onSuccess?.(promotion.id);
        } else {
          setError(result.error || '프로모션 수정에 실패했습니다.');
        }
      } else {
        // 생성 모드
        const createData: CreatePromotionRequest = {
          ...data
        };
        
        const result = await createPromotion(createData);
        if (result.success && result.data) {
          if (result.warning) {
            setWarning(result.warning);
          }
          onSuccess?.(result.data);
        } else {
          setError(result.error || '프로모션 생성에 실패했습니다.');
        }
      }
    } catch (err) {
      // 폼 제출 실패 시 사용자에게 알림
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-600">
          {promotion ? '프로모션 수정' : '새 프로모션 등록'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 경고 메시지 */}
          {warning && (
            <Alert variant="default" className="border-yellow-300 bg-yellow-50 text-yellow-800">
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

          {/* 전체화면 모드일 때는 프로모션 내용만 표시 */}
          {isFullscreen ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">프로모션 내용 *</Label>
                <RichTextEditor
                  value={watchedContent}
                  onChange={(value) => setValue('content', value)}
                  placeholder="프로모션 내용을 입력하세요..."
                  height="400px"
                  fullscreen={isFullscreen}
                  onFullscreenChange={handleFullscreenToggle}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 기존 프로모션 복사 섹션 (새 프로모션 등록 시에만 표시) */}
              {!promotion && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">기존 프로모션 복사</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="copyMonth">프로모션 월</Label>
                      <select
                        id="copyMonth"
                        value={copyMonth}
                        onChange={(e) => handleCopyMonthChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">월을 선택하세요</option>
                        {monthOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="copyPromotionCode">프로모션 코드</Label>
                      <select
                        id="copyPromotionCode"
                        value={selectedCopyCode}
                        onChange={(e) => setSelectedCopyCode(e.target.value)}
                        disabled={!copyMonth || copyPromotionCodes.length === 0}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !copyMonth || copyPromotionCodes.length === 0
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {!copyMonth 
                            ? '월을 먼저 선택하세요' 
                            : copyPromotionCodes.length === 0 
                              ? '해당 월에 프로모션이 없습니다' 
                              : '프로모션을 선택하세요'
                          }
                        </option>
                        {copyPromotionCodes.map((promo) => (
                          <option key={promo.id} value={promo.id}>
                            {promo.code} - {promo.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleApplyCopy}
                        disabled={!selectedCopyCode || isCopyLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {isCopyLoading ? '적용 중...' : '적용'}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    * 적용을 누르면 선택한 프로모션의 내용이 아래 입력 필드에 바인딩됩니다. (프로모션 월은 제외)
                  </p>
                </div>
              )}

              {/* 1. 프로모션 정보 섹션 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                  프로모션 정보
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">프로모션 코드 *</Label>
                      <div className="relative">
                        <Input
                          id="code"
                          {...register('code')}
                          placeholder="예: PROMO-2024-001"
                          className={`${errors.code || codeConflict ? 'border-red-500' : ''} ${codeConflict ? 'pr-10' : ''}`}
                        />
                        {isCheckingCode && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      {errors.code && (
                        <p className="text-sm text-red-500">{errors.code.message}</p>
                      )}
                      {codeConflict && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span>⚠️</span>
                          {codeConflict}
                        </p>
                      )}
                      {!errors.code && !codeConflict && watchedCode && !isCheckingCode && (
                        <p className="text-sm text-green-500 flex items-center gap-1">
                          <span>✅</span>
                          사용 가능한 프로모션 코드입니다.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="month">프로모션 월 *</Label>
                      <select
                        id="month"
                        {...register('month')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.month ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">월을 선택하세요</option>
                        {monthOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.month && (
                        <p className="text-sm text-red-500">{errors.month.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target">타겟 고객그룹 *</Label>
                    <Input
                      id="target"
                      {...register('target')}
                      placeholder="예: 신규 고객, 기존 고객, VIP 고객"
                      className={errors.target ? 'border-red-500' : ''}
                    />
                    {errors.target && (
                      <p className="text-sm text-red-500">{errors.target.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">프로모션 제목 *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="프로모션 제목을 입력하세요"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL 슬러그 * (필수)</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="slug"
                            {...register('slug')}
                            placeholder="수동 입력 또는 기존 프로모션 복사"
                            className={`${errors.slug ? 'border-red-500' : ''} ${slugConflict ? 'border-yellow-500' : ''}`}
                            onBlur={(e) => checkSlugConflict(e.target.value)}
                          />
                          {isCheckingSlug && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>
                        {!promotion && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRandomSlug}
                            className="px-3 py-2 text-sm whitespace-nowrap bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-800"
                            title="첫 두 글자를 랜덤 알파벳으로 변경"
                          >
                            랜덤문자
                          </Button>
                        )}
                      </div>
                      {errors.slug && (
                        <p className="text-sm text-red-500">{errors.slug.message}</p>
                      )}
                      {slugConflict && (
                        <p className="text-sm text-yellow-600 font-medium">{slugConflict}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        SEO 친화적인 URL을 위한 슬러그입니다. 수동으로 입력하거나 기존 프로모션 복사로 설정할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* 활성화 상태 */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      프로모션 활성화
                    </Label>
                  </div>


                </div>
              </div>

              {/* 2. 프로모션 콘텐츠 섹션 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                  프로모션 콘텐츠
                </h3>
                <div className="space-y-4">


                  <div className="space-y-2">
                    <Label htmlFor="greeting">인사말 *</Label>
                    <Textarea
                      id="greeting"
                      {...register('greeting')}
                      placeholder="고객에게 전할 인사말을 입력하세요"
                      style={{ height: '300px' }}
                      className={errors.greeting ? 'border-red-500' : ''}
                    />
                    {errors.greeting && (
                      <p className="text-sm text-red-500">{errors.greeting.message}</p>
                    )}
                  </div>

                  {/* 위지워그 에디터 (관리자 수정 화면에서는 항상 라이트 모드 강제) */}
                  <div className="space-y-2 admin-force-light">
                    <Label htmlFor="content">프로모션 내용 *</Label>
                    <RichTextEditor
                      value={watchedContent}
                      onChange={(value) => setValue('content', value)}
                      placeholder="프로모션 내용을 입력하세요..."
                      height="400px"
                      fullscreen={isFullscreen}
                      onFullscreenChange={handleFullscreenToggle}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500">{errors.content.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closing">매듭말 *</Label>
                    <Textarea
                      id="closing"
                      {...register('closing')}
                      placeholder="프로모션 마무리 멘트를 입력하세요"
                      style={{ height: '300px' }}
                      className={errors.closing ? 'border-red-500' : ''}
                    />
                    {errors.closing && (
                      <p className="text-sm text-red-500">{errors.closing.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">연락처 *</Label>
                    <Textarea
                      id="contact"
                      {...register('contact')}
                      placeholder="예: 02-1234-5678, 카톡: @company"
                      style={{ height: '200px' }}
                      className={errors.contact ? 'border-red-500' : ''}
                    />
                    {errors.contact && (
                      <p className="text-sm text-red-500">{errors.contact.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. 추가정보 섹션 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-purple-100">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
                  추가정보
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-purple-700 mb-2">다른제품 선택</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {!promotion && !watchedMonth 
                        ? "프로모션 월을 먼저 선택해주세요." 
                        : promotion 
                          ? "같은 월의 다른 프로모션을 선택할 수 있습니다." 
                          : "같은 월의 다른 프로모션을 선택할 수 있습니다."
                      }
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="otherProduct1">다른제품 1</Label>
                        <select
                          id="otherProduct1"
                          {...register('otherProduct1')}
                          value={watch('otherProduct1') || ''}
                          disabled={!watchedMonth && !promotion?.month}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            !watchedMonth && !promotion?.month 
                              ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">선택하지 않음</option>
                          {renderOtherProductOptions()}
                        </select>
                        {watch('otherProduct1') && otherProductInfo[watch('otherProduct1') || ''] && (
                          <p className="text-sm text-gray-600 mt-1">
                            선택됨: {otherProductInfo[watch('otherProduct1') || ''].code} - {otherProductInfo[watch('otherProduct1') || ''].title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otherProduct2">다른제품 2</Label>
                        <select
                          id="otherProduct2"
                          {...register('otherProduct2')}
                          value={watch('otherProduct2') || ''}
                          disabled={!watchedMonth && !promotion?.month}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            !watchedMonth && !promotion?.month 
                              ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">선택하지 않음</option>
                          {renderOtherProductOptions()}
                        </select>
                        {watch('otherProduct2') && otherProductInfo[watch('otherProduct2') || ''] && (
                          <p className="text-sm text-gray-600 mt-1">
                            선택됨: {otherProductInfo[watch('otherProduct2') || ''].code} - {otherProductInfo[watch('otherProduct2') || ''].title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otherProduct3">다른제품 3</Label>
                        <select
                          id="otherProduct3"
                          {...register('otherProduct3')}
                          value={watch('otherProduct3') || ''}
                          disabled={!watchedMonth && !promotion?.month}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            !watchedMonth && !promotion?.month 
                              ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">선택하지 않음</option>
                          {renderOtherProductOptions()}
                        </select>
                        {watch('otherProduct3') && otherProductInfo[watch('otherProduct3') || ''] && (
                          <p className="text-sm text-gray-600 mt-1">
                            선택됨: {otherProductInfo[watch('otherProduct3') || ''].code} - {otherProductInfo[watch('otherProduct3') || ''].title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otherProduct4">다른제품 4</Label>
                        <select
                          id="otherProduct4"
                          {...register('otherProduct4')}
                          value={watch('otherProduct4') || ''}
                          disabled={!watchedMonth && !promotion?.month}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            !watchedMonth && !promotion?.month 
                              ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">선택하지 않음</option>
                          {renderOtherProductOptions()}
                        </select>
                        {watch('otherProduct4') && otherProductInfo[watch('otherProduct4') || ''] && (
                          <p className="text-sm text-gray-600 mt-1">
                            선택됨: {otherProductInfo[watch('otherProduct4') || ''].code} - {otherProductInfo[watch('otherProduct4') || ''].title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !!codeConflict || !!slugConflict}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? '처리 중...' : (promotion ? '수정' : '등록')}
                </Button>
              </div>
            </>
          )}
        </form>
        {/* 관리자 수정 화면 전용: 리치 텍스트 에디터 라이트 모드 강제 오버라이드 */}
        <style>
          {`
          .admin-force-light .rich-text-editor,
          .admin-force-light .rich-text-editor.fullscreen {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
          }
          .admin-force-light .editor-toolbar,
          .admin-force-light .rich-text-editor.fullscreen .editor-toolbar {
            background-color: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
          .admin-force-light .editor-content {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .admin-force-light .editor-content[data-placeholder]:empty:before {
            color: #9ca3af !important;
          }
          .admin-force-light .color-picker-dropdown {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
          }
          .admin-force-light .toolbar-btn:hover {
            background-color: #e2e8f0 !important;
            color: #1e293b !important;
          }
          `}
        </style>
      </CardContent>
    </Card>
  );
};

export default PromotionForm; 