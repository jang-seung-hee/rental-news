import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';

interface ListItem {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

interface PerformanceOptimizedListProps {
  items: ListItem[];
  renderItem: (item: ListItem, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
}

const PerformanceOptimizedList: React.FC<PerformanceOptimizedListProps> = React.memo(({
  items,
  renderItem,
  className,
  emptyMessage = '데이터가 없습니다.',
  loading = false,
  error = null
}) => {
  const memoizedItems = useMemo(() => items, [items]);

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-red-600 mb-2">오류가 발생했습니다</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  if (memoizedItems.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {memoizedItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
});

PerformanceOptimizedList.displayName = 'PerformanceOptimizedList';

export default PerformanceOptimizedList; 