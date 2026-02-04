import React, { useState, useEffect, useCallback } from 'react';
import { Promotion } from '../../types';
import { Button } from '../ui/button';
import { getPromotionsByMonth, bulkCopyPromotions } from '../../services/promotionService';
import { generateRandomAlphabet, transformPromotionForCopy } from '../../utils/promotionCopyUtils';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

interface BulkCopyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (count: number) => void;
}

const BulkCopyDialog: React.FC<BulkCopyDialogProps> = ({ isOpen, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [sourceMonth, setSourceMonth] = useState('');
    const [targetMonth, setTargetMonth] = useState('');
    const [randomPrefix, setRandomPrefix] = useState('');
    const [sourcePromotions, setSourcePromotions] = useState<Promotion[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);

    // 월 옵션 생성 (PromotionForm과 동일한 로직)
    const generateMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = -6; i <= 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const monthStr = month.toString().padStart(2, '0');
            const value = `${year}-${monthStr}`;
            const label = `${year}년 ${month}월`;
            options.push({ value, label });
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    // 초기값 설정
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const currentMonth = format(now, 'yyyy-MM');

            // 지난 달 찾기
            const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonth = format(prevDate, 'yyyy-MM');

            setSourceMonth(prevMonth);
            setTargetMonth(currentMonth);
            setRandomPrefix(generateRandomAlphabet());
        }
    }, [isOpen]);

    // 원본 프로모션 로드 및 미리보기 생성
    const loadPreview = useCallback(async () => {
        if (!sourceMonth || !targetMonth || !randomPrefix) return;

        setIsLoading(true);
        try {
            const result = await getPromotionsByMonth(sourceMonth);
            if (result.success && result.data) {
                setSourcePromotions(result.data);

                // 미리보기 데이터 생성
                const previews = result.data.map(promo => {
                    const transformed = transformPromotionForCopy(promo, targetMonth, randomPrefix);
                    return {
                        id: promo.id,
                        title: promo.title,
                        oldCode: promo.code,
                        newCode: transformed.code,
                        oldSlug: promo.slug,
                        newSlug: transformed.slug
                    };
                });
                setPreviewData(previews);
            } else {
                setSourcePromotions([]);
                setPreviewData([]);
            }
        } catch (error) {
            console.error('Failed to load preview:', error);
        } finally {
            setIsLoading(false);
        }
    }, [sourceMonth, targetMonth, randomPrefix]);

    useEffect(() => {
        if (isOpen && sourceMonth) {
            loadPreview();
        }
    }, [isOpen, sourceMonth, targetMonth, randomPrefix, loadPreview]);

    const handleCopy = async () => {
        if (sourcePromotions.length === 0) {
            toast({
                title: "복사 실패",
                description: "복사할 프로모션이 없습니다.",
                variant: "destructive",
            });
            return;
        }

        if (window.confirm(`${sourceMonth}의 프로모션 ${sourcePromotions.length}개를 ${targetMonth}로 복사하시겠습니까?\n모든 프로모션은 비활성 상태로 생성됩니다.`)) {
            setIsCopying(true);
            try {
                const result = await bulkCopyPromotions(sourceMonth, targetMonth, randomPrefix);
                if (result.success) {
                    toast({
                        title: "복사 완료",
                        description: `${result.data}개의 프로모션이 성공적으로 복사되었습니다.`,
                    });
                    onSuccess(result.data || 0);
                    onClose();
                } else {
                    toast({
                        title: "복사 실패",
                        description: result.error || "복사 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "오류 발생",
                    description: "복사 작업 중 알 수 없는 오류가 발생했습니다.",
                    variant: "destructive",
                });
            } finally {
                setIsCopying(false);
            }
        }
    };

    const handleRefreshPrefix = () => {
        setRandomPrefix(generateRandomAlphabet(randomPrefix));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">프로모션 월별 대량 복사</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-1">원본 월 (가져올 달)</label>
                            <select
                                value={sourceMonth}
                                onChange={(e) => setSourceMonth(e.target.value)}
                                className="w-full p-2 border border-blue-200 rounded bg-white text-sm"
                            >
                                {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-1">대상 월 (생성할 달)</label>
                            <select
                                value={targetMonth}
                                onChange={(e) => setTargetMonth(e.target.value)}
                                className="w-full p-2 border border-blue-200 rounded bg-white text-sm"
                            >
                                {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-1">랜덤 2자리 알파벳</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={randomPrefix}
                                    maxLength={2}
                                    onChange={(e) => setRandomPrefix(e.target.value.toUpperCase())}
                                    className="flex-1 p-2 border border-blue-200 rounded bg-white text-sm font-mono"
                                />
                                <Button variant="outline" size="sm" onClick={handleRefreshPrefix}>새로고침</Button>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 font-medium">
                        * 모든 프로모션은 비활성(Inactive) 상태로 생성되며, 연관 제품 링크는 이번에 복사되는 제품들끼리 자동 매핑됩니다.
                    </p>
                </div>

                <div className="flex-1 overflow-auto mb-6">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="p-2 font-semibold text-gray-700 w-1/4">프로모션 명</th>
                                <th className="p-2 font-semibold text-gray-700">코드 변환</th>
                                <th className="p-2 font-semibold text-gray-700">슬러그 변환</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-gray-500">불러오는 중...</td>
                                </tr>
                            ) : previewData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-gray-500">해당 월에 복사할 프로모션이 없습니다.</td>
                                </tr>
                            ) : (
                                previewData.map(item => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-2 font-medium text-gray-900">{item.title}</td>
                                        <td className="p-2">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 line-through">{item.oldCode}</span>
                                                <span className="text-blue-600 font-medium">{item.newCode}</span>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 line-through text-[10px] truncate max-w-[200px]" title={item.oldSlug}>{item.oldSlug}</span>
                                                <span className="text-green-600 font-medium truncate max-w-[200px]" title={item.newSlug}>{item.newSlug}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3 mt-auto pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isCopying}>취소</Button>
                    <Button
                        onClick={handleCopy}
                        disabled={isCopying || previewData.length === 0}
                        className="bg-green-600 hover:bg-green-700 px-8"
                    >
                        {isCopying ? '복사 중...' : `${previewData.length}개 프로모션 복사 실행`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BulkCopyDialog;
