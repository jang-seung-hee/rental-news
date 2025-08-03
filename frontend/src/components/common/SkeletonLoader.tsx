import React from 'react';
import { Skeleton } from '../ui/skeleton';

// 카드 스켈레톤
export const CardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// 테이블 행 스켈레톤
export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-20" />
  </div>
);

// 프로모션 카드 스켈레톤
export const PromotionCardSkeleton: React.FC = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-24" />
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

// 대시보드 통계 카드 스켈레톤
export const StatsCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </div>
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// 폼 스켈레톤
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-32 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// 이미지 스켈레톤
export const ImageSkeleton: React.FC = () => (
  <Skeleton className="w-full h-48 rounded-lg" />
);

// 리스트 스켈레톤
interface ListSkeletonProps {
  count?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
); 