import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface CustomTag {
  tag: string;
  description: string;
  example: string;
  category: string;
}

interface CustomTagPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect: (tag: string) => void;
}

const CustomTagPopup: React.FC<CustomTagPopupProps> = ({
  isOpen,
  onClose,
  onTagSelect
}) => {
  const customTags: CustomTag[] = [
    {
      tag: '===',
      description: '콘텐츠 그룹 분리',
      example: '그룹1 === 그룹2',
      category: '구분선'
    },
    {
      tag: '---',
      description: '강한 구분선 (두꺼운 그라데이션 가로선)',
      example: '내용1 --- 내용2',
      category: '구분선'
    },
    {
      tag: '...',
      description: '약한 구분선 (점선 가로선)',
      example: '내용1 ... 내용2',
      category: '구분선'
    },
    {
      tag: '<<텍스트>>',
      description: '파란색 소제목 (파란색 배경 둥근 박스)',
      example: '<<특별 혜택>>',
      category: '강조'
    },
    {
      tag: '[[텍스트]]',
      description: '회색 참고사항 (회색 배경 둥근 박스)',
      example: '[[참고사항]]',
      category: '강조'
    },
    {
      tag: '!!텍스트!!',
      description: '분홍색 주의사항 (연한 분홍색 배경)',
      example: '!!중요!!',
      category: '강조'
    },
    {
      tag: '""텍스트""',
      description: '파란색 추가정보 (연한 파란색 배경)',
      example: '""추가 혜택""',
      category: '강조'
    },
    {
      tag: 'https://...',
      description: '자동 링크 (굵은 글씨, 밑줄)',
      example: 'https://example.com',
      category: '링크'
    }
  ];

  const handleTagClick = (tag: string) => {
    onTagSelect(tag);
    onClose();
  };

  const categories = ['구분선', '강조', '링크'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">커스텀 태그 참조</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  {category === '구분선' && '📐 구분선 태그'}
                  {category === '강조' && '🎨 강조 태그'}
                  {category === '링크' && '🔗 링크 태그'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          태그
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          설명
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          사용 예시
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">
                          선택
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customTags
                        .filter((tag) => tag.category === category)
                        .map((tag, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-mono text-sm bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                              {tag.tag}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {tag.description}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {tag.example}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTagClick(tag.tag)}
                                className="text-xs"
                              >
                                선택
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 사용 팁
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 태그는 중첩해서 사용할 수 없습니다.</li>
              <li>• 기본 HTML 태그와 함께 사용 가능합니다.</li>
              <li>• 태그 내부의 공백은 그대로 유지됩니다.</li>
              <li>• 줄바꿈은 자동으로 처리됩니다.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomTagPopup; 