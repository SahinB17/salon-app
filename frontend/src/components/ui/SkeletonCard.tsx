import { Card } from './Card';

export function SkeletonCard() {
  return (
    <Card className="min-w-[260px] lg:min-w-0 snap-center rounded-2xl overflow-hidden border-0 shadow-sm dark:bg-zinc-900 transition-colors">
      {/* Image placeholder */}
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse w-full relative transition-colors" />
      
      {/* Content placeholder */}
      <div className="p-4 bg-white dark:bg-zinc-900 space-y-4 transition-colors">
        {/* Title */}
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md w-3/4 transition-colors" />
        
        {/* Address */}
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full transition-colors" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md w-1/2 transition-colors" />
        </div>
        
        {/* Rating and Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md w-12 transition-colors" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md w-16 transition-colors" />
        </div>
      </div>
    </Card>
  );
}
